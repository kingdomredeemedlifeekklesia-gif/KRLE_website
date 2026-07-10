const { spawn } = require('child_process');

const port = process.env.PORT || '3000';
const host = process.env.HOST || '0.0.0.0';

function run(command) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, {
      stdio: 'inherit',
      shell: true,
      env: process.env,
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} exited with code ${code}`));
      }
    });

    child.on('error', reject);
  });
}

(async () => {
  try {
    await run('npx prisma db push --skip-generate --accept-data-loss');
    await run(`npx next start -H ${host} -p ${port}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
