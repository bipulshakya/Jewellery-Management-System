import process from 'node:process';
import { getMigrationStatus, runMigrations } from './migrations.js';

async function main() {
  const isStatusOnly = process.argv.includes('--status');

  if (isStatusOnly) {
    const status = await getMigrationStatus();
    console.log(JSON.stringify(status, null, 2));
    return;
  }

  await runMigrations({ log: true });
  const status = await getMigrationStatus();
  console.log(JSON.stringify(status, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
