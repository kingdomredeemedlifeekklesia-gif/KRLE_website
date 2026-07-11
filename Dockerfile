FROM node:20-bullseye-slim

WORKDIR /usr/src/app

# Install dependencies (including dev deps for build)
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

# Copy source
COPY . .

# Ensure Prisma client is generated (no DB changes are applied here)
RUN npx prisma generate || true

# Build the Next.js app
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "run", "start"]
