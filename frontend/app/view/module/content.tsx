import axios from 'axios';
import translator from '@/constants/module/translator';
import Storage from '@/constants/module/storage';


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
        console.log(DATA)
        setIsLoading(false)
    })()}).catch((error) => {
        console.log(error)
        
        if (error.status === 511) setShowCloudflareTurnstile(true)
        setFeedBack("Error unable to fetch data! Try request again.")
        setIsLoading(false)
    })
}