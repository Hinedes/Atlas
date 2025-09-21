declare module 'sqlite-vss' {
  import { Database } from 'better-sqlite3';
  export function load(db: Database): void;
}
