import Storage from '@/constants/module/storages/storage';
import ChapterStorage from '@/constants/module/storages/chapter_storage';
import JSZip from 'jszip';
import {blobToBase64, base64ToBlob, getImageLayout} from "@/constants/module/file_manager";
import * as FileSystem from 'expo-file-system';

export const get_chapter = async (
    SOURCE:string | string[],
    COMIC_ID:string | string[],
    CHAPTER_IDX:number,
) => {

    console.log(SOURCE,COMIC_ID,CHAPTER_IDX)
    
    const DATA = []
    
    const current_stored_chapter = await ChapterStorage.getByIdx(`${SOURCE}-${COMIC_ID}`,CHAPTER_IDX)
    const next_stored_chapter = await ChapterStorage.getByIdx(`${SOURCE}-${COMIC_ID}`,CHAPTER_IDX+1)

    if (current_stored_chapter?.data_state === "completed" && current_stored_chapter?.max_page) {
        for (let i = 1; i < current_stored_chapter.max_page; i++) {
            DATA.push({type:"page",id:`${SOURCE}-${COMIC_ID}-${CHAPTER_IDX}-${i}`, chapter_idx: CHAPTER_IDX})
        }
        if (next_stored_chapter) {
            DATA.push({type:"chapter-info-banner", value:{last:current_stored_chapter.title, next:next_stored_chapter.title}, chapter_idx: CHAPTER_IDX})
        }else{
            DATA.push({type:"no-chapter-banner"})
        }
        DATA.push({type:"chapter-navigate", chapter_idx: CHAPTER_IDX})
        return DATA
    }else{
        return []
    }
}