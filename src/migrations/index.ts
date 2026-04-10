import * as migration_20260410_100207 from './20260410_100207';

export const migrations = [
  {
    up: migration_20260410_100207.up,
    down: migration_20260410_100207.down,
    name: '20260410_100207'
  },
];
