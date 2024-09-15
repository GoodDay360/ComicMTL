import { Platform } from "react-native";
import * as SQLite from 'expo-sqlite';
import ImageStorage from "./image_storage";

const DATABASE_NAME = 'Storage'

class Storage_Web {
    private static dbPromise: Promise<IDBDatabase>;
    
    private static getDB(): Promise<IDBDatabase> {
        if (!this.dbPromise) {
        this.dbPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(DATABASE_NAME, 1);
    
            request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            db.createObjectStore('keyval');
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
        const transaction = db.transaction('keyval', 'readwrite');
        const store = transaction.objectStore('keyval');
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
        const transaction = db.transaction('keyval', 'readonly');
        const store = transaction.objectStore('keyval');
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
        const transaction = db.transaction('keyval', 'readwrite');
        const store = transaction.objectStore('keyval');
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

class Storage_Mobile{

    static async store(key: string, value: any): Promise<void> {
        try{
            const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
            await db.runAsync('CREATE TABLE IF NOT EXISTS storage (key TEXT PRIMARY KEY NOT NULL, value TEXT);')
            await db.runAsync(
                'INSERT OR REPLACE INTO storage (key, value) VALUES (?, ?);', key, value
            );
            await db.closeAsync();
        }catch(error){console.log(error)}
    }

    static async get(key: string): Promise<any> {
        try {
            const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
            await db.runAsync('CREATE TABLE IF NOT EXISTS storage (key TEXT PRIMARY KEY NOT NULL, value TEXT);')
            const DATA:any = await db.getFirstAsync(
                'SELECT value FROM storage WHERE key = ?;', key
            )
            
            if (DATA) return DATA.value
            else return DATA
        }catch(error){console.log(error)}
    }
    
    static async remove(key: string): Promise<void> {
        try{
            const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
            await db.runAsync('CREATE TABLE IF NOT EXISTS storage (key TEXT PRIMARY KEY NOT NULL, value TEXT);')
            await db.runAsync(
                'DELETE FROM storage WHERE key = ?;', key
            );
            await db.closeAsync();
        }catch(error){console.log(error)}
    }
}


var Storage:any
if (Platform.OS === "web") {
  Storage = Storage_Web;
}else{
    Storage = Storage_Mobile;
}

export default Storage

