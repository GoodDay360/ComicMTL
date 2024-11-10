import { useState, useEffect, useContext, useCallback, useRef } from "react"
import { Image as _Image } from 'expo-image';
import { View } from "react-native"
import ImageCacheStorage from "@/constants/module/storages/image_cache_storage";
import {blobToBase64} from "@/constants/module/file_manager";
import { Icon, Button } from 'react-native-paper';
import { ActivityIndicator } from 'react-native-paper';
import { CONTEXT } from "@/constants/module/context";
import { useFocusEffect } from "expo-router";



const Image = ({source, style, onError, contentFit, transition, onLoad, onLoadEnd}:any) => {
    const [imageLoaded, setImageLoaded]:any = useState(false)
    const imageData:any = useRef(null)
    const [isError, setIsError]:any = useState(false)
    const {showCloudflareTurnstileContext, setShowCloudflareTurnstileContext}:any = useContext(CONTEXT)
    const controller = new AbortController();
    const signal = controller.signal;
    const request_image = () =>{
        (async ()=>{
            if(source.hasOwnProperty("type")){
                if (source.type === "blob"){
                    imageData.current = {uri:await blobToBase64(source.data,"image/png")}
                    setImageLoaded(true)
                }else if (source.type === "base64"){
                    imageData.current = {uri:source.data}
                    setImageLoaded(true)
                }else if (source.type === "file_path"){
                    imageData.current = {uri:source.data}
                    setImageLoaded(true)
                }else{
                    setIsError(true)
                    setImageLoaded(false)
                }
            } else if (source.hasOwnProperty("uri")){
                const result:any = await ImageCacheStorage.get(setShowCloudflareTurnstileContext,source.uri,signal);
                if (result.type === "blob"){
                    imageData.current = {uri:await blobToBase64(result.data)}
                    setImageLoaded(true)
                }else if (result.type === "base64"){
                    imageData.current = {uri:result.data}
                    setImageLoaded(true)
                }else if (result.type === "file_path"){
                    imageData.current = {uri:result.data}
                    setImageLoaded(true)
                }else{
                    setIsError(true)
                    setImageLoaded(false)
                }
                
            }else{
                imageData.current = source
                setImageLoaded(true)
            }

            
        })()
        
    }

    useFocusEffect(useCallback(() => {
        return () => {
            imageData.current = null
            controller.abort();
        };
    },[]))

    useEffect(()=>{
        request_image()
    },[])

    return ( <>
            {isError
                ? <View style={{...style,display:'flex',justifyContent:"center",alignItems:"center"}}>
                    <Button mode="outlined" onPress={()=>{
                        request_image()
                        setIsError(false)
                    }}
                        style={{
                            borderWidth:0,
                        }}
                    >
                        <Icon source={"refresh-circle"} size={25} color={"yellow"}/>
                    </Button>
                </View>
                : <>{imageLoaded
                    
                
                    ? <_Image 
                        onError={onError} 
                        source={imageData.current} 
                        style={style}
                        contentFit={contentFit}
                        transition={transition}
                        onLoad={()=>{
                            if (onLoad) onLoad()
                            imageData.current = null
                        }}
                        onLoadEnd={onLoadEnd}
                    />
                    : <View style={{...style,display:'flex',justifyContent:"center",alignItems:"center"}}>
                        <ActivityIndicator animating={true}/>
                    </View>
                }</>
            }
            
        </>  
    )
}

export default Image