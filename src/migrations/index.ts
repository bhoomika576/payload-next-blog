import * as migration_20260417_042459_initial from './20260417_042459_initial';
import * as migration_20260417_075239 from './20260417_075239';

export const migrations = [
  {
    up: migration_20260417_042459_initial.up,
    down: migration_20260417_042459_initial.down,
    name: '20260417_042459_initial',
  },
  {
    up: migration_20260417_075239.up,
    down: migration_20260417_075239.down,
    name: '20260417_075239'
  },
];
