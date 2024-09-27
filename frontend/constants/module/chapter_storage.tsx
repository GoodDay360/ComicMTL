// Most of the code here is generate by intense AI promting.
// If you see any delulu let me know :)

import { Platform } from "react-native";


const DATABASE_NAME = 'ChapterDB';

class Chapter_Storage_Web   {
  private static DATABASE_VERSION: number = 1;

  private static async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DATABASE_NAME, this.DATABASE_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('dataStore')) {
          const store = db.createObjectStore('dataStore', { keyPath: 'id' });
          store.createIndex('item', 'item', { unique: false });
          store.createIndex('index', 'index', { unique: false });
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

  public static async getAll(item: string, [offset, maxRow]: [number, number]): Promise<any[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('dataStore', 'readonly');
      const store = transaction.objectStore('dataStore');
      const index = store.index('index'); // Use the index field for sorting
      const request = index.openCursor();
      const results: any[] = [];
      let skipped = 0;

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          if (cursor.value.item === item) {
            if (skipped < offset) {
              skipped++;
              cursor.continue();
            } else if (results.length < maxRow) {
              results.push(cursor.value);
              cursor.continue();
            } else {
              resolve(results);
            }
          } else {
            cursor.continue();
          }
        } else {
          resolve(results);
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

  public static async add(item: string, index: number, id: string, title: string, data: any): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('dataStore', 'readwrite');
      const store = transaction.objectStore('dataStore');

      const request = store.add({ id, item, index, title, data });

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



var ChapterStorage:any

if (Platform.OS === 'web') {
  ChapterStorage = Chapter_Storage_Web
}

export default ChapterStorage;

/*
- Add data with different items and indexes
await Storage.add('itemA', 1<index>, 'id-123', 'TitleA', { key: 'valueA' });
await Storage.add('itemB', 2, 'id-456', 'TitleB', { key: 'valueB' });
await Storage.add('itemA', 3, 'id-789', 'TitleC', { key: 'valueC' });

- Get all data by item, sorted by index
const dataItemA = await Storage.getAll('itemA', [0, 10]);
const dataItemB = await Storage.getAll('itemB', [0, 10]);

- Get a single data item by item and id
const singleDataItemA = await Storage.get('itemA', 'id-123');
const singleDataItemB = await Storage.get('itemB', 'id-456');

- Drop all data with a specific item
await Storage.drop('itemA');

- Remove data by item and id
await Storage.remove('itemB', 'id-456');


*/

