// Most of the code here is generate by intense AI promting.
// If you see any delulu let me know :)

import { Platform } from "react-native";
import * as SQLite from 'expo-sqlite';

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

  public static async getAll(item: string): Promise<any[]> {
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
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results.sort((a, b) => a.idx - b.idx));
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

  async getAll(tableName: string): Promise<any[]> {
    await this.initializeDatabase();
    try {
      const allRows:Array<any> = await this.db!.getAllAsync(`SELECT * FROM "${tableName}" ORDER BY idx`);
      return allRows.sort((a, b) => a.idx - b.idx);
    } catch (error) {
      return []; // Return empty array if table does not exist
    }
  }

  async get(tableName: string, id: number): Promise<any | null> {
    await this.initializeDatabase();
    try {
      const firstRow = await this.db!.getFirstAsync(`SELECT * FROM "${tableName}" WHERE id = ?`, [id]);
      return firstRow || null;
    } catch (error) {
      return null; // Return null if table or row does not exist
    }
  }

  async add(tableName: string, idx: number, id: string, title: string, data: string): Promise<void> {
    await this.initializeDatabase();
    try {
      
      await this.db!.runAsync(`CREATE TABLE IF NOT EXISTS "${tableName}" (
          idx INTEGER NOT NULL,
          id TEXT PRIMARY KEY NOT NULL,
          title TEXT NOT NULL,
          data TEXT NOT NULL
        );`);
      
      await this.db!.runAsync(`INSERT INTO "${tableName}" (idx, id, title, data) VALUES (?, ?, ?, ?)`, [idx, id, title, JSON.stringify(data)]);
    } catch (error:any) {
      console.log(error.message)
      throw new Error(`Failed to add data: ${error.message}`);
    }
  }

  async remove(tableName: string, id: number): Promise<void> {
    await this.initializeDatabase();
    try {
      await this.db!.runAsync(`DELETE FROM "${tableName}" WHERE id = ?`, [id]);
    } catch (error:any) {
      throw new Error(`Failed to remove data: ${error.message}`);
    }
  }

  async drop(tableName: string): Promise<void> {
    await this.initializeDatabase();
    try {
      await this.db!.execAsync(`DROP TABLE IF EXISTS "${tableName}"`);
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

