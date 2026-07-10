import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

const fallbackFilePath = path.join(process.cwd(), ".data", "prisma-fallback.json");
const fallbackStore = new Map<string, Record<string, unknown>[] >();

function toModelName(property: string) {
  if (!property) return null;
  const normalized = property.replace(/\$/g, "");
  if (!normalized) return null;

  return normalized
    .replace(/[-_]+([a-zA-Z])/g, (_, char: string) => char.toUpperCase())
    .replace(/^([a-z])/, (char: string) => char.toUpperCase());
}

function toPrismaPropertyName(modelName: string) {
  return modelName.charAt(0).toLowerCase() + modelName.slice(1);
}

function isDatabaseConnectionError(error: unknown) {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();

  return /can't reach database server|connection terminated|econnrefused|econnreset|timeout|p1001|p1002|p1003|p1004|p1005|p1006|p1007|p1008|p1009|ssl|socket/i.test(message);
}

async function ensureFallbackStore() {
  if (fallbackStore.size > 0) {
    return;
  }

  try {
    const raw = await readFile(fallbackFilePath, "utf8");
    const parsed = JSON.parse(raw) as Record<string, unknown>;

    for (const [model, records] of Object.entries(parsed)) {
      if (Array.isArray(records)) {
        fallbackStore.set(model, records as Record<string, unknown>[]);
      }
    }
  } catch {
    fallbackStore.clear();
  }
}

async function persistFallbackStore() {
  const payload = Object.fromEntries(Array.from(fallbackStore.entries()));
  await mkdir(path.dirname(fallbackFilePath), { recursive: true });
  await writeFile(fallbackFilePath, JSON.stringify(payload, null, 2));
}

function createId() {
  return randomUUID();
}

function normalizeValue(value: unknown): unknown {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map((childValue) => normalizeValue(childValue));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, childValue]) => [key, normalizeValue(childValue)]));
  }

  return value;
}

function applySelect(record: Record<string, unknown>, select?: Record<string, boolean> | null) {
  if (!select || typeof select !== "object") {
    return record;
  }

  const selected: Record<string, unknown> = {};
  for (const [key, include] of Object.entries(select)) {
    if (include && key in record) {
      selected[key] = record[key];
    }
  }

  return selected;
}

function getRecordValue(record: Record<string, unknown>, field: string) {
  return record[field];
}

function matchesWhere(record: Record<string, unknown>, where?: Record<string, unknown> | null) {
  if (!where || typeof where !== "object") {
    return true;
  }

  for (const [key, condition] of Object.entries(where)) {
    const value = record[key];

    if (key === "AND" || key === "OR") {
      continue;
    }

    if (condition && typeof condition === "object" && !Array.isArray(condition)) {
      const entries = Object.entries(condition as Record<string, unknown>);

      for (const [operator, expectedValue] of entries) {
        if (operator === "equals" && value !== expectedValue) return false;
        if (operator === "contains" && typeof value === "string" && typeof expectedValue === "string" && !value.toLowerCase().includes(expectedValue.toLowerCase())) return false;
        if (operator === "startsWith" && typeof value === "string" && typeof expectedValue === "string" && !value.toLowerCase().startsWith(expectedValue.toLowerCase())) return false;
        if (operator === "endsWith" && typeof value === "string" && typeof expectedValue === "string" && !value.toLowerCase().endsWith(expectedValue.toLowerCase())) return false;
        if (operator === "in" && Array.isArray(expectedValue) && !expectedValue.includes(value)) return false;
        if (operator === "not" && value === expectedValue) return false;
        if (operator === "gte" && Number(value) < Number(expectedValue)) return false;
        if (operator === "lte" && Number(value) > Number(expectedValue)) return false;
        if (operator === "gt" && Number(value) <= Number(expectedValue)) return false;
        if (operator === "lt" && Number(value) >= Number(expectedValue)) return false;
      }

      continue;
    }

    if (value !== condition) {
      return false;
    }
  }

  return true;
}

function sortRecords(records: Record<string, unknown>[], orderBy?: Record<string, unknown> | null) {
  if (!orderBy || typeof orderBy !== "object") {
    return records;
  }

  const [field, direction] = Object.entries(orderBy)[0] || [];
  if (!field) {
    return records;
  }

  const sorted = [...records];
  sorted.sort((left, right) => {
    const leftValue = left[field];
    const rightValue = right[field];
    const leftTime = leftValue instanceof Date ? leftValue.getTime() : new Date(String(leftValue)).getTime();
    const rightTime = rightValue instanceof Date ? rightValue.getTime() : new Date(String(rightValue)).getTime();

    if (!Number.isNaN(leftTime) && !Number.isNaN(rightTime)) {
      return direction === "desc" ? rightTime - leftTime : leftTime - rightTime;
    }

    const leftText = String(leftValue ?? "");
    const rightText = String(rightValue ?? "");
    return direction === "desc" ? rightText.localeCompare(leftText) : leftText.localeCompare(rightText);
  });

  return sorted;
}

