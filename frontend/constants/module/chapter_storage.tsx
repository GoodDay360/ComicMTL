// Most of the code here is generate by intense AI promting.
// If you see any delulu let me know :)

import { Platform } from "react-native";
import * as SQLite from 'expo-sqlite';
import { ensure_safe_table_name } from "./ensure_safe_table_name";

const DATABASE_NAME = 'ChapterDB';

class Chapter_Storage_Web  {
  private static DATABASE_VERSION: number = 1;

  private static async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DATABASE_NAME, this.DATABASE_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('dataStore')) {
          const store = db.createObjectStore('dataStore', { keyPath: 'id' });
          store.createIndex('item', 'item', { unique: false });
          store.createIndex('idx', 'idx', { unique: false });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  public static async getAll(item: string, options?: { exclude_fields?: string[] }): Promise<any[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('dataStore', 'readonly');
        const store = transaction.objectStore('dataStore');
        const index = store.index('item');
        const request = index.openCursor(IDBKeyRange.only(item));
        const results: any[] = [];

        request.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
            if (cursor) {
                const value = cursor.value;
                if (options?.exclude_fields) {
                    options.exclude_fields.forEach(field => {
                        if (value.hasOwnProperty(field)) {
                            delete value[field];
                        }
                    });
                }
                results.push(value);
                cursor.continue();
            } else {
                resolve(results.sort((a, b) => a.idx - b.idx).reverse());
            }
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
  }



  public static async get(item: string, id: string): Promise<any | null> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('dataStore', 'readonly');
      const store = transaction.objectStore('dataStore');
      const request = store.get(id);

      request.onsuccess = (event) => {
        const result = (event.target as IDBRequest<any>).result;
        if (result && result.item === item) {
          resolve(result);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  public static async add(item: string, idx: number, id: string, title: string, data: any): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('dataStore', 'readwrite');
      const store = transaction.objectStore('dataStore');

      const request = store.add({ id, item, idx, title, data });

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }
  public static async update(item: string, id: string, newData: any): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('dataStore', 'readwrite');
      const store = transaction.objectStore('dataStore');
      const index = store.index('item');
      const request = index.openCursor(IDBKeyRange.only(item));

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          if (cursor.value.id === id) {
            cursor.value.data = newData; // Directly modify the data field
            const updateRequest = cursor.update(cursor.value);

            updateRequest.onsuccess = () => {
              resolve();
            };

            updateRequest.onerror = () => {
              reject(updateRequest.error);
            };
          } else {
            cursor.continue();
          }
        } else {
          reject(new Error('Item not found'));
        }
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  public static async drop(item: string): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('dataStore', 'readwrite');
      const store = transaction.objectStore('dataStore');
      const index = store.index('item');
      const request = index.openCursor(IDBKeyRange.only(item));

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          store.delete(cursor.primaryKey);
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  public static async remove(item: string, id: string): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('dataStore', 'readwrite');
      const store = transaction.objectStore('dataStore');

      const request = store.delete(id);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }
}



class Chapter_Storage_Native {
  private db:any;

  constructor() {
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    if (!this.db) {
      this.db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    }
  }

  async getAll(tableName: string, options?: { exclude_fields?: string[] }): Promise<any[]> {
    await this.initializeDatabase();
    try {
      const excludeFields = options?.exclude_fields;
  
      if (excludeFields && excludeFields.length > 0) {
        // Get all column names from the table
        const columnsResult = await this.db!.getAllAsync(`PRAGMA table_info("${ensure_safe_table_name(tableName)}")`);
        const columns = columnsResult.map((col: any) => col.name);
  
        // Exclude the specified fields if provided
        const selectedColumns = columns.filter((col: any) => !excludeFields.includes(col));
  
        // Construct the SELECT query with the selected columns
        const query = `SELECT ${selectedColumns.join(', ')} FROM "${ensure_safe_table_name(tableName)}" ORDER BY idx`;
        const allRows: Array<any> = await this.db!.getAllAsync(query);
  
        return allRows.sort((a, b) => a.idx - b.idx).reverse();
      } else {
        // If no fields to exclude, select all columns
        const allRows: Array<any> = await this.db!.getAllAsync(`SELECT * FROM "${ensure_safe_table_name(tableName)}" ORDER BY idx`);
        return allRows.sort((a, b) => a.idx - b.idx).reverse();
      }
    } catch (error) {
      return []; // Return empty array if table does not exist
    }
  }
  
  

