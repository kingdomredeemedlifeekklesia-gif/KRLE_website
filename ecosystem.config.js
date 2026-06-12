module.exports = {
  apps: [
    {
      name: "startup-web",
      script: "npx next start",
      cwd: __dirname,
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "startup-scheduler",
      script: "npx tsx scripts/scheduler.ts",
      cwd: __dirname,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
