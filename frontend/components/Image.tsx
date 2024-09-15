import { useState, useEffect } from "react"
import { Image as _Image } from 'expo-image';
import { View } from "react-native"
import ImageStorage from "@/constants/module/image_storage";
const Buffer = require('buffer/').Buffer

const Image = ({source, style, onError, contentFit, transition}:any) => {
    const [imageData, setImageData]:any = useState(null)

    useEffect(()=>{
        (async ()=>{
            if (source.hasOwnProperty("uri")){
                const result:any = await ImageStorage.get(source.uri);
                if (result.type === "blob"){

                    const arrayBuffer = await result.data.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);
                    setImageData({uri:`data:${result.data.type};base64,${buffer.toString('base64')}`})
                }else if(result.type === "base64"){
                    setImageData({uri:`data:image/png;base64,${result.data}`})
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