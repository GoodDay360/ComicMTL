import React, { useEffect, useState, useCallback, useContext, useRef } from 'react';
import { Link, router, useLocalSearchParams, useNavigation, useFocusEffect } from 'expo-router';
import Image from '@/components/Image';
import { StyleSheet, useWindowDimensions, ScrollView, Pressable, RefreshControl, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon, MD3Colors, Button, Text, TextInput, TouchableRipple } from 'react-native-paper';
import CircularProgress from 'react-native-circular-progress-indicator';
import { ActivityIndicator } from 'react-native-paper';

import uuid from 'react-native-uuid';
import Toast from 'react-native-toast-message';
import { View, AnimatePresence } from 'moti';
import * as Clipboard from 'expo-clipboard';
import NetInfo from "@react-native-community/netinfo";


import Theme from '@/constants/theme';
import { __styles } from '../stylesheet/show_styles';
import Storage from '@/constants/module/storage';
import ImageCacheStorage from '@/constants/module/image_cache_storage';
import ChapterStorage from '@/constants/module/chapter_storage';
import ComicStorage from '@/constants/module/comic_storage';
import { CONTEXT } from '@/constants/module/context';
import Dropdown from '@/components/dropdown';
import { RequestChapterWidget, BookmarkWidget } from './widgets';


import { get, store_comic_cover, get_requested_info } from '../module/content'
import { createSocket, setupSocketNetworkListener } from '../module/socket';

