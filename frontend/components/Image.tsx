import { useState, useEffect } from "react"
import { Image as _Image } from 'expo-image';
import { View } from "react-native"
import ImageStorage from "@/constants/module/image_storage";
import blobToBase64 from "@/constants/module/blob_to_base64";

const Image = ({source, style, onError, contentFit, transition}:any) => {
    const [imageData, setImageData]:any = useState(null)

    useEffect(()=>{
        (async ()=>{
            if (source.hasOwnProperty("uri")){
                const result:any = await ImageStorage.get(source.uri);
                if (result.type === "blob"){
                    setImageData({uri:blobToBase64(result.data)})
                }else if(result.type === "base64"){
                    setImageData({uri:result.data})
                }else if (result.type === "file_path"){
                    setImageData({uri:result.data})
                }
                
            }else{
                setImageData(source)
            }

            
        })()
    },[])

    return (imageData 
        ? <_Image 
            onError={onError} 
            source={imageData} 
            style={style}
            contentFit={contentFit}
            transition={transition}
        />
        : <View style={style}></View>
    )
}

export default Image