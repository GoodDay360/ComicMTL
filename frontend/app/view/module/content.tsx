import axios from 'axios';
import * as FileSystem from 'expo-file-system';

import translator from '@/constants/module/translator';
import Storage from '@/constants/module/storage';
import ComicStorage from '@/constants/module/comic_storage';
import ImageCacheStorage from '@/constants/module/image_cache_storage';
import ChapterStorage from '@/constants/module/chapter_storage';
import { ensure_safe_table_name } from '@/constants/module/ensure_safe_table_name';


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
        // console.log(DATA)

        // Store in local if bookmarked.
        const stored_comic = await ComicStorage.getByID(`${source}-${DATA.id}`)
        if (stored_comic) {
            const cover_result:any = await store_comic_cover(setShowCloudflareTurnstile,signal,DATA)
            await ComicStorage.updateInfo(`${source}-${DATA.id}`, {
                cover:cover_result,
                title:DATA.title,
                author:DATA.author,
                category:DATA.category,
                status:DATA.status,
                synopsis:DATA.synopsis,
                updated:DATA.updated,
            })
            for (const chapter of DATA.chapters) {
                const stored_chapter = await ChapterStorage.get(ensure_safe_table_name(`${source}-${DATA.id}`),chapter.id)
                if (!stored_chapter) await ChapterStorage.add(ensure_safe_table_name(`${source}-${DATA.id}`), chapter.idx, chapter.id, chapter.title, {});
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

export const store_comic_cover = async (setShowCloudflareTurnstile:any,signal:any,CONTENT:any) => {
    const result = await ImageCacheStorage.get(setShowCloudflareTurnstile,CONTENT.cover.uri,signal);
    if (result.type === "file_path"){
        const from_path = result.data
        
        const storage_dir = FileSystem.documentDirectory + "ComicMTL/" + `${CONTENT.id}/`;
        try{
            const dirInfo = await FileSystem.getInfoAsync(storage_dir);
            if (!dirInfo.exists) await FileSystem.makeDirectoryAsync(storage_dir, { intermediates: true });
            await FileSystem.copyAsync({
                from: from_path,
                to: storage_dir + "cover.png",
            });
            
            return {type:"file_path",data:storage_dir + "cover.png"}
        }catch (error: any) {
            console.error(error)
            return { type: "error", data: null };
        }


        
    }else return result
}