const ChapterComponent = ({
    SOURCE,
    ID,
    chapter,
    signal,
    isDownloading,
    chapterRequested,
    setChapterRequested,
    chapterToDownload,
    setChapterToDownload,
    setChapterQueue,
    chapterQueue,

}:any) => {
    const {showMenuContext, setShowMenuContext}:any = useContext(CONTEXT)
    const {themeTypeContext, setThemeTypeContext}:any = useContext(CONTEXT)
    const {apiBaseContext, setApiBaseContext}:any = useContext(CONTEXT)
    const {socketBaseContext, setSocketBaseContext}:any = useContext(CONTEXT)
    const {widgetContext, setWidgetContext}:any = useContext(CONTEXT)
    const {showCloudflareTurnstileContext, setShowCloudflareTurnstileContext}:any = useContext(CONTEXT)

    const Dimensions = useWindowDimensions();

    const [styles, setStyles]:any = useState("")
    const [is_saved, set_is_saved] = useState(false)
    const [is_working_on_queue, set_is_working_on_queue] = useState(false)

    useEffect(() => {
        
    },[chapterRequested])

    useEffect(() => {(async () => {

        setStyles(__styles(themeTypeContext,Dimensions))
        const stored_chapter = await ChapterStorage.get(`${SOURCE}-${ID}`,chapter.id, {exclude_fields:["data"]})
        if (stored_chapter?.data_state === "completed") set_is_saved(true)
    })()}, [])

    const Request_Download = async (CHAPTER:any) => {
        
        const stored_comic = await ComicStorage.getByID(SOURCE,ID)
        if (stored_comic)  {
            setWidgetContext({state:true,component:() => RequestChapterWidget(SOURCE,ID,CHAPTER,chapterQueue,setChapterQueue,chapterRequested,setChapterRequested,
                ()=>{return get_requested_info(setShowCloudflareTurnstileContext, setChapterRequested, setChapterToDownload, signal, SOURCE, ID)}
            )})
        }
        else{
            Toast.show({
                type: 'error',
                text1: '🔖 Bookmark required.',
                text2: `Add this comic to your bookmark to request download.`,
                
                position: "bottom",
                visibilityTime: 8000,
                text1Style:{
                    fontFamily:"roboto-bold",
                    fontSize:((Dimensions.width+Dimensions.height)/2)*0.025
                },
                text2Style:{
                    fontFamily:"roboto-medium",
                    fontSize:((Dimensions.width+Dimensions.height)/2)*0.0185,
                    
                },
            });
        }
    }

    return <>{styles && <View
        style={{
            display:"flex",
            flexDirection:"row",
            gap:8,
            justifyContent:"space-between",
            alignItems:"center",
        }}
    >
        <Button mode='outlined' 
            style={styles.chapter_button}
            labelStyle={{
                ...styles.item_info,
                fontSize:((Dimensions.width+Dimensions.height)/2)*0.025,
                fontFamily:"roboto-light",
                padding:5,
            }}
            onPress={async () => {
                const stored_chapter = await ChapterStorage.get(`${SOURCE}-${ID}`,chapter.id, {exclude_fields:["data"]})
                if (stored_chapter?.data_state === "completed") {
                    
                    router.push(`/read/${SOURCE}/${ID}/${chapter.idx}`)
                }else{
                    Toast.show({
                        type: 'info',
                        text1: 'Chapter not download yet.',
                        text2: "Press the download button to download the chapter.",
                        
                        position: "bottom",
                        visibilityTime: 3000,
                        text1Style:{
                            fontFamily:"roboto-bold",
                            fontSize:((Dimensions.width+Dimensions.height)/2)*0.025
                        },
                        text2Style:{
                            fontFamily:"roboto-medium",
                            fontSize:((Dimensions.width+Dimensions.height)/2)*0.0185,
                            
                        },
                    });
                }
            }}
        >
            {chapter.title}
        </Button>
        {is_saved 
            ? <Icon source={"content-save-check"} size={((Dimensions.width+Dimensions.height)/2)*0.0425} color={Theme[themeTypeContext].icon_color}/>
            : <>
                <>{chapterRequested[chapter.id]?.state === "queue" && !chapterQueue?.queue?.hasOwnProperty(`${SOURCE}-${ID}-${chapter.idx}`) 
                    && <ActivityIndicator animating={true} color={Theme[themeTypeContext].icon_color} />
                }</>
                <>{chapterRequested[chapter.id]?.state === "ready" && !chapterQueue.queue?.hasOwnProperty(`${SOURCE}-${ID}-${chapter.idx}`) 
                    && <>{chapterToDownload[chapter.id]?.progress
                        ? <CircularProgress 
                            value={chapterToDownload[chapter.id]?.progress.current} 
                            maxValue={chapterToDownload[chapter.id]?.progress.total}
                            radius={((Dimensions.width+Dimensions.height)/2)*0.03}
                            inActiveStrokeColor={Theme[themeTypeContext].border_color}
                            
                            showProgressValue={false}
                            title={"📥"}
                            titleStyle={{
                                pointerEvents:"none",
                                color:Theme[themeTypeContext].text_color,
                                fontSize:((Dimensions.width+Dimensions.height)/2)*0.025,
                                fontFamily:"roboto-medium",
                                textAlign:"center",
                            }}
                            onAnimationComplete={()=>{
                                const chapter_to_download = chapterToDownload
                                delete chapter_to_download[chapter.id]
                                setChapterToDownload(chapter_to_download)
                                set_is_saved(true)
                                isDownloading.current = false
                            }}
                        />
                        : <ActivityIndicator animating={true} color={"green"} />
                    }</>
                }</>

                <>{chapterRequested[chapter.id]?.state === "unkown" && !chapterQueue.queue?.hasOwnProperty(`${SOURCE}-${ID}-${chapter.idx}`) 
                    && <TouchableRipple
                        rippleColor={Theme[themeTypeContext].ripple_color_outlined}
                        style={{
                            borderRadius:5,
                            borderWidth:0,
                            padding:5,
                        }}
                        
                        onPress={()=>{
                            Toast.show({
                                type: 'error',
                                text1: '❓Request not found in server.',
                                text2: "You request this chapter but the server doesn't have this in queue.\nTry request again.",
                                
                                position: "bottom",
                                visibilityTime: 12000,
                                text1Style:{
                                    fontFamily:"roboto-bold",
                                    fontSize:((Dimensions.width+Dimensions.height)/2)*0.025
                                },
                                text2Style:{
                                    fontFamily:"roboto-medium",
                                    fontSize:((Dimensions.width+Dimensions.height)/2)*0.0185,
                                    
                                },
                            });
                            Request_Download(chapter)
                        }}
                    >
                        <Icon source={"alert-circle"} size={((Dimensions.width+Dimensions.height)/2)*0.04} color={"red"}/>

                    </TouchableRipple>
                }</>
                
                <>{chapterQueue.queue?.hasOwnProperty(`${SOURCE}-${ID}-${chapter.idx}`)
                    && <>{chapterQueue.queue[`${SOURCE}-${ID}-${chapter.idx}`]
                        ? <CircularProgress 
                            value={100 - (((chapterQueue.queue[`${SOURCE}-${ID}-${chapter.idx}`])*100)/chapterQueue.max_queue)} 
                            maxValue={100}
                            radius={((Dimensions.width+Dimensions.height)/2)*0.03}
                            inActiveStrokeColor={Theme[themeTypeContext].border_color}
                            
                        
                            showProgressValue={false}
                            title={chapterQueue.queue[`${SOURCE}-${ID}-${chapter.idx}`]}
                            titleStyle={{
                                pointerEvents:"none",
                                color:Theme[themeTypeContext].text_color,
                                fontSize:((Dimensions.width+Dimensions.height)/2)*0.025,
                                fontFamily:"roboto-medium",
                                textAlign:"center",
                            }}
                            onAnimationComplete={()=>{
                                
                                get_requested_info(setShowCloudflareTurnstileContext, setChapterRequested, setChapterToDownload, signal, SOURCE, ID)
                            }}
                        />
                        : <ActivityIndicator animating={true} />
                    }</>
                }</>

                <>{!chapterRequested.hasOwnProperty(chapter.id) && !chapterQueue.queue?.hasOwnProperty(`${SOURCE}-${ID}-${chapter.idx}`)
                    ? <TouchableRipple
                        rippleColor={Theme[themeTypeContext].ripple_color_outlined}
                        style={{
                            borderRadius:5,
                            borderWidth:0,
                            padding:5,
                        }}
                        
                        onPress={()=>{
                            Request_Download(chapter)
                        }}
                    >
                        <Icon source={"cloud-download"} size={((Dimensions.width+Dimensions.height)/2)*0.04} color={Theme[themeTypeContext].icon_color}/>

                    </TouchableRipple>
                    :<></>
                }</>
            </>
        }
    </View>}</>
}

export default ChapterComponent