import { Platform } from "react-native";
import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'ComicStorageDB'

class Comic_Storage_Web {
    private static dbPromise: Promise<IDBDatabase>;
    
    private static getDB(): Promise<IDBDatabase> {
        if (!this.dbPromise) {
            this.dbPromise = new Promise((resolve, reject) => {
                const request = indexedDB.open(DATABASE_NAME, 1);
    
                request.onupgradeneeded = (event) => {
                    const db = (event.target as IDBOpenDBRequest).result;
                    const store = db.createObjectStore('dataStore', { keyPath: 'id' });
                    store.createIndex('tag', 'tag', { unique: false });
                };
    
                request.onsuccess = () => {
                    resolve(request.result);
                };
    
                request.onerror = () => {
                    reject(request.error);
                };
            });
        }
        return this.dbPromise;
    }
    
    static async store(id: string, tag: string, info: any): Promise<void> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('dataStore', 'readwrite');
            const store = transaction.objectStore('dataStore');
            const request = store.put({ id, tag, info });
    
            request.onsuccess = () => {
                resolve();
            };
    
            request.onerror = () => {
                reject(request.error);
            };
        });
    }
    
    static async getByID(id: string): Promise<{ id: string, tag: string, info: any }> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('dataStore', 'readonly');
            const store = transaction.objectStore('dataStore');
            const request = store.get(id);
    
            request.onsuccess = () => {
                resolve(request.result);
            };
    
            request.onerror = () => {
                reject(request.error);
            };
        });
    }
    
    static async getByTag(tag: string): Promise<{ id: string, tag: string, info: any }[]> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('dataStore', 'readonly');
            const store = transaction.objectStore('dataStore');
            const index = store.index('tag');
            const request = index.getAll(tag);
    
            request.onsuccess = () => {
                resolve(request.result);
            };
    
            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    static async updateInfo(id: string, new_info: any): Promise<void> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('dataStore', 'readwrite');
            const store = transaction.objectStore('dataStore');
            const request = store.get(id);
    
            request.onsuccess = () => {
                const data = request.result;
                if (data) {
                    data.info = new_info;
                    const updateRequest = store.put(data);
                    
                    updateRequest.onsuccess = () => {
                        resolve();
                    };
                    
                    updateRequest.onerror = () => {
                        reject(updateRequest.error);
                    };
                } else {
                    reject(new Error('Item not found'));
                }
            };
    
            request.onerror = () => {
                reject(request.error);
            };
        });
    }
    

    static async replaceTag(id: string, new_tag: string): Promise<void> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('dataStore', 'readwrite');
            const store = transaction.objectStore('dataStore');
            const request = store.get(id);
    
            request.onsuccess = () => {
                const data = request.result;
                if (data) {
                    data.tag = new_tag;
                    const updateRequest = store.put(data);
                    
                    updateRequest.onsuccess = () => {
                        resolve();
                    };
                    
                    updateRequest.onerror = () => {
                        reject(updateRequest.error);
                    };
                } else {
                    reject(new Error('Item not found'));
                }
            };
    
            request.onerror = () => {
                reject(request.error);
            };
        });
    }
    
    
    static async removeByID(id: string): Promise<void> {
        const db = await this.getDB();
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
    
    static async removeByTag(tag: string): Promise<void> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('dataStore', 'readwrite');
            const store = transaction.objectStore('dataStore');
            const index = store.index('tag');
            const request = index.openCursor(tag);
    
            request.onsuccess = (event) => {
                const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
                if (cursor) {
                    cursor.delete();
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
}


class Comic_Storage_Native {
    private DATABASE: any;

    constructor() {
        this.DATABASE = new Promise(async (resolve, reject) => {
            resolve(await SQLite.openDatabaseAsync(DATABASE_NAME));
        });
    }

    public async store(id: string, tag: string, info: any) {
        try {
            const db = await this.DATABASE;
            await db.runAsync('CREATE TABLE IF NOT EXISTS ComicStorage (id TEXT PRIMARY KEY NOT NULL, tag TEXT, info TEXT);');
            await db.runAsync(
                'INSERT OR REPLACE INTO ComicStorage (id, tag, info) VALUES (?, ?, ?);', id, tag, JSON.stringify(info)
            );
        } catch (error) {
            console.log(error);
        }
    }

    public async getByID(id: string) {
        try {
            const db = await this.DATABASE;
            await db.runAsync('CREATE TABLE IF NOT EXISTS ComicStorage (id TEXT PRIMARY KEY NOT NULL, tag TEXT, info TEXT);');
            const DATA: any = await db.getFirstAsync(
                'SELECT id, tag, info FROM ComicStorage WHERE id = ?;', id
            );

            if (DATA) return { id: DATA.id, tag: DATA.tag, info: JSON.parse(DATA.info) };
            else return DATA;
        } catch (error) {
            console.log(error);
        }
    }

    public async getByTag(tag: string) {
        try {
            const db = await this.DATABASE;
            await db.runAsync('CREATE TABLE IF NOT EXISTS ComicStorage (id TEXT PRIMARY KEY NOT NULL, tag TEXT, info TEXT);');
            const DATA: any = await db.allAsync(
                'SELECT id, tag, info FROM ComicStorage WHERE tag = ?;', tag
            );

            return DATA.map((row: any) => ({ id: row.id, tag: row.tag, info: JSON.parse(row.info) }));
        } catch (error) {
            console.log(error);
        }
    }

    public async updateInfo(id: string, info: any) {
        try {
            const db = await this.DATABASE;
            await db.runAsync('CREATE TABLE IF NOT EXISTS ComicStorage (id TEXT PRIMARY KEY NOT NULL, tag TEXT, info TEXT);');
            await db.runAsync(
                'UPDATE ComicStorage SET info = ? WHERE id = ?;', JSON.stringify(info), id
            );
        } catch (error) {
            console.log(error);
        }
    }

    public async replaceTag(id: string, new_tag: string) {
        try {
            const db = await this.DATABASE;
            await db.runAsync('CREATE TABLE IF NOT EXISTS ComicStorage (id TEXT PRIMARY KEY NOT NULL, tag TEXT, info TEXT);');
            await db.runAsync(
                'UPDATE ComicStorage SET tag = ? WHERE id = ?;', new_tag, id
            );
        } catch (error) {
            console.log(error);
        }
    }

    public async removeByID(id: string) {
        try {
            const db = await this.DATABASE;
            await db.runAsync('CREATE TABLE IF NOT EXISTS ComicStorage (id TEXT PRIMARY KEY NOT NULL, tag TEXT, info TEXT);');
            await db.runAsync(
                'DELETE FROM ComicStorage WHERE id = ?;', id
            );
        } catch (error) {
            console.log(error);
        }
    }

    public async removeByTag(tag: string) {
        try {
            const db = await this.DATABASE;
            await db.runAsync('CREATE TABLE IF NOT EXISTS ComicStorage (id TEXT PRIMARY KEY NOT NULL, tag TEXT, info TEXT);');
            await db.runAsync(
                'DELETE FROM ComicStorage WHERE tag = ?;', tag
            );
        } catch (error) {
            console.log(error);
        }
    }
}



var ComicStorage:any
if (Platform.OS === "web") {
    ComicStorage = Comic_Storage_Web;
}else{
    ComicStorage = new Comic_Storage_Native();
}

export default ComicStorage

// ... (class implementation)

/**
 * Functions available in Comic_Storage class:
 * 
 * - Store a new item or update an existing item
 * Comic_Storage.store(id: string, tag: string, info: any): Promise<void>
 * 
 * - Get an item by its ID
 * Comic_Storage.getByID(id: string): Promise<{ id: string, tag: string, info: any }>
 * 
 * - Get all items with a specific tag
 * Comic_Storage.getByTag(tag: string): Promise<{ id: string, tag: string, info: any }[]>
 * 
 * - Remove an item by its ID
 * Comic_Storage.removeByID(id: string): Promise<void>
 * 
 * - Remove all items with a specific tag
 * Comic_Storage.removeByTag(tag: string): Promise<void>
 * 
 * - Replace the tag of an item by its ID
 * Comic_Storage.replaceTag(id: string, new_tag: string): Promise<void>
 * 
 * - Update the info data of an item by its ID but it doesn't add a new item
 * Comic_Storage.updateInfo(id: string, new_info: any): Promise<void>
 */