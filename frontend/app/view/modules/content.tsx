import axios from 'axios';
import JSZip from 'jszip';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';


import translator from '@/constants/module/translator';
import Storage from '@/constants/module/storages/storage';
import ComicStorage from '@/constants/module/storages/comic_storage';
import ImageCacheStorage from '@/constants/module/storages/image_cache_storage';
import ChapterStorage from '@/constants/module/storages/chapter_storage';
import ChapterDataStorage from '@/constants/module/storages/chapter_data_storage';
import CoverStorage from '@/constants/module/storages/cover_storage';

import {blobToBase64} from '@/constants/module/file_manager';
import { getImageLayout } from '@/constants/module/file_manager';



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
            await ComicStorage.updateInfo(source,DATA.id, {
                title:DATA.title,
                author:DATA.author,
                category:DATA.category,
                status:DATA.status,
                synopsis:DATA.synopsis,
                updated:DATA.updated,
            })
            await store_comic_cover(setShowCloudflareTurnstile,signal,source,id,DATA)
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
            
            
        }catch (error: any) {
            console.log("store_comic_cover: ", error)
        
        }


        
    }else {
        CoverStorage.store(`${source}-${comic_id}`,result)
        // return result
    }
}

export const get_requested_info = async (
    setShowCloudflareTurnstile:any,
    chapter_requested:any,
    chapter_to_download:any,
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
        chapter_requested.current = DATA
        
        const new_obj:any = {}
        for (const [key, value] of Object.entries(DATA) as any) {
            if (value.state === "ready") {
                new_obj[key] = {
                    chapter_idx: value.chapter_idx,
                    options: value.options,
                    state: chapter_to_download.current[key]?.state,
                }
            }
        }

        chapter_to_download.current = new_obj

        
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
    chapter_requested:any,
    chapter_to_download:any, 
    download_progress:any,
    signal:any
) => {
    const API_BASE = await Storage.get("IN_USE_API_BASE")
    const [chapter_id, request_info]:any = Object.entries(chapter_to_download.current)[0];

    const stored_chapter = await ChapterStorage.get(`${source}-${comic_id}`,chapter_id)
    if (stored_chapter.data_state === "completed") {
        
        const stored_chapter_requested = (await ComicStorage.getByID(source,comic_id)).chapter_requested
        const new_chapter_requested = stored_chapter_requested.filter((item:any) => item.chapter_id !== chapter_id);
        await ComicStorage.updateChapterQueue(source,comic_id,new_chapter_requested)

        delete chapter_requested.current[chapter_id]

        delete chapter_to_download.current[chapter_id]


        delete download_progress.current[chapter_id]

        isDownloading.current = false
        return
    }
    
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
            if (total_length !== undefined && progressEvent.loaded !== progress_lenth) {
                total_length = (_total_length as number) + (_total_length as number)*0.25

                if (progress_lenth === 0) {
                    download_progress.current = {
                        ...download_progress.current,
                        [chapter_id]:{progress:progress_lenth, 
                            total:total_length
                    }}
                    chapter_to_download.current = {
                        ...chapter_to_download.current,
                        [chapter_id]:{...chapter_to_download.current[chapter_id],
                        state:"downloading"
                    }}
                    progress_lenth = progressEvent.loaded;
                }else{
                    progress_lenth = progressEvent.loaded;
                    download_progress.current = {...download_progress.current, [chapter_id]:{progress:progress_lenth, total:total_length}}
                }
            }
        },
        timeout: 600000,
        signal:signal,
    }).then(async (response) => {
        const DATA = response.data

        

        if (Platform.OS === "web"){

            const zip = new JSZip();
            const zipContent = await zip.loadAsync(DATA);
            const MAX_PAGE = Object.keys(zipContent.files).length

            let page = 0;
            for (const fileName of Object.keys(zipContent.files).sort((a,b) => parseInt(a, 10) - parseInt(b, 10))) {
                if (zipContent.files[fileName].dir) {
                    continue; // Skip directories
                }
                page += 1
                const fileData = await zipContent.files[fileName].async('blob');
                const layout = await getImageLayout(await blobToBase64(fileData, "image/png"));
                await ChapterDataStorage.store(`${source}-${comic_id}-${request_info.chapter_idx}-${page}`,comic_id,request_info.chapter_idx, fileData, layout)
                const current_progress = progress_lenth + ((total_length-progress_lenth)*page)/MAX_PAGE
                download_progress.current = {...download_progress.current, [chapter_id]:{progress:current_progress, total:total_length}}
            }

            await ChapterStorage.update(`${source}-${comic_id}`,chapter_id, "completed", page)
        }else{
            // const chapter_dir = FileSystem.documentDirectory + "ComicMTL/" + `${source}/` + `${comic_id}/` + `chapters/`;
            // const dirInfo = await FileSystem.getInfoAsync(chapter_dir);
            // if (!dirInfo.exists) await FileSystem.makeDirectoryAsync(chapter_dir, { intermediates: true });
            // await FileSystem.writeAsStringAsync(chapter_dir + `${request_info.chapter_idx}.zip`, (await blobToBase64(DATA)).split(',')[1], {
            //     encoding: FileSystem.EncodingType.Base64,
            // });
            
            // await ChapterStorage.update(`${source}-${comic_id}`,chapter_id,{type:"file_path", value:chapter_dir + `${request_info.chapter_idx}.zip`}, "completed")
        }
        
        // download_progress.current = {...download_progress.current, [chapter_id]:{progress:total_length, total:total_length}}
        

        
    }).catch(async (error) => {
        console.log(error)
        
        if (error.status === 511) setShowCloudflareTurnstile(true)
        else {
            delete chapter_requested.current[chapter_id]
            delete chapter_to_download.current[chapter_id]
            
            const stored_chapter_requested = (await ComicStorage.getByID(source,comic_id)).chapter_requested
            const new_chapter_requested = stored_chapter_requested.filter((item:any) => item.chapter_id !== chapter_id);
            await ComicStorage.updateChapterQueue(source,comic_id,new_chapter_requested)
            
            isDownloading.current = false
        }
    })
    
}