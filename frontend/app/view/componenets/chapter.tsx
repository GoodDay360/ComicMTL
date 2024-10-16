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


import { get, store_comic_cover, get_requested_info } from '../modules/content'
import { createSocket, setupSocketNetworkListener } from '../modules/socket';

const ChapterComponent = ({
    SOURCE,
    ID,
    page,
    sort,
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
    const [is_net_connected, set_is_net_connected]:any = useState(false)

    useEffect(() => {(async () => {
        const net_info = await NetInfo.fetch()
        set_is_net_connected(net_info.isConnected)

        setStyles(__styles(themeTypeContext,Dimensions))
        const stored_chapter = await ChapterStorage.get(`${SOURCE}-${ID}`,chapter.id, {exclude_fields:["data"]})
        if (stored_chapter?.data_state === "completed") set_is_saved(true)
        else set_is_saved(false)
    })()}, [])

    useEffect(()=>{(async () => {
        const stored_chapter = await ChapterStorage.get(`${SOURCE}-${ID}`,chapter.id, {exclude_fields:["data"]})
        if (stored_chapter?.data_state === "completed") set_is_saved(true)
        else set_is_saved(false)
    })()},[page,sort])

    const Request_Download = async (CHAPTER:any) => {
        
        const stored_comic = await ComicStorage.getByID(SOURCE,ID)
        if (stored_comic)  {
            setWidgetContext({state:true,component:<RequestChapterWidget
                SOURCE={SOURCE}
                ID={ID}
                CHAPTER={CHAPTER}
                chapterQueue={chapterQueue}
                setChapterQueue={setChapterQueue}
                chapterRequested={chapterRequested}
                setChapterRequested={setChapterRequested}
                get_requested_info={() => get_requested_info(setShowCloudflareTurnstileContext, setChapterRequested, setChapterToDownload, signal, SOURCE, ID)}
            />})
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
                    
                    router.push(`/read/${SOURCE}/${ID}/?idx=${chapter.idx}`)
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
        {is_net_connected || is_saved
            ? <>{is_saved 
                ? <Icon source={"content-save-check"} size={((Dimensions.width+Dimensions.height)/2)*0.0425} color={Theme[themeTypeContext].icon_color}/>
                : <>
                    <>{chapterRequested[chapter.id]?.state === "queue" && !chapterQueue?.queue?.hasOwnProperty(`${SOURCE}-${ID}-${chapter.idx}`) 
                        && <ActivityIndicator animating={true} color={Theme[themeTypeContext].icon_color} />
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

                    <>{chapterRequested[chapter.id]?.state === "ready"
                        && <>{chapterToDownload[chapter.id]?.progress
                            ? <CircularProgress 
                                value={chapterToDownload[chapter.id]?.progress.current} 
                                maxValue={chapterToDownload[chapter.id]?.progress.total}
                                radius={((Dimensions.width+Dimensions.height)/2)*0.0225}
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
                                onAnimationComplete={async ()=>{
                                    const chapter_to_download = chapterToDownload
                                    delete chapter_to_download[chapter.id]
                                    setChapterToDownload(chapter_to_download)

                                    const stored_chapter_requested = (await ComicStorage.getByID(SOURCE,ID)).chapter_requested
                                    const new_chapter_requested = stored_chapter_requested.filter((item:any) => item.chapter_id !== chapter.id);
                                    await ComicStorage.updateChapterQueue(SOURCE,ID,new_chapter_requested)

                                    delete chapterRequested[chapter.id]
                                    setChapterRequested(chapterRequested)

                                    set_is_saved(true)
                                    isDownloading.current = false
                                }}
                            />
                            : <ActivityIndicator animating={true} color={"green"} />
                        }</>
                    }</>
                    
                    <>{chapterQueue.queue?.hasOwnProperty(`${SOURCE}-${ID}-${chapter.idx}`) && !(chapterRequested[chapter.id]?.state === "ready")
                        && <>{chapterQueue.queue[`${SOURCE}-${ID}-${chapter.idx}`]
                            ? <CircularProgress 
                                value={100 - (((chapterQueue.queue[`${SOURCE}-${ID}-${chapter.idx}`])*100)/chapterQueue.max_queue)} 
                                maxValue={100}
                                radius={((Dimensions.width+Dimensions.height)/2)*0.0225}
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
                                    console.log("HAHA",chapterQueue)
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
            }</>
            : <Icon source={"wifi-off"} size={((Dimensions.width+Dimensions.height)/2)*0.0425} color={Theme[themeTypeContext].icon_color}/>
        }
    </View>}</>
}

export default ChapterComponent