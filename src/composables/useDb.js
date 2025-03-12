import { inject } from 'vue';

export function useDb() {
  const db = inject('dbConnection');
  if (!db) {
    console.error('Database connection is not initialized.');
  }
  return db;
}