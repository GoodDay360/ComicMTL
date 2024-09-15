import axios from 'axios';
import dayjs from 'dayjs';

const DATABASE_NAME = 'ImageDB';
const MAX_ROW = 50;
const MAX_AGE = 3; // in days

class ImageStorage {
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
        const timestamp = new Date().toISOString();

        store.put({ link, data, timestamp });

        transaction.onerror = () => {
            console.log('Error storing image:', transaction.error);
        };
    }

    // Get image data
    static async get(link: string): Promise<Blob | null> {
        const db = await this.getDB();
        const transaction = db.transaction('images', 'readonly');
        const store = transaction.objectStore('images');

        return new Promise(async (resolve, reject) => {
            const request = store.get(link);

            request.onsuccess = async () => {
                const result = request.result;

                if (result) {
                    resolve(result.data);
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
                            resolve(data);
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

export default ImageStorage;