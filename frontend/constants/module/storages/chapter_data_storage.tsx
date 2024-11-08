import { Platform } from "react-native";
import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'ChapterDataStorageDB'

class Chapter_Data_Storage_Web {
    private static dbPromise: Promise<IDBDatabase>;
    
    private static getDB(): Promise<IDBDatabase> {
        if (!this.dbPromise) {
            this.dbPromise = new Promise((resolve, reject) => {
                const request = indexedDB.open(DATABASE_NAME, 1);
    
                request.onupgradeneeded = (event) => {
                    const db = (event.target as IDBOpenDBRequest).result;

                    if (db.objectStoreNames.contains('dataStore')) db.deleteObjectStore('dataStore'); 

                    const store = db.createObjectStore('dataStore', { keyPath: 'id' });
                    store.createIndex('comic_id', 'comic_id', { unique: false });
                    store.createIndex('chapter_idx', 'chapter_idx', { unique: false });
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
    
    static async store(id: string, comic_id:string, chapter_idx: number, data:any, layout:any ): Promise<void> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('dataStore', 'readwrite');
            const store = transaction.objectStore('dataStore');
            const request = store.put({ id, comic_id, chapter_idx, data, layout });

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }
    
    static async get(id: string): Promise<{id: string, comic_id: string, chapter_idx: number, data: any } | null> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('dataStore', 'readonly');
            const store = transaction.objectStore('dataStore');
            const request = store.get(id); // Query by id

            request.onsuccess = () => {
                const data = request.result;
                if (data) {
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
    static async removeByID(id: string): Promise<void> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('dataStore', 'readwrite');
            const store = transaction.objectStore('dataStore');
            const request = store.delete(id); // Delete the item
            request.onsuccess = () => {
                resolve();
            };
            request.onerror = () => {
                reject(request.error);
            };
            request.onerror = () => {
                reject(request.error);
            };
        });
    }
    
    static async removeByComicID(comic_id: string): Promise<void> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('dataStore', 'readwrite');
            const store = transaction.objectStore('dataStore');
            const index = store.index('comic_id');
            const request = index.openCursor(comic_id);
    
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


class Chapter_Data_Storage_Native {
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



var ChapterDataStorage:any
if (Platform.OS === "web") {
    ChapterDataStorage = Chapter_Data_Storage_Web;
}else{
    ChapterDataStorage = new Chapter_Data_Storage_Native();
}

export default ChapterDataStorage;

