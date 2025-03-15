import { inject } from 'vue';

const db = inject('dbConnection');
export function useDb() {
  if (!db) {
    console.error('Database connection is not initialized.');
  }
  return db;
}