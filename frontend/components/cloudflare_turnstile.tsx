import { useState, useRef } from 'react';
import ReactNativeTurnstile, { resetTurnstile } from "react-native-turnstile";
import Turnstile, { useTurnstile } from "react-turnstile";
import { Platform } from 'react-native';
import axios from 'axios';
import Storage from '@/constants/module/storage';

const CloudflareTurnstile = ({callback}:any) => {

    const verify = async (token:string,callback:any) => {
        const API_BASE = await Storage.get("IN_USE_API_BASE")

        axios({
            method: 'post',
            url: `${API_BASE}/api/cloudflare_turnstile/verify/`,
            data:{token:token}

        }).then((response) => {(async () =>{
            await Storage.store("cloudflare-turnstile-token",token)
            callback()
        })()}).catch((error) => {
            console.log(error)
            alert(error)
        })
    }

    const site_key:string = `${process.env.EXPO_PUBLIC_CLOUDFLARE_TURNSTILE_SITE}`
    if (Platform.OS === "web"){
        return (<Turnstile
            sitekey={site_key}
            onVerify={(token)=>{ verify(token,callback) }}
        />)
    }else {
        return (
            <ReactNativeTurnstile
                sitekey={site_key}
                onVerify={(token)=>{ verify(token,callback) }}
                style={{ marginLeft: 'auto', marginRight: 'auto' }}

            />  
        );
    }
    }   
    

export default CloudflareTurnstile;
