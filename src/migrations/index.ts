import * as migration_20260417_042459_initial from './20260417_042459_initial';

export const migrations = [
  {
    up: migration_20260417_042459_initial.up,
    down: migration_20260417_042459_initial.down,
    name: '20260417_042459_initial'
  },
];
