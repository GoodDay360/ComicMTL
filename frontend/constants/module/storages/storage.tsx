import { Platform } from "react-native";
import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'StorageDB'

class Storage_Web {
    private static dbPromise: Promise<IDBDatabase>;
    
    private static getDB(): Promise<IDBDatabase> {
        if (!this.dbPromise) {
        this.dbPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(DATABASE_NAME, 2);
    
            request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (db.objectStoreNames.contains('dataStore')) db.deleteObjectStore('dataStore'); 
            db.createObjectStore('dataStore');
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
    
    static async store(key: string, value: any): Promise<void> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
        const transaction = db.transaction('dataStore', 'readwrite');
        const store = transaction.objectStore('dataStore');
        const request = store.put(value, key);
    
        request.onsuccess = () => {
            resolve();
        };
    
        request.onerror = () => {
            reject(request.error);
        };
        });
    }
    
    static async get(key: string): Promise<any> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
        const transaction = db.transaction('dataStore', 'readonly');
        const store = transaction.objectStore('dataStore');
        const request = store.get(key);
    
        request.onsuccess = () => {
            resolve(request.result);
        };
    
        request.onerror = () => {
            reject(request.error);
        };
        });
    }
    
    static async remove(key: string): Promise<void> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
        const transaction = db.transaction('dataStore', 'readwrite');
        const store = transaction.objectStore('dataStore');
        const request = store.delete(key);
    
        request.onsuccess = () => {
            resolve();
        };
    
        request.onerror = () => {
            reject(request.error);
        };
        });
    }
}


class Storage_Native{

    private DATABASE:any
    
    constructor() {
        this.DATABASE = new Promise(async (resolve, reject) => {
            resolve(await SQLite.openDatabaseAsync(DATABASE_NAME))
        })
    
    }
    
    public async store(key: string, value: any) {
        try{
            const db = await this.DATABASE;
            await db.runAsync('CREATE TABLE IF NOT EXISTS storage (key TEXT PRIMARY KEY NOT NULL, value TEXT);')
            await db.runAsync(
                'INSERT OR REPLACE INTO storage (key, value) VALUES (?, ?);', key, JSON.stringify(value)
            );
        }catch(error){console.log(error)}
    }

    public async get(key: string) {
        try {
            const db = await this.DATABASE;
            await db.runAsync('CREATE TABLE IF NOT EXISTS storage (key TEXT PRIMARY KEY NOT NULL, value TEXT);')
            const DATA:any = await db.getFirstAsync(
                'SELECT value FROM storage WHERE key = ?;', key
            )
            
            if (DATA) return JSON.parse(DATA.value)
            else return DATA
        }catch(error){console.log(error)}
    }
    
    public async remove(key: string) {
        try{
            const db = await this.DATABASE;
            await db.runAsync('CREATE TABLE IF NOT EXISTS storage (key TEXT PRIMARY KEY NOT NULL, value TEXT);')
            await db.runAsync(
                'DELETE FROM storage WHERE key = ?;', key
            );
        }catch(error){console.log(error)}
    }
}


var Storage:any
if (Platform.OS === "web") {
  Storage = Storage_Web;
}else{
    Storage = new Storage_Native();
}

export default Storage

