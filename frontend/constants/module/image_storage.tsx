import axios from 'axios';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';dayjs.extend(utc);
import { Platform } from 'react-native';

import * as SQLite from 'expo-sqlite';

import * as FileSystem from 'expo-file-system';

import blobToBase64 from '@/constants/module/blob_to_base64';


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
                            const response = await axios.get(link, { responseType: 'blob', timeout: 60000 });
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
                const age = dayjs().diff(dayjs.unix(record.timestamp), 'day');
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
    private static DATABASE:any = new Promise(async (resolve, reject) => {
        const _DATABASE = await SQLite.openDatabaseAsync(DATABASE_NAME)
        await _DATABASE.runAsync(`CREATE TABLE IF NOT EXISTS images (
            link TEXT PRIMARY KEY NOT NULL,
            file_path TEXT NOT NULL,
            timestamp INTEGER NOT NULL
        );`)
        resolve(_DATABASE)
    })


    static async store(link: string, file_path: string): Promise<void> {
        const db = await this.DATABASE
        const timestamp = dayjs().unix();
        
        await db.runAsync('INSERT OR REPLACE INTO images (link, file_path, timestamp) VALUES (?, ?, ?);',link, file_path, timestamp)
    }

    static async get(link: string) {
        try{
            const db = await this.DATABASE

            // Remove all unmatched image in sqlite and local
            const file_path_list = (await db.getAllAsync('SELECT file_path FROM images')).map((item:any) => item.file_path);
            

            const dir_path = FileSystem.cacheDirectory + 'ComicMTL/'+ 'cover/';
            const local_file_path_list = (await FileSystem.readDirectoryAsync(dir_path)).map(file => dir_path + file);;
            const result_list = local_file_path_list.filter(item => !file_path_list.includes(item));
            for (const file_path of result_list) {
                try {
                    // Delete the file
                    await FileSystem.deleteAsync(file_path);

                } catch (error) {
                    console.error('#0 Error deleting file from cache:', error);
                }
            }

            const result = await db.getFirstAsync('SELECT * FROM images WHERE link = ?;',link)
            
            if (result) {
                // Image link exists, return the data
                
                return {type:"file_path",data:result.file_path}
            }else{
                const result = await db.getFirstAsync('SELECT COUNT(*) as count FROM images;')
                if (result.count >= MAX_ROW) {
                    const result =await db.getFirstAsync('SELECT * FROM images WHERE timestamp = (SELECT MIN(timestamp) FROM images);')
                    if (result) {
                        try {
                            // Delete the file
                            const filePath = result.file_path;
                            await FileSystem.deleteAsync(filePath);
    
                        } catch (error) {
                            console.error('#1 Error deleting file from cache:', error);
                        }
                        await db.runAsync('DELETE FROM images WHERE timestamp = (SELECT MIN(timestamp) FROM images);')
                    }
                    
                }
                const response = await axios.get(link, { responseType: 'blob', timeout: 60000 });
                const filename = response.headers['content-disposition'].match(/filename="([^"]+)"/)[1]
                const base64:string = await blobToBase64(response.data);
                

                const dir_path = FileSystem.cacheDirectory + "ComicMTL/" + "cover/"
                const dirInfo = await FileSystem.getInfoAsync(dir_path);
                if (!dirInfo.exists) {
                    await FileSystem.makeDirectoryAsync(dir_path, { intermediates: true });
                }
                const file_path = dir_path + filename;
                await FileSystem.writeAsStringAsync(file_path, base64.split(',')[1], {
                    encoding: FileSystem.EncodingType.Base64,
                });
                await this.store(link, file_path);

                // DELETE images older than MAX_AGE days
                const thresholdDate = dayjs().subtract(MAX_AGE * 24 * 60 * 60, 'second').unix();
                const rows = await db.getAllAsync('SELECT * FROM images WHERE timestamp < ?;',thresholdDate);
                for (const row of rows) {
                    const row_file_path = row.file_path;
                    try {
                        // Delete the file
                        await FileSystem.deleteAsync(row_file_path);
                        await db.runAsync('DELETE FROM images WHERE link = ?;',row.link);

                    } catch (error) {
                        console.error('#2 Error deleting file from cache:', error);
                    }
                }
                return {type:"file_path",data:file_path}
            }
        }catch(error){
            console.error(error)
            return {}
        }
    }
}



var ImageStorage:any
if (Platform.OS === "web"){
    ImageStorage = ImageStorage_Web
}else{
    ImageStorage = ImageStorage_Mobile
}

export default ImageStorage;