import React, { useEffect, useState, useCallback, useContext, useRef } from 'react';
import { Link, router, useLocalSearchParams, useNavigation, useFocusEffect } from 'expo-router';
import { Image as RNImage, StyleSheet, useWindowDimensions, ScrollView, Pressable, RefreshControl, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon, MD3Colors, Button, Text, TextInput, TouchableRipple } from 'react-native-paper';
import CircularProgress from 'react-native-circular-progress-indicator';
import { ActivityIndicator } from 'react-native-paper';

import uuid from 'react-native-uuid';
import Toast from 'react-native-toast-message';
import { View, AnimatePresence } from 'moti';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system';
import NetInfo from "@react-native-community/netinfo";
import JSZip from 'jszip';

import ChapterStorage from '@/constants/module/chapter_storage';
import Image from '@/components/Image';
import {CONTEXT} from '@/constants/module/context';
import {blobToBase64, base64ToBlob} from "@/constants/module/file_manager";
import Theme from '@/constants/theme';

const Index = ({}:any) => {
    const SOURCE = useLocalSearchParams().source;
    const COMIC_ID = useLocalSearchParams().comic_id;
    const CHAPTER_IDX = Number(useLocalSearchParams().chapter_idx as string);
    const Dimensions = useWindowDimensions();

    const {showMenuContext, setShowMenuContext}:any = useContext(CONTEXT)
    const {themeTypeContext, setThemeTypeContext}:any = useContext(CONTEXT)
    const {showCloudflareTurnstileContext, setShowCloudflareTurnstileContext}:any = useContext(CONTEXT)

    const [imagesID, setImagesID]:any = useState([])
    const images:any = useRef({})
    useEffect(()=>{
        setShowMenuContext(false)
    },[])

    useEffect(()=>{(async () => {
        console.log(SOURCE,COMIC_ID,CHAPTER_IDX)
        const stored_chapter = await ChapterStorage.getByIdx(`${SOURCE}-${COMIC_ID}`,CHAPTER_IDX)   
        console.log(stored_chapter)
        if (stored_chapter?.data_state === "completed"){
            const zip = new JSZip();
            const file_keys:Array<string> = []
            const files: { [key: string]: string } = {};

            if (stored_chapter?.data.type === "blob"){
                const zipContent = await zip.loadAsync(stored_chapter?.data.value);
                for (const fileName in zipContent.files) {
                    if (zipContent.files[fileName].dir) {
                        continue; // Skip directories
                    }
                    const fileData = await zipContent.files[fileName].async('base64');
                    file_keys.push(fileName)
                    files[fileName] = "data:image/png;base64," + fileData;
                    
                }

            }else if (stored_chapter?.data.type === "file_path"){
           
                const base64String = await FileSystem.readAsStringAsync(stored_chapter?.data.value, {
                    encoding: FileSystem.EncodingType.Base64,
                });

                const zipContent = await zip.loadAsync(base64String, {base64: true});

                for (const fileName in zipContent.files) {
                    if (zipContent.files[fileName].dir) {
                        continue; // Skip directories
                    }
                    const fileData = await zipContent.files[fileName].async('base64');
                    file_keys.push(fileName)
                    files[fileName] = "data:image/png;base64," + fileData;
                }
                console.log("Done")
            }
            images.current = files
            setImagesID(file_keys)
        }
    })()},[])

    const ImageComponent = ({image_key}:any)=>{
        const [layout, setLayout]:any = useState({});

        useEffect(()=>{
            RNImage.getSize(images.current[image_key], (width, height) => {
                setLayout({ width, height });
            });

        },[])

        return <>{Object.keys(layout).length 
            ? <View
                style={{
                    width:"100%",
                    height:"auto",
                    display:"flex",
                    alignItems:"center",
                    backgroundColor:Theme[themeTypeContext].background_color,
                }}
            >
                <Image source={{type:"base64",data:images.current[image_key]}} 
                    contentFit="contain"
                    style={{
                        width:Dimensions.width > 720 ? Dimensions.width * 0.8 : "100%",
                        aspectRatio: layout.width / layout.height,
                    }}
                    onLoadEnd={()=>{
                        console.log("CLEANED")
                        // delete images.current[image_key]
                    }}
                />
            </View>
            : <></>
        }</>
    }


    return (<>{imagesID.length 
        ? <ScrollView  style={{
            width:"100%",
            height:"100%",
            backgroundColor:Theme[themeTypeContext].background_color,
        }}>
            <>{imagesID.map((image_key:string, index:number) => (
                
                <ImageComponent key={index}  image_key={image_key} />
                
            ))}</>

            
        </ScrollView>
        :<View style={{zIndex:5,width:"100%",height:"100%",display:"flex",justifyContent:"center",alignItems:"center",backgroundColor:Theme[themeTypeContext].background_color}}>
            <Image setShowCloudflareTurnstile={setShowCloudflareTurnstileContext} source={require("@/assets/gif/cat-loading.gif")} style={{width:((Dimensions.width+Dimensions.height)/2)*0.15,height:((Dimensions.width+Dimensions.height)/2)*0.15}}/>
        </View>
    }</>)
    

}

export default Index;