  async get(tableName: string, id: number): Promise<any | null> {
    await this.initializeDatabase();
    try {
      const firstRow = await this.db!.getFirstAsync(`SELECT * FROM "${ensure_safe_table_name(tableName)}" WHERE id = ?`, [id]);
      return firstRow || null;
    } catch (error) {
      return null; // Return null if table or row does not exist
    }
  }

  async add(tableName: string, idx: number, id: string, title: string, data: string): Promise<void> {
    await this.initializeDatabase();
    try {
      
      await this.db!.runAsync(`CREATE TABLE IF NOT EXISTS "${ensure_safe_table_name(tableName)}" (
          idx INTEGER NOT NULL,
          id TEXT PRIMARY KEY NOT NULL,
          title TEXT NOT NULL,
          data TEXT NOT NULL
        );`);
      
      await this.db!.runAsync(`INSERT INTO "${ensure_safe_table_name(tableName)}" (idx, id, title, data) VALUES (?, ?, ?, ?)`, [idx, id, title, JSON.stringify(data)]);
    } catch (error:any) {
      console.log(error.message)
      throw new Error(`Failed to add data: ${error.message}`);
    }
  }

  async update(tableName: string, id: string, data: string): Promise<void> {
    await this.initializeDatabase();
    try {
      const query = `UPDATE "${ensure_safe_table_name(tableName)}" SET data = ? WHERE id = ?`;
      await this.db!.runAsync(query, [JSON.stringify(data), id]);
    } catch (error: any) {
      console.log(error.message);
      throw new Error(`Failed to update data: ${error.message}`);
    }
  }

  async remove(tableName: string, id: number): Promise<void> {
    await this.initializeDatabase();
    try {
      await this.db!.runAsync(`DELETE FROM "${ensure_safe_table_name(tableName)}" WHERE id = ?`, [id]);
    } catch (error:any) {
      throw new Error(`Failed to remove data: ${error.message}`);
    }
  }

  async drop(tableName: string): Promise<void> {
    await this.initializeDatabase();
    try {
      await this.db!.execAsync(`DROP TABLE IF EXISTS "${ensure_safe_table_name(tableName)}"`);
    } catch (error:any) {
      throw new Error(`Failed to drop table: ${error.message}`);
    }
  }
}






var ChapterStorage:any

if (Platform.OS === 'web') {
  ChapterStorage = Chapter_Storage_Web
}else{
  ChapterStorage = new Chapter_Storage_Native()
}

export default ChapterStorage;








/*
- Add data with different items and indexes
await ChapterStorage.add('itemA', 1<index>, 'id-123', 'TitleA', { key: 'valueA' });
await ChapterStorage.add('itemB', 2, 'id-456', 'TitleB', { key: 'valueB' });
await ChapterStorage.add('itemA', 3, 'id-789', 'TitleC', { key: 'valueC' });

- Get all data by item, sorted by index
const dataItemA = await ChapterStorage.getAll('itemA');
const dataItemB = await ChapterStorage.getAll('itemB');

- Get a single data item by item and id
const singleDataItemA = await ChapterStorage.get('itemA', 'id-123');
const singleDataItemB = await ChapterStorage.get('itemB', 'id-456');

- Drop all data with a specific item
await ChapterStorage.drop('itemA');

- Remove data by item and id
await ChapterStorage.remove('itemB', 'id-456');


*/

