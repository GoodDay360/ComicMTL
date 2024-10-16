import axios from 'axios';
import JSZip from 'jszip';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

import translator from '@/constants/module/translator';
import Storage from '@/constants/module/storage';
import ComicStorage from '@/constants/module/comic_storage';
import ImageCacheStorage from '@/constants/module/image_cache_storage';
import ChapterStorage from '@/constants/module/chapter_storage';
import {blobToBase64} from '@/constants/module/file_manager';



export const get = async (setShowCloudflareTurnstile:any,setIsLoading:any,signal:AbortSignal,translate:any,setFeedBack:any,source:any,id:any,SET_CONTENT:any) => {
    const API_BASE = await Storage.get("IN_USE_API_BASE")
    axios({
        method: 'post',
        url: `${API_BASE}/api/web_scrap/get/`,
        headers: {
            'X-CLOUDFLARE-TURNSTILE-TOKEN': await Storage.get("cloudflare-turnstile-token")
        },
        data: {
            id:id,
            source:source,
        },
        timeout: 60000,
        signal:signal,
    }).then((response) => {(async () =>{
        const DATA = response.data.data
        if (Object.keys(DATA).length) setFeedBack("")
        else{
            setFeedBack("No content found!")
            return
        }

        DATA["cover"] = {uri:`${API_BASE}${DATA.cover}`}
        DATA["category"] = DATA.category.join(" | ")
        
        if (translate.state){
            DATA["title"] = await translator(translate.from,translate.to,DATA.title)
            DATA["author"] = await translator(translate.from,translate.to,DATA.author)
            DATA["status"] = await translator(translate.from,translate.to,DATA.status)
            DATA["category"] = await translator(translate.from,translate.to,DATA.category)
            DATA["synopsis"] = await translator(translate.from,translate.to,DATA.synopsis)
            SET_CONTENT(DATA)
        }
        else {
            SET_CONTENT(DATA)
        }
        

        // Store in local if bookmarked.
        const stored_comic = await ComicStorage.getByID(source,DATA.id)
        if (stored_comic) {
            const cover_result:any = await store_comic_cover(setShowCloudflareTurnstile,signal,source,id,DATA)
            await ComicStorage.updateInfo(source,DATA.id, {
                cover:cover_result,
                title:DATA.title,
                author:DATA.author,
                category:DATA.category,
                status:DATA.status,
                synopsis:DATA.synopsis,
                updated:DATA.updated,
            })
            for (const chapter of DATA.chapters) {
                const stored_chapter = await ChapterStorage.get(`${source}-${DATA.id}`,chapter.id)
                if (!stored_chapter) await ChapterStorage.add(`${source}-${DATA.id}`, chapter.idx, chapter.id, chapter.title, {});
            }
        }
        setIsLoading(false)
    })()}).catch((error) => {
        console.log(error)
        
        if (error.status === 511) setShowCloudflareTurnstile(true)
        setFeedBack("Error unable to fetch data! Try request again.")
        setIsLoading(false)
    })
}


export const store_comic_cover = async (
    setShowCloudflareTurnstile:any,
    signal:any,
    source:string | string[],
    comic_id:string| string[],
    CONTENT:any
) => {
    const result = await ImageCacheStorage.get(setShowCloudflareTurnstile,CONTENT.cover.uri,signal);
    if (result.type === "file_path"){
        const from_path = result.data
        
        const storage_dir = FileSystem.documentDirectory + "ComicMTL/" + `${source}/` + `${comic_id}/`;
        
        try{
            const dirInfo = await FileSystem.getInfoAsync(storage_dir);
            if (!dirInfo.exists) await FileSystem.makeDirectoryAsync(storage_dir, { intermediates: true });
            await FileSystem.copyAsync({
                from: from_path,
                to: storage_dir + "cover.png",
            });
            
            return {type:"file_path",data:storage_dir + "cover.png"}
        }catch (error: any) {
            console.log("store_comic_cover: ", error)
            return { type: "error", data: null };
        }


        
    }else return result
}

