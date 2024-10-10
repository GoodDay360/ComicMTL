import React, { useEffect, useState, useCallback, useContext, useRef, useMemo } from 'react';
import { Link, router, useLocalSearchParams, useNavigation, useFocusEffect } from 'expo-router';
import { Image as RNImage, StyleSheet, useWindowDimensions, ScrollView, Pressable, RefreshControl, Platform, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon, MD3Colors, Button, Text, TextInput, TouchableRipple } from 'react-native-paper';
import CircularProgress from 'react-native-circular-progress-indicator';
import { ActivityIndicator } from 'react-native-paper';
import { FlashList } from "@shopify/flash-list";

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
import {blobToBase64, base64ToBlob, getImageLayout} from "@/constants/module/file_manager";
import Theme from '@/constants/theme';

import ChapterImage from '../../components/chapter_image';

const Index = ({}:any) => {
    const SOURCE = useLocalSearchParams().source;
    const COMIC_ID = useLocalSearchParams().comic_id;
    const CHAPTER_IDX = Number(useLocalSearchParams().chapter_idx as string);
    const Dimensions = useWindowDimensions();
    const StaticDimensions = useMemo(() => Dimensions, [])

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
            const files: { [key: string]: any } = {};

            if (stored_chapter?.data.type === "blob"){
                const zipContent = await zip.loadAsync(stored_chapter?.data.value);
                for (const fileName in zipContent.files) {
                    if (zipContent.files[fileName].dir) {
                        continue; // Skip directories
                    }
                    const fileData = await zipContent.files[fileName].async('base64');
                    file_keys.push(fileName)
                    files[fileName] = {
                        layout: await getImageLayout("data:image/png;base64," + fileData),
                        data: "data:image/png;base64," + fileData
                    };
                    
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
                    files[fileName] = {
                        layout: await getImageLayout("data:image/png;base64," + fileData),
                        data: "data:image/png;base64," + fileData
                    };
                }
                console.log("Done")
            }
            images.current = files
            file_keys.sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
            setImagesID(file_keys)
        }
    })()},[])

    useFocusEffect(useCallback(() => {
        return () => {
            images.current = {}
        }
    },[]))

    const renderItem = useCallback(({ item, index }:any) => {
        return (
            <ChapterImage key={index} image_data={images.current[item].data} layout={images.current[item].layout}/>
        )
    }, [])

    return (<>{imagesID.length 
        ? <View
            style={{
                width:"100%",
                height:"100%",
                backgroundColor:Theme[themeTypeContext].background_color,
            }}
        >
            <FlashList 
                data={imagesID}
                renderItem={renderItem}
                estimatedItemSize={StaticDimensions.height}
            />

        </View>
        

        :<View style={{zIndex:5,width:"100%",height:"100%",display:"flex",justifyContent:"center",alignItems:"center",backgroundColor:Theme[themeTypeContext].background_color}}>
            <Image setShowCloudflareTurnstile={setShowCloudflareTurnstileContext} source={require("@/assets/gif/cat-loading.gif")} style={{width:((Dimensions.width+Dimensions.height)/2)*0.15,height:((Dimensions.width+Dimensions.height)/2)*0.15}}/>
        </View>
    }</>)
    

}

export default Index;

