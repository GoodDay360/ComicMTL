import Storage from '@/constants/module/storage';
import ChapterStorage from '@/constants/module/chapter_storage';
import JSZip from 'jszip';
import {blobToBase64, base64ToBlob, getImageLayout} from "@/constants/module/file_manager";
import * as FileSystem from 'expo-file-system';

export const get_chapter = async (
    SOURCE:string | string[],
    COMIC_ID:string | string[],
    CHAPTER_IDX:number,
) => {
    // return
    console.log(SOURCE,COMIC_ID,CHAPTER_IDX)
    
    const stored_chapter = await ChapterStorage.getByIdx(`${SOURCE}-${COMIC_ID}`,CHAPTER_IDX)   
    if (stored_chapter?.data_state === "completed"){
        const zip = new JSZip();
        const file_keys:Array<any> = []
        const files: { [key: string]: any } = {};

        if (stored_chapter?.data.type === "blob"){
            const zipContent = await zip.loadAsync(stored_chapter?.data.value);
            for (const fileName in zipContent.files) {
                if (zipContent.files[fileName].dir) {
                    continue; // Skip directories
                }
                const fileData = await zipContent.files[fileName].async('base64');
                file_keys.push({type:"image", idx:CHAPTER_IDX, value: `${CHAPTER_IDX}-${fileName}`})
                files[`${CHAPTER_IDX}-${fileName}`] = {
                    layout: await getImageLayout("data:image/png;base64," + fileData),
                    data: "data:image/png;base64," + fileData
                };
                
            }

        }else if (stored_chapter?.data.type === "file_path"){
            
            const base64String = await FileSystem.readAsStringAsync(stored_chapter?.data.value, {
                encoding: FileSystem.EncodingType.Base64,
            });

            const zipContent = await zip.loadAsync(base64String, {base64: true});

            for (const fileName in zipContent.files) {
                if (zipContent.files[fileName].dir) {
                    continue; // Skip directories
                }
                const fileData = await zipContent.files[fileName].async('base64');
                file_keys.push({type:"image", idx:CHAPTER_IDX, value: `${CHAPTER_IDX}-${fileName}`})
                files[`${CHAPTER_IDX}-${fileName}`] = {
                    layout: await getImageLayout("data:image/png;base64," + fileData),
                    data: "data:image/png;base64," + fileData
                };
            }
        }

        file_keys.sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
        return {file_keys: file_keys,files:files}
    }
}