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
import dayjs from 'dayjs'; import utc from 'dayjs/plugin/utc'; dayjs.extend(utc);


import Theme from '@/constants/theme';
import { __styles } from '../stylesheet/show_styles';
import Storage from '@/constants/module/storages/storage';
import ImageCacheStorage from '@/constants/module/storages/image_cache_storage';
import ChapterStorage from '@/constants/module/storages/chapter_storage';
import ComicStorage from '@/constants/module/storages/comic_storage';
import { CONTEXT } from '@/constants/module/context';
import Dropdown from '@/components/dropdown';
import RequestChapterWidget from './widgets/request_chapter';


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
    chapter_requested,
    download_progress,
    chapter_to_download,
    chapter_queue,

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
    const [isLoading, setIsLoading] = useState(true);
    const [is_net_connected, set_is_net_connected]:any = useState(false)


    const [chapterQueue, setChapterQueue]:any = useState({})
    const [chapterRequested, setChapterRequested]:any = useState({})
    const [chapterToDownload, setChapterToDownload]:any = useState({})
    const [downloadProgress, setDownloadProgress]:any = useState({[chapter.id]:{progress:0,total:100}})


    const chapter_status_interval = useRef<any>(null)
    const is_running = useRef<boolean>(false)

    useEffect(()=>{
        // console.log("CTD", chapterToDownload)
    },[chapterToDownload])

    useEffect(()=>{
        // console.log("CR", chapterRequested)
    },[chapterRequested])

    useFocusEffect(useCallback(() => {
        clearInterval(chapter_status_interval.current)
        chapter_status_interval.current = setInterval(() => {
            if (is_running.current) return
            is_running.current = true

            // current -> Checking for chapter requested
            if (chapter_requested.current.hasOwnProperty(chapter.id) && !chapterRequested.hasOwnProperty(chapter.id)) {
                setChapterRequested({[chapter.id]:chapter_requested.current[chapter.id]})
            }else if (
                chapter_requested.current.hasOwnProperty(chapter.id) 
                && chapter_requested.current[chapter.id]?.state !== chapterRequested[chapter.id]?.state
            ) {
                setChapterRequested({[chapter.id]:chapter_requested.current[chapter.id]})
            }else if (!chapter_requested.current.hasOwnProperty(chapter.id) && chapterRequested.hasOwnProperty(chapter.id)){
                setChapterRequested({})
            }

            // current -> Checking for chapter to download
            if (chapter_to_download.current.hasOwnProperty(chapter.id) && !chapterToDownload.hasOwnProperty(chapter.id)) {
                setChapterToDownload({[chapter.id]:chapter_to_download.current[chapter.id]})
            }else if (
                chapter_to_download.current.hasOwnProperty(chapter.id) 
                && chapter_to_download.current[chapter.id]?.state !== chapterToDownload[chapter.id]?.state
            ) {
                setChapterToDownload({[chapter.id]:chapter_to_download.current[chapter.id]})
            }else if (!chapter_to_download.current.hasOwnProperty(chapter.id) && chapterToDownload.hasOwnProperty(chapter.id)){
                setChapterToDownload({})
            }

            // current -> Check download progress
            if (download_progress.current.hasOwnProperty(chapter.id) && !downloadProgress.hasOwnProperty(chapter.id)) {
                setDownloadProgress({[chapter.id]:download_progress.current[chapter.id]})
            }else if (
                download_progress.current.hasOwnProperty(chapter.id) 
                && (
                    download_progress.current[chapter.id]?.progress !== downloadProgress[chapter.id]?.progress 
                    || download_progress.current[chapter.id]?.total !== downloadProgress[chapter.id]?.total
                )
            ) {
                setDownloadProgress({[chapter.id]:download_progress.current[chapter.id]})
            }else if (!download_progress.current.hasOwnProperty(chapter.id) && downloadProgress.hasOwnProperty(chapter.id)){
                setDownloadProgress({})
            }

            // current -> Check chapter Queue
            if (chapter_queue.current?.queue?.hasOwnProperty(`${SOURCE}-${ID}-${chapter.idx}`)) {
                setChapterQueue(chapter_queue.current)
            }else if (chapterQueue.queue?.hasOwnProperty(`${SOURCE}-${ID}-${chapter.idx}`)){
                setChapterQueue({})
            }

            is_running.current = false
        },3000)
        return () => clearInterval(chapter_status_interval.current)
    },[chapterQueue,chapterRequested,chapterToDownload, downloadProgress]))


    useEffect(() => {(async () => {
        setIsLoading(true)
        const net_info = await NetInfo.fetch()
        set_is_net_connected(net_info.isConnected)

        setStyles(__styles(themeTypeContext,Dimensions))
        const stored_chapter = await ChapterStorage.get(`${SOURCE}-${ID}`,chapter.id)
        if (stored_chapter?.data_state === "completed") set_is_saved(true)
        else set_is_saved(false)
        setIsLoading(false)
    })()}, [])

    useEffect(()=>{(async () => {
        setIsLoading(true)
        const stored_chapter = await ChapterStorage.get(`${SOURCE}-${ID}`,chapter.id)
        if (stored_chapter?.data_state === "completed") set_is_saved(true)
        else set_is_saved(false)
        setIsLoading(false)
    })()},[page,sort])

    const Request_Download = async (CHAPTER:any) => {
        const stored_comic = await ComicStorage.getByID(SOURCE,ID)
        if (stored_comic)  {
            setWidgetContext({state:true,component:<RequestChapterWidget
                SOURCE={SOURCE}
                ID={ID}
                CHAPTER={CHAPTER}
                chapter_requested={chapter_requested}
                get_requested_info={() => get_requested_info(setShowCloudflareTurnstileContext, chapter_requested, chapter_to_download, signal, SOURCE, ID)}
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
                const stored_chapter = await ChapterStorage.get(`${SOURCE}-${ID}`,chapter.id)
                if (stored_chapter?.data_state === "completed") {
                    const stored_comic = await ComicStorage.getByID(SOURCE,ID)
                    if (!stored_comic.history.idx || chapter.idx > stored_comic.history.idx) await ComicStorage.updateHistory(SOURCE,ID,{idx:chapter.idx, id:chapter.id, title:chapter.title})
                    
                    router.navigate(`/read/${SOURCE}/${ID}/${chapter.idx}/`)
                }else{
                    Toast.show({
                        type: 'error',
                        text1: 'Chapter not download yet.',
                        text2: "Press the button next to chapter title to download.",
                        
                        position: "bottom",
                        visibilityTime: 4000,
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
        {isLoading
            ? (<ActivityIndicator animating={true} color={Theme[themeTypeContext].icon_color} />)
            
            : <>{is_net_connected || is_saved
                ? <>{is_saved 
                    ? <Icon source={"content-save-check"} size={((Dimensions.width+Dimensions.height)/2)*0.0425} color={Theme[themeTypeContext].icon_color}/>
                    : <>
                        <>{chapterRequested[chapter.id]?.state === "queue" && !chapterQueue?.queue?.hasOwnProperty(`${SOURCE}-${ID}-${chapter.idx}`) 
                            && <ActivityIndicator animating={true} color={"#7df9ff"} />
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
                            && <>{chapterToDownload[chapter.id]?.state === "downloading"
                                ? <CircularProgress 
                                    value={downloadProgress[chapter.id].progress} 
                                    maxValue={downloadProgress[chapter.id].total}
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
                                        if (downloadProgress[chapter.id].progress !== downloadProgress[chapter.id].total) return
                                        
                                        const stored_chapter_requested = (await ComicStorage.getByID(SOURCE,ID)).chapter_requested
                                        const new_chapter_requested = stored_chapter_requested.filter((item:any) => item.chapter_id !== chapter.id);
                                        await ComicStorage.updateChapterQueue(SOURCE,ID,new_chapter_requested)

                                        delete chapter_requested.current[chapter.id]
                                        setChapterRequested({})

                                        delete chapter_to_download.current[chapter.id]
                                        setChapterToDownload({})

                                        delete download_progress[chapter.id]
                                        setDownloadProgress({})

                                        set_is_saved(true)
                                        isDownloading.current = false
                                        console.log("DONE DOWNLOADING!")
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
                                        get_requested_info(setShowCloudflareTurnstileContext, setChapterRequested, chapter_to_download, signal, SOURCE, ID)
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
            }</>
        }
    </View>}</>
}

export default ChapterComponent