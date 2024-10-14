import { useState, useRef, useEffect } from 'react';
import ReactNativeTurnstile, { resetTurnstile } from "react-native-turnstile";
import Turnstile, { useTurnstile } from "react-turnstile";
import { Platform, View, Text } from 'react-native';
import axios from 'axios';
import { Button } from 'react-native-paper';

import Storage from '@/constants/module/storage';

import Theme from '@/constants/theme';

const CloudflareTurnstile = ({callback}:any) => {


    const site_key:string = `${process.env.EXPO_PUBLIC_CLOUDFLARE_TURNSTILE_SITE}`

    const [isError,setIsError] = useState(false)
    const [feedBack,setFeedBack] = useState("")
    const [isRefresh,setIsRefresh] = useState(false)

    const [themeType, setThemeType] = useState("")

    useEffect(() => {
        (async () => {
            const theme_type = await Storage.get("theme")
            setThemeType(theme_type)
        })()
    },[])
    useEffect(()=>{
        if (isRefresh) setIsRefresh(false)
    },[isRefresh])

    const verify = async (token:string,callback:any) => {
        const API_BASE = await Storage.get("IN_USE_API_BASE")

        axios({
            method: 'post',
            url: `${API_BASE}/api/cloudflare_turnstile/verify/`,
            data:{token:token}

        }).then((response) => {(async () =>{
            await Storage.store("cloudflare-turnstile-token",token)
            setFeedBack("Redirecting...")
            callback()
        })()}).catch((error) => {
            console.log(error)
            setIsError(true)
            setFeedBack("Unable to verify cloudflare turnstile on server-side. Please try again.")
        })
    }

        return (<>{themeType && !isRefresh
            ?<View style={{display:"flex",flexDirection:"column",gap:10,justifyContent:"center",alignItems:"center"}}>
                {Platform.OS === "web"
                    ?<Turnstile
                        sitekey={site_key}
                        onVerify={(token)=>{ verify(token,callback) }}
                        onError={()=>{setIsError(true),setFeedBack("Unable to load cloudflare turnstile. Please try again.")}}
                    />
                    : <ReactNativeTurnstile
                        sitekey={site_key}
                        onVerify={(token)=>{ verify(token,callback) }}
                        style={{ marginLeft: 'auto', marginRight: 'auto' }}
                        onError={()=>{setIsError(true),setFeedBack("Unable to load cloudflare turnstile. Please try again.")}}
                    />  
                }
                {feedBack && !isRefresh && <Text style={{color:Theme[themeType].text_color}}>{feedBack}</Text>}
                {isError && !isRefresh && <Button mode="contained" onPress={()=>{setIsRefresh(true),setFeedBack(""),setIsError(false)}}>Retry</Button>}
                
            </View>
            : <></>
        }</>)
        
            
}   
    

export default CloudflareTurnstile;