export const get_requested_info = async (
    setShowCloudflareTurnstile:any,
    setChapterRequested:any,
    setChapterToDownload:any,
    signal:any,
    source:any,
    comic_id:any,
) => {
    const API_BASE = await Storage.get("IN_USE_API_BASE")
    const socket_info = await Storage.get("SOCKET_INFO")
    const stored_comic = await ComicStorage.getByID(source,comic_id)
    await axios({
        method: 'post',
        url: `${API_BASE}/api/queue/request_info/`,
        headers: {
            'X-CLOUDFLARE-TURNSTILE-TOKEN': await Storage.get("cloudflare-turnstile-token")
        },
        data: {
            socket_id: socket_info.id,
            source:source,
            comic_id:comic_id,
            chapter_requested:stored_comic.chapter_requested,
        },
        timeout: 30000,
        signal:signal,
    }).then((response) => {
        const DATA = response.data
        
        setChapterRequested(DATA)
        
        const new_obj:any = {}
        for (const [key, value] of Object.entries(DATA) as any) {
            
            
            if (value.state === "ready") {
                new_obj[key] = {
                    chapter_idx: value.chapter_idx,
                    options: value.options,
                }
            }
        }
        console.log(new_obj)
        setChapterToDownload(new_obj)
        
    }).catch((error) => {
        console.log(error)
        
        if (error.status === 511) setShowCloudflareTurnstile(true)
    })
}

export const download_chapter = async (
    setShowCloudflareTurnstile:any, 
    isDownloading:any, 
    source:string | string[], 
    comic_id:string | string[], 
    chapterRequested:any,
    setChapterRequested:any,
    chapterToDownload:any, 
    setChapterToDownload:any, 
    signal:any
) => {
    const API_BASE = await Storage.get("IN_USE_API_BASE")

    const [chapter_id, request_info]:any = Object.entries(chapterToDownload)[0];
    
    var progress_lenth:number = 0
    var total_length:number = 0
    await axios({
        method: 'post',
        url: `${API_BASE}/api/stream_file/download_chapter/`,
        responseType: 'blob',
        headers: {
            'X-CLOUDFLARE-TURNSTILE-TOKEN': await Storage.get("cloudflare-turnstile-token")
        },
        data: {
            source:source,
            comic_id:comic_id,
            chapter_id:chapter_id,
            chapter_idx:request_info.chapter_idx,
            options:request_info.options,
        },
        onDownloadProgress: (progressEvent) => {
            const _total_length = progressEvent.total
            if (total_length !== undefined) {
                total_length = _total_length as number + 5
                progress_lenth = progressEvent.loaded;
                setChapterToDownload({...chapterToDownload,[chapter_id]:{...chapterToDownload[chapter_id],progress:{current:progress_lenth,total:total_length}}})
            }
        },
        timeout: 600000,
        signal:signal,
    }).then(async (response) => {
        const DATA = response.data
        if (Platform.OS === "web"){
            await ChapterStorage.update(`${source}-${comic_id}`,chapter_id,{type:"blob", value:DATA}, "completed")
        }else{
            const chapter_dir = FileSystem.documentDirectory + "ComicMTL/" + `${source}/` + `${comic_id}/` + `chapters/`;
            const dirInfo = await FileSystem.getInfoAsync(chapter_dir);
            if (!dirInfo.exists) await FileSystem.makeDirectoryAsync(chapter_dir, { intermediates: true });
            await FileSystem.writeAsStringAsync(chapter_dir + `${request_info.chapter_idx}.zip`, (await blobToBase64(DATA)).split(',')[1], {
                encoding: FileSystem.EncodingType.Base64,
            });
            console.log(JSON.stringify({type:"file_path", value:chapter_dir + `${request_info.chapter_idx}.zip`}))
            await ChapterStorage.update(`${source}-${comic_id}`,chapter_id,{type:"file_path", value:chapter_dir + `${request_info.chapter_idx}.zip`}, "completed")
        }
        setChapterToDownload({...chapterToDownload,[chapter_id]:{...chapterToDownload[chapter_id],progress:{current:progress_lenth+5,total:total_length}}})
        
    }).catch(async (error) => {
        console.log(error)
        
            if (error.status === 511) setShowCloudflareTurnstile(true)
            else {
                const chapter_to_download = chapterToDownload
            delete chapter_to_download[chapter_id]
            setChapterToDownload(chapter_to_download)
            
            const chapter_requested = (await ComicStorage.getByID(source,comic_id)).chapter_requested
            const new_chapter_requested = chapter_requested.filter((item:any) => item.chapter_id !== chapter_id);
            await ComicStorage.updateChapterQueue(source,comic_id,new_chapter_requested)
            
            isDownloading.current = false
        }
    })
    
}