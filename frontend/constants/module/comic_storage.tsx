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
                    store.createIndex('source', 'source', { unique: false });
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
    
    static async store(source: string, id: string, tag: string, info: any): Promise<void> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('dataStore', 'readwrite');
            const store = transaction.objectStore('dataStore');
            const request = store.put({ source, id, tag, info, chapter_requested: [], history:{} });

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }
    
    static async getByID(source: string, id: string): Promise<{ source: string, id: string, tag: string, info: any } | null> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('dataStore', 'readonly');
            const store = transaction.objectStore('dataStore');
            const request = store.get(id); // Query by id

            request.onsuccess = () => {
                const data = request.result;
                if (data && data.source === source) {
                    resolve(data);
                } else {
                    resolve(null);
                }
            };

            request.onerror = () => {
                console.error('Error retrieving item:', request.error);
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

    static async updateChapterQueue(source: string, id: string, new_queue: any): Promise<void> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('dataStore', 'readwrite');
            const store = transaction.objectStore('dataStore');
            const request = store.get(id); // Query by id

            request.onsuccess = () => {
                const data = request.result;
                if (data && data.source === source) { // Check if source matches
                    data.chapter_requested = new_queue;
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

    static async updateInfo(source: string, id: string, new_info: any): Promise<void> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('dataStore', 'readwrite');
            const store = transaction.objectStore('dataStore');
            const request = store.get(id); // Query by id

            request.onsuccess = () => {
                const data = request.result;
                if (data && data.source === source) { // Check if source matches
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

    static async updateHistory(source:string, id: string, history: any): Promise<void> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('dataStore', 'readwrite');
            const store = transaction.objectStore('dataStore');
            const request = store.get(id); // Query by id

            request.onsuccess = () => {
                const data = request.result;
                if (data && data.source === source) { // Check if source matches
                    data.history = history;
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
    

    static async replaceTag(source: string, id: string, new_tag: string): Promise<void> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('dataStore', 'readwrite');
            const store = transaction.objectStore('dataStore');
            const request = store.get(id); // Query by id

            request.onsuccess = () => {
                const data = request.result;
                if (data && data.source === source) { // Check if source matches
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
    
    
    static async removeByID(source: string, id: string): Promise<void> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('dataStore', 'readwrite');
            const store = transaction.objectStore('dataStore');
            const request = store.get(id); // Query by id

            request.onsuccess = () => {
                const data = request.result;
                if (data && data.source === source) { // Check if source matches
                    const deleteRequest = store.delete(id); // Delete the item

                    deleteRequest.onsuccess = () => {
                        resolve();
                    };

                    deleteRequest.onerror = () => {
                        reject(deleteRequest.error);
                    };
                } else {
                    reject(new Error('Item not found or source mismatch'));
                }
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

    public async store(source: string, id: string, tag: string, info: any) {
        try {
            const db = await this.DATABASE;
            await db.runAsync('CREATE TABLE IF NOT EXISTS ComicStorage (id TEXT PRIMARY KEY NOT NULL, source TEXT, tag TEXT, info TEXT, chapter_requested TEXT, history TEXT);');
            await db.runAsync(
                'INSERT OR REPLACE INTO ComicStorage (source, id, tag, info, chapter_requested, history) VALUES (?, ?, ?, ?, ?, ?);', source, id, tag, JSON.stringify(info), JSON.stringify([]), JSON.stringify({})
            );
        } catch (error) {
            console.log(error);
        }
    }

    public async getByID(source: string, id: string) {
        try {
            const db = await this.DATABASE;
            // await db.runAsync("DROP TABLE IF EXISTS ComicStorage;");
            await db.runAsync('CREATE TABLE IF NOT EXISTS ComicStorage (id TEXT PRIMARY KEY NOT NULL, source TEXT, tag TEXT, info TEXT, chapter_requested TEXT, history TEXT);');
            const DATA: any = await db.getFirstAsync(
                'SELECT * FROM ComicStorage WHERE source = ? AND id = ?;', source, id
            );
            if (DATA) return { id: DATA.id, source: DATA.source, tag: DATA.tag, info: JSON.parse(DATA.info), chapter_requested: JSON.parse(DATA.chapter_requested), history: JSON.parse(DATA.history) };
            else return DATA;
        } catch (error) {
            console.log("[Comic Storage - getByID] error:", error);
        }
    }

    public async getByTag(tag: string) {
        try {
            const db = await this.DATABASE;
            await db.runAsync('CREATE TABLE IF NOT EXISTS ComicStorage (id TEXT PRIMARY KEY NOT NULL, source TEXT, tag TEXT, info TEXT, chapter_requested TEXT, history TEXT);');
            const DATA: any = await db.allAsync(
                'SELECT * FROM ComicStorage WHERE tag = ?;', tag
            );

            return DATA.map((row: any) => ({ id: row.id, source: row.source, tag: row.tag, info: JSON.parse(row.info), chapter_requested: JSON.parse(row.chapter_requested), history: JSON.parse(row.history) }));
        } catch (error) {
            console.log(error);
        }
    }

    public async updateChapterQueue(source: string, id: string, chapter_requested: any) {
        try {
            const db = await this.DATABASE;
            await db.runAsync('CREATE TABLE IF NOT EXISTS ComicStorage (id TEXT PRIMARY KEY NOT NULL, source TEXT, tag TEXT, info TEXT, chapter_requested TEXT, history TEXT);');
            await db.runAsync(
                'UPDATE ComicStorage SET chapter_requested = ? WHERE source = ? AND id = ?;', JSON.stringify(chapter_requested), source, id
            );
        } catch (error) {
            console.log(error);
        }
    }

    public async updateInfo(source: string, id: string, info: any) {
        try {
            const db = await this.DATABASE;
            await db.runAsync('CREATE TABLE IF NOT EXISTS ComicStorage (id TEXT PRIMARY KEY NOT NULL, source TEXT, tag TEXT, info TEXT, chapter_requested TEXT, history TEXT);');
            await db.runAsync(
                'UPDATE ComicStorage SET info = ? WHERE source = ? AND id = ?;', JSON.stringify(info), source, id
            );
        } catch (error) {
            console.log(error);
        }
    }

    public async updateHistory(source:string, id: string, history: any): Promise<void> {
        try {
            const db = await this.DATABASE;
            await db.runAsync('CREATE TABLE IF NOT EXISTS ComicStorage (id TEXT PRIMARY KEY NOT NULL, source TEXT, tag TEXT, info TEXT, chapter_requested TEXT, history TEXT);');
            await db.runAsync(
                'UPDATE ComicStorage SET history = ? WHERE source = ? AND id = ?;', JSON.stringify(history), source, id
            );
        } catch (error) {
            console.log(error);
        }
    }

    public async replaceTag(source: string, id: string, new_tag: string) {
        try {
            const db = await this.DATABASE;
            await db.runAsync('CREATE TABLE IF NOT EXISTS ComicStorage (id TEXT PRIMARY KEY NOT NULL, source TEXT, tag TEXT, info TEXT, chapter_requested TEXT, history TEXT);');
            await db.runAsync(
                'UPDATE ComicStorage SET tag = ? WHERE source = ? AND id = ?;', new_tag, source, id
            );
        } catch (error) {
            console.log(error);
        }
    }

    public async removeByID(source: string, id: string) {
        try {
            const db = await this.DATABASE;
            await db.runAsync('CREATE TABLE IF NOT EXISTS ComicStorage (id TEXT PRIMARY KEY NOT NULL, source TEXT, tag TEXT, info TEXT, chapter_requested TEXT, history TEXT);');
            await db.runAsync(
                'DELETE FROM ComicStorage WHERE source = ? AND id = ?;', source, id
            );
        } catch (error) {
            console.log(error);
        }
    }

    public async removeByTag(tag: string) {
        try {
            const db = await this.DATABASE;
            await db.runAsync('CREATE TABLE IF NOT EXISTS ComicStorage (id TEXT PRIMARY KEY NOT NULL, source TEXT, tag TEXT, info TEXT, chapter_requested TEXT, history TEXT);');
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
 * Comic_Storage.store(source: string, id: string, tag: string, info: any): Promise<void>
 * 
 * - Get an item by its ID
 * Comic_Storage.getByID(source: string, id: string): Promise<{ source: string, id: string, id: string, tag: string, info: any }>
 * 
 * - Get all items with a specific tag
 * Comic_Storage.getByTag(tag: string): Promise<{ source: string, id: string, tag: string, info: any }[]>
 * 
 * - Remove an item by its ID
 * Comic_Storage.removeByID(source: string, id: string): Promise<void>
 * 
 * - Remove all items with a specific tag
 * Comic_Storage.removeByTag(tag: string): Promise<void>
 * 
 * - Replace the tag of an item by its ID
 * Comic_Storage.replaceTag(source: string, id: string, new_tag: string): Promise<void>
 * 
 * - Update the info data of an item by its ID but it doesn't add a new item
 * Comic_Storage.updateInfo(source: string, id: string, new_info: any): Promise<void>
 */