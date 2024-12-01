import { Platform } from "react-native";
import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'CoverStorageDB'

class CoverStorage_Web {
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
    
    static async store(id: string, value: any): Promise<void> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
        const transaction = db.transaction('dataStore', 'readwrite');
        const store = transaction.objectStore('dataStore');
        const request = store.put(value, id);
    
        request.onsuccess = () => {
            resolve();
        };
    
        request.onerror = () => {
            reject(request.error);
        };
        });
    }
    
    static async get(id: string): Promise<any> {
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
    
    static async remove(id: string): Promise<void> {
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
}




var CoverStorage:any
if (Platform.OS === "web") {
    CoverStorage = CoverStorage_Web;
}

export default CoverStorage

