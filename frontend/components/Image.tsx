import { useState, useEffect } from "react"
import { Image as _Image } from 'expo-image';
import { View } from "react-native"
import ImageStorage from "@/constants/module/image_storage";
import blobToBase64 from "@/constants/module/blob_to_base64";
import { Icon, Button } from 'react-native-paper';
import { ActivityIndicator } from 'react-native-paper';

const Image = ({setShowCloudflareTurnstile, source, style, onError, contentFit, transition}:any) => {
    const [imageData, setImageData]:any = useState(null)
    const [isError, setIsError]:any = useState(false)


    useEffect(()=>{
        const controller = new AbortController();
        const signal = controller.signal;
        

        (async ()=>{
            if (source.hasOwnProperty("uri")){
                const result:any = await ImageStorage.get(setShowCloudflareTurnstile,source.uri,signal);
                if (result.type === "blob"){
                    setImageData({uri:await blobToBase64(result.data)})
                }else if (result.type === "base64"){
                    setImageData({uri:result.data})
                }else if (result.type === "file_path"){
                    setImageData({uri:result.data})
                }else{
                    setIsError(true)
                }
                console.log(result)
            }else{
                setImageData(source)
            }

            
        })()
        return () => {
            controller.abort();
        };
    },[])

    return ( <>
            {isError
                ? <View style={{...style,display:'flex',justifyContent:"center",alignItems:"center"}}>
                    <Button mode="outlined" onPress={()=>{setIsError(false)}}
                        style={{
                            borderWidth:0,
                        }}
                    >
                        <Icon source={"refresh-circle"} size={25} color={"yellow"}/>
                    </Button>
                </View>
                : <>{imageData
                    
                
                    ? <_Image 
                        onError={onError} 
                        source={imageData} 
                        style={style}
                        contentFit={contentFit}
                        transition={transition}
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