import axios from 'axios';
import translator from '@/constants/module/translator';
import Storage from '@/constants/module/storage';

export const get_list = async (setShowCloudflareTurnstile:any,signal:AbortSignal,setIsLoading:any,translate:any,SET_CONTENT:any,API_BASE:string) => {
    
    axios({
        method: 'post',
        url: `${API_BASE}/api/web_scrap/get_list/`,
        headers: {
            'X-CLOUDFLARE-TURNSTILE-TOKEN': await Storage.get("cloudflare-turnstile-token")
        },
        timeout: 60000,
        signal:signal,
    }).then((response) => {(async () =>{
        
        const DATA = response.data.data
        console.log(response)
        if (translate.state){            
            const TRANSLATED_DATA = []
            for (const item of DATA){
                item.title = await translator(translate.from,translate.to,item.title)
                TRANSLATED_DATA.push(item)
            }
            SET_CONTENT(TRANSLATED_DATA)
        }else{
            SET_CONTENT(DATA)
        }
        setIsLoading(false)
        
    })()}).catch((error) => {
        console.log(error)
        setIsLoading(false)
        if (error.status === 511) setShowCloudflareTurnstile(true)
    })
}