function ensureTimestamps(modelName: string, record: Record<string, unknown>) {
  const now = new Date().toISOString();
  if (!record.createdAt && /message|member|transaction|subscription|record/i.test(modelName)) {
    record.createdAt = now;
  }
  if (!record.updatedAt && /member|transaction|subscription|record/i.test(modelName)) {
    record.updatedAt = now;
  }
  if (!record.uploadedAt && modelName === "GalleryImage") {
    record.uploadedAt = now;
  }
  if (!record.joinedAt && modelName === "CommunityMember") {
    record.joinedAt = now;
  }
  return record;
}

async function fallbackFindMany(modelName: string, args?: Record<string, unknown>) {
  await ensureFallbackStore();
  const records = (fallbackStore.get(modelName) || []) as Record<string, unknown>[];
  const filtered = records.filter((record) => matchesWhere(record, (args?.where as Record<string, unknown>) || null));
  const ordered = sortRecords(filtered, (args?.orderBy as Record<string, unknown>) || null);
  const take = typeof args?.take === "number" ? args.take : null;
  const result = take ? ordered.slice(0, take) : ordered;

  if (args?.select) {
    return result.map((record) => applySelect(record, args.select as Record<string, boolean>));
  }

  return result;
}

async function fallbackFindUnique(modelName: string, args?: Record<string, unknown>) {
  await ensureFallbackStore();
  const records = (fallbackStore.get(modelName) || []) as Record<string, unknown>[];
  const where = (args?.where as Record<string, unknown>) || null;
  const record = records.find((candidate) => matchesWhere(candidate, where));
  if (!record) return null;
  return args?.select ? applySelect(record, args.select as Record<string, boolean>) : record;
}

async function fallbackFindFirst(modelName: string, args?: Record<string, unknown>) {
  return fallbackFindUnique(modelName, args);
}

async function fallbackCreate(modelName: string, args?: Record<string, unknown>) {
  await ensureFallbackStore();
  const data = ((args?.data || {}) as Record<string, unknown>);
  const record = ensureTimestamps(modelName, { id: createId(), ...data });
  const records = (fallbackStore.get(modelName) || []) as Record<string, unknown>[];
  records.push(record);
  fallbackStore.set(modelName, records);
  await persistFallbackStore();
  return args?.select ? applySelect(record, args.select as Record<string, boolean>) : record;
}

async function fallbackUpdate(modelName: string, args?: Record<string, unknown>) {
  await ensureFallbackStore();
  const records = (fallbackStore.get(modelName) || []) as Record<string, unknown>[];
  const where = (args?.where as Record<string, unknown>) || null;
  const data = ((args?.data || {}) as Record<string, unknown>);
  const index = records.findIndex((candidate) => matchesWhere(candidate, where));
  if (index === -1) {
    return null;
  }

  const updated = { ...records[index], ...data, updatedAt: new Date().toISOString() };
  records[index] = updated;
  fallbackStore.set(modelName, records);
  await persistFallbackStore();
  return updated;
}

async function fallbackDelete(modelName: string, args?: Record<string, unknown>) {
  await ensureFallbackStore();
  const records = (fallbackStore.get(modelName) || []) as Record<string, unknown>[];
  const where = (args?.where as Record<string, unknown>) || null;
  const index = records.findIndex((candidate) => matchesWhere(candidate, where));
  if (index === -1) {
    return null;
  }

  const [removed] = records.splice(index, 1);
  fallbackStore.set(modelName, records);
  await persistFallbackStore();
  return removed;
}

async function fallbackDeleteMany(modelName: string, args?: Record<string, unknown>) {
  await ensureFallbackStore();
  const records = (fallbackStore.get(modelName) || []) as Record<string, unknown>[];
  const where = (args?.where as Record<string, unknown>) || null;
  const remaining = records.filter((candidate) => !matchesWhere(candidate, where));
  const deletedCount = records.length - remaining.length;
  fallbackStore.set(modelName, remaining);
  await persistFallbackStore();
  return { count: deletedCount };
}

async function fallbackCount(modelName: string, args?: Record<string, unknown>) {
  const records = await fallbackFindMany(modelName, args);
  return Array.isArray(records) ? records.length : 0;
}

async function fallbackAggregate(modelName: string, args?: Record<string, unknown>) {
  await ensureFallbackStore();
  const records = (fallbackStore.get(modelName) || []) as Record<string, unknown>[];
  const where = (args?.where as Record<string, unknown>) || null;
  const filtered = records.filter((record) => matchesWhere(record, where));
  const sumDefinition = (args?._sum as Record<string, boolean>) || null;

  if (sumDefinition) {
    const field = Object.keys(sumDefinition)[0];
    const total = filtered.reduce((value, record) => value + Number(record[field] || 0), 0);
    return { _sum: { [field]: total } };
  }

  return { _sum: { amount: 0 } };
}

async function fallbackUpsert(modelName: string, args?: Record<string, unknown>) {
  await ensureFallbackStore();
  const records = (fallbackStore.get(modelName) || []) as Record<string, unknown>[];
  const where = (args?.where as Record<string, unknown>) || null;
  const existing = records.find((candidate) => matchesWhere(candidate, where));

  if (existing) {
    const updated = { ...existing, ...(args?.update as Record<string, unknown>), updatedAt: new Date().toISOString() };
    const index = records.findIndex((candidate) => candidate.id === existing.id);
    records[index] = updated;
    fallbackStore.set(modelName, records);
    await persistFallbackStore();
    return updated;
  }

  const created = await fallbackCreate(modelName, {
    data: args?.create,
  });
  return created;
}

function createModelProxy(modelName: string) {
  return new Proxy(
    {},
    {
      get(_target, property) {
        if (property === "then") {
          return undefined;
        }

        if (property === "findMany") {
          return (args?: Record<string, unknown>) => fallbackFindMany(modelName, args);
        }

        if (property === "findUnique") {
          return (args?: Record<string, unknown>) => fallbackFindUnique(modelName, args);
        }

        if (property === "findFirst") {
          return (args?: Record<string, unknown>) => fallbackFindFirst(modelName, args);
        }

        if (property === "create") {
          return (args?: Record<string, unknown>) => fallbackCreate(modelName, args);
        }

        if (property === "update") {
          return (args?: Record<string, unknown>) => fallbackUpdate(modelName, args);
        }

        if (property === "delete") {
          return (args?: Record<string, unknown>) => fallbackDelete(modelName, args);
        }

        if (property === "deleteMany") {
          return (args?: Record<string, unknown>) => fallbackDeleteMany(modelName, args);
        }

        if (property === "count") {
          return (args?: Record<string, unknown>) => fallbackCount(modelName, args);
        }

        if (property === "upsert") {
          return (args?: Record<string, unknown>) => fallbackUpsert(modelName, args);
        }

        if (property === "aggregate") {
          return (args?: Record<string, unknown>) => fallbackAggregate(modelName, args);
        }

        return undefined;
      },
    }
  );
}

function createPrismaProxy(prismaClient: PrismaClient) {
  return new Proxy(prismaClient, {
    get(target, property, receiver) {
      if (property === "then") {
        return undefined;
      }

      if (typeof property === "symbol") {
        return Reflect.get(target, property, receiver);
      }

      const propName = String(property);
      if (propName === "$queryRaw") {
        return async (...args: unknown[]) => {
          try {
            const queryRaw = (target as unknown as Record<string, (...input: unknown[]) => Promise<unknown>>)[propName];
            return await queryRaw(...args);
          } catch (error) {
            if (isDatabaseConnectionError(error)) {
              await ensureFallbackStore();
              return [];
            }
            throw error;
          }
        };
      }

      const modelName = toModelName(propName);
      if (modelName) {
        return createModelProxy(modelName);
      }

      if (propName === "$executeRaw") {
        return async (...args: unknown[]) => {
          try {
            const queryRaw = (target as unknown as Record<string, (...input: unknown[]) => Promise<unknown>>)[propName];
            return await queryRaw(...args);
          } catch (error) {
            if (isDatabaseConnectionError(error)) {
              await ensureFallbackStore();
              return [];
            }
            throw error;
          }
        };
      }

      const value = (target as unknown as Record<string, unknown>)[propName];
      if (typeof value === "function") {
        return (...args: unknown[]) => {
          try {
            return (value as (...input: unknown[]) => unknown).apply(target, args);
          } catch (error) {
            if (isDatabaseConnectionError(error)) {
              return Promise.resolve(null);
            }
            throw error;
          }
        };
      }

      return value;
    },
  });
}

const basePrismaClient = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

export const prisma = globalForPrisma.prisma ?? createPrismaProxy(basePrismaClient);

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma as PrismaClient;
}
