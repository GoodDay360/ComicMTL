import axios from 'axios';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';dayjs.extend(utc);
import { Platform } from 'react-native';

import * as SQLite from 'expo-sqlite';
const Buffer = require('buffer/').Buffer


const DATABASE_NAME = 'ImageDB';
const MAX_ROW = 50;
const MAX_AGE = 3; // in days


class ImageStorage_Web {
    private static db: IDBDatabase;

    // Initialize the database
    private static async initDB(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DATABASE_NAME, 1);

            request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains('images')) {
                    db.createObjectStore('images', { keyPath: 'link' });
                }
            };

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                console.log('Error initializing database:', request.error);
                reject(request.error);
            };
        });
    }

    // Get the database instance
    private static async getDB(): Promise<IDBDatabase> {
        if (!this.db) {
            this.db = await this.initDB();
        }
        return this.db;
    }

    // Store image data
    static async store(link: string, data: Blob): Promise<void> {
        const db = await this.getDB();
        const transaction = db.transaction('images', 'readwrite');
        const store = transaction.objectStore('images');
        const timestamp = dayjs().unix();

        store.put({ link, data, timestamp });

        transaction.onerror = () => {
            console.log('Error storing image:', transaction.error);
        };
    }

    // Get image data
    static async get(link: string): Promise<Object | null> {
        const db = await this.getDB();
        const transaction = db.transaction('images', 'readonly');
        const store = transaction.objectStore('images');

        return new Promise(async (resolve, reject) => {
            const request = store.get(link);

            request.onsuccess = async () => {
                const result = request.result;

                if (result) {
                    resolve({type:"blob",data:result.data});
                } else {
                    const countRequest = store.count();

                    countRequest.onsuccess = async () => {
                        if (countRequest.result >= MAX_ROW) {
                            await this.removeOldest();
                        }

                        try {
                            const response = await axios.get(link, { responseType: 'blob' });
                            const data = response.data;
                            await this.store(link, data);
                            await this.removeOldImages()
                            resolve({type:"blob",data:data});
                        } catch (error) {
                            console.log('Error fetching image:', error);
                            reject(error);
                        }
                    };

                    countRequest.onerror = () => {
                        console.log('Error counting images:', countRequest.error);
                        reject(countRequest.error);
                    };
                }
            };

            request.onerror = () => {
                console.log('Error getting image:', request.error);
                reject(request.error);
            };
        });
    }

    // Remove image data
    static async remove(link: string): Promise<void> {
        const db = await this.getDB();
        const transaction = db.transaction('images', 'readwrite');
        const store = transaction.objectStore('images');

        store.delete(link);

        transaction.onerror = () => {
            console.log('Error removing image:', transaction.error);
        };
    }

    // Remove the oldest image data
    private static async removeOldest(): Promise<void> {
        const db = await this.getDB();
        const transaction = db.transaction('images', 'readwrite');
        const store = transaction.objectStore('images');
        const request = store.openCursor();

        request.onsuccess = () => {
            const cursor = request.result;
            if (cursor) {
                store.delete(cursor.key);
                cursor.continue();
            }
        };

        transaction.onerror = () => {
            console.log('Error removing oldest image:', transaction.error);
        };
    }

    // Remove images older than MAX_AGE days
    static async removeOldImages(): Promise<void> {
        const db = await this.getDB();
        const transaction = db.transaction('images', 'readwrite');
        const store = transaction.objectStore('images');
        const request = store.openCursor();

        request.onsuccess = () => {
            const cursor = request.result;
            if (cursor) {
                const record = cursor.value;
                const age = dayjs().diff(dayjs(record.timestamp), 'day');
                if (age > MAX_AGE) {
                    store.delete(cursor.key);
                }
                cursor.continue();
            }
        };

        transaction.onerror = () => {
            console.log('Error removing old images:', transaction.error);
        };
    }
}

class ImageStorage_Mobile {
    private static DATABASE:any = null

    private static async get_database(){
        if (!this.DATABASE) this.DATABASE = await SQLite.openDatabaseAsync(DATABASE_NAME);
        // await db.runAsync('DROP TABLE IF EXISTS images;')
        await this.DATABASE.runAsync(`CREATE TABLE IF NOT EXISTS images (
            link TEXT PRIMARY KEY NOT NULL,
            data TEXT NOT NULL,
            timestamp INTEGER NOT NULL
        );`)
        return this.DATABASE
    }

    static async store(link: string, data: Blob): Promise<void> {
        const db = await this.get_database()
        const timestamp = dayjs().unix();
        
        
        await db.runAsync('INSERT OR REPLACE INTO images (link, data, timestamp) VALUES (?, ?, ?);',link, data, timestamp)
    }

    static async get(link: string) {
        const db = await this.get_database()
        
        const result = await db.getFirstAsync('SELECT * FROM images WHERE link = ?;',link)
        
        if (result) {
            // Image link exists, return the data
            
            return {type:"base64",data:result.data}
        }else{
            const result = await db.getFirstAsync('SELECT COUNT(*) as count FROM images;')
            if (result.count >= MAX_ROW) {
                await db.runAsync('DELETE FROM images WHERE timestamp = (SELECT MIN(timestamp) FROM images);')
            }
            const response = await axios.get(link, {responseType: 'arraybuffer'})
            const data = Buffer.from(response.data, 'binary').toString('base64');
            await this.store(link, data);


            // DELETE images older than MAX_AGE days
            const thresholdDate = dayjs().subtract(MAX_AGE * 24 * 60 * 60, 'second').unix();
            await db.runAsync('DELETE FROM images WHERE timestamp < ?;',thresholdDate);
            
            return {type:"base64",data:data}
        }
    }

    static async remove(link: string) {
        const db = await this.get_database()    
        await db.runAsync('DELETE FROM images WHERE link = ?;',link)
    }
}



var ImageStorage:any
if (Platform.OS === "web"){
    ImageStorage = ImageStorage_Web
}else{
    ImageStorage = ImageStorage_Mobile
}

export default ImageStorage;