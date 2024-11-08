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
import Storage from '@/constants/module/storages/storage';
import ImageCacheStorage from '@/constants/module/storages/image_cache_storage';
import ChapterStorage from '@/constants/module/storages/chapter_storage';
import ComicStorage from '@/constants/module/storages/comic_storage';
import { CONTEXT } from '@/constants/module/context';
import Dropdown from '@/components/dropdown';
import { PageNavigationWidget, RequestChapterWidget, BookmarkWidget } from '../componenets/widgets';
import ChapterComponent from '../componenets/chapter';


import { get, store_comic_cover, get_requested_info, download_chapter } from '../modules/content'
import { createSocket, setupSocketNetworkListener } from '../modules/socket';





const Index = ({}:any) => {
    const SOURCE = useLocalSearchParams().source;
    const ID = useLocalSearchParams().comic_id;

    const {showMenuContext, setShowMenuContext}:any = useContext(CONTEXT)
    const {themeTypeContext, setThemeTypeContext}:any = useContext(CONTEXT)
    const {apiBaseContext, setApiBaseContext}:any = useContext(CONTEXT)
    const {socketBaseContext, setSocketBaseContext}:any = useContext(CONTEXT)
    const {widgetContext, setWidgetContext}:any = useContext(CONTEXT)
    const {showCloudflareTurnstileContext, setShowCloudflareTurnstileContext}:any = useContext(CONTEXT)

    

    const Dimensions = useWindowDimensions();
    const MAX_OFFSET = 50
    

    const [styles, setStyles]:any = useState("")
    const [translate, setTranslate]:any = useState({});


    const [socketInfo,setSocketInfo]:any = useState({})
    

    const [CONTENT, SET_CONTENT]:any = useState({})
    const [chapterRequested, setChapterRequested]:any = useState({})
    const [chapterToDownload, setChapterToDownload]:any = useState({})
    const [downloadProgress, setDownloadProgress]:any = useState(0)
    const [chapterQueue, setChapterQueue]:any = useState({})
    const [isLoading, setIsLoading]:any = useState(true);
    const [feedBack, setFeedBack]:any = useState("");
    const [showOption, setShowOption]:any = useState({type:null})
    const [showMoreSynopsis, setShowMoreSynopsis]:any = useState(false)
    const [refreshing, setRefreshing]:any = useState(false);
    const [sort, setSort]:any = useState("descending")
    const [page, setPage]:any = useState(1)
    const [bookmarked, setBookmarked]:any = useState({state:false,tag:""})
    const [history, setHistory]:any = useState({})
    
    const socketNetWorkListener:any = useRef(null)
    const socket:any = useRef(null)
    
    const controller = new AbortController();
    const signal = controller.signal;

    // Test Section
    useEffect(() => {
        // console.log(CONTENT)
    },[CONTENT])


    // Worker for downloading chapter
    const download_chapter_interval:any = useRef(null)
    const isDownloading:any = useRef(false)
    useEffect(() => {
        clearInterval(download_chapter_interval.current)
        
        download_chapter_interval.current = setInterval(() => {
            if (!isDownloading.current && Object.keys(chapterToDownload).length){
                isDownloading.current = true
                console.log(isDownloading.current,chapterToDownload)
                console.log("Downloading HERE")
                download_chapter(
                    setShowCloudflareTurnstileContext, isDownloading, SOURCE, ID, 
                    chapterRequested, setChapterRequested,
                    chapterToDownload, setChapterToDownload,
                    downloadProgress, setDownloadProgress,
                    signal,
                )
            }
        },1000)

        return () => clearInterval(download_chapter_interval.current)
    },[chapterToDownload])

    // Setting up socket listener
    useFocusEffect(useCallback(() => {
        const handleOpen = (event: any) => {
            console.log("SOCKET CONNECTED!")
        }
        const handleMessage = async (event: any) => {
            
            const stored_socket_info = await Storage.get("SOCKET_INFO") 
            const result = JSON.parse(event.data)
            
            if (result.type === "socket_info"){
                await Storage.store("SOCKET_INFO", {id:stored_socket_info.id,channel_name:result.channel_name})
                setSocketInfo({...socketInfo,channel_name:result.channel_name})
            }else if (result.type === "event_send"){
                const stored_comic = await ComicStorage.getByID(SOURCE, ID)
                if (!stored_comic) return
                const event = result.event
                if (event.type === "chapter_queue_info"){
                    console.log(event.chapter_queue)
                    setChapterQueue(event.chapter_queue)
                }else if (event.type === "chapter_ready_to_download"){
                    get_requested_info(setShowCloudflareTurnstileContext, setChapterRequested, setChapterToDownload, signal, SOURCE, ID)
                }
            }
        }
        
        NetInfo.fetch().then((state) => {
            if (!state.isConnected) return
            socketNetWorkListener.current = setupSocketNetworkListener(socketBaseContext, socket, handleOpen, handleMessage);
        })
        
        return () => {
            if (socket.current && socketNetWorkListener.current){
                socket.current.close()
                socket.current = null
                console.log("SOCKET DISCONNECTED")
            
                socketNetWorkListener.current()
                socketNetWorkListener.current = null
                console.log("SOCKET NETWORK LISTENER DISCONNECTED")
            }
            
        }
    },[]))

    // Clean up on unmount
    useFocusEffect(useCallback(() => {
        return () => {
            controller.abort();
        }
    },[]))


    const Load_Offline = async () => {
        Toast.show({
            type: 'info',
            text1: '🌐 No internet connection available.',
            text2: `Switching to offline mode.`,
            
            position: "bottom",
            visibilityTime: 6000,
            text1Style:{
                fontFamily:"roboto-bold",
                fontSize:((Dimensions.width+Dimensions.height)/2)*0.025
            },
            text2Style:{
                fontFamily:"roboto-medium",
                fontSize:((Dimensions.width+Dimensions.height)/2)*0.0185,
                
            },
        });

        try{
            const stored_comic = await ComicStorage.getByID(SOURCE, ID)
            
            if (stored_comic) {
                const DATA:any = {}
                DATA["id"] = ID
                
                for (const [key, value] of Object.entries(stored_comic.info)) {
                    DATA[key] = value
                }
                DATA["chapters"] = await ChapterStorage.getAll(`${SOURCE}-${ID}`,{exclude_field:["item"]})
                
                SET_CONTENT(DATA)
                setIsLoading(false)
                setFeedBack("")
            }else{
                Toast.show({
                    type: 'error',
                    text1: '🌐 No internet connection available and no local comic found.',
                    text2: `Unable to switch to offline mode.`,
                    
                    position: "bottom",
                    visibilityTime: 6000,
                    text1Style:{
                        fontFamily:"roboto-bold",
                        fontSize:((Dimensions.width+Dimensions.height)/2)*0.025
                    },
                    text2Style:{
                        fontFamily:"roboto-medium",
                        fontSize:((Dimensions.width+Dimensions.height)/2)*0.0185,
                        
                    },
                });
                setFeedBack("No internet connection available.")
                setIsLoading(false)
                
            }
        }catch(e:any){
            setFeedBack(e.message)
            console.error(e)
        }
    }

    // First load managing
    useEffect(() => { 
        (async ()=>{
            setShowMenuContext(false)
            setStyles(__styles(themeTypeContext,Dimensions))

            let __translate:any = await Storage.get("explore_show_translate")
            
            if (!__translate) {
                __translate = {state:false,from:"auto",to:"en"}
                await Storage.store("explore_show_translate",__translate)
            }else __translate = __translate

            setTranslate(__translate)

            const stored_comic = await ComicStorage.getByID(SOURCE,ID)
            if (stored_comic) {
                await get_requested_info(setShowCloudflareTurnstileContext, setChapterRequested, setChapterToDownload, signal, SOURCE, ID)
                
                setBookmarked({state:true,tag:stored_comic.tag})
                setHistory(stored_comic.history)
            }
            else setBookmarked({state:false,tag:""})

            const net_info = await NetInfo.fetch()
            if (net_info.isConnected){
                get(setShowCloudflareTurnstileContext, setIsLoading, signal, __translate, setFeedBack, SOURCE, ID, SET_CONTENT)
            }else{
                Load_Offline()
            }
            
        })()

    },[])

    
    // Refrest managing
    const onRefresh = async () => {
        if (!(styles && themeTypeContext && apiBaseContext)) return
        const net_info = await NetInfo.fetch()
        setIsLoading(true);
        SET_CONTENT([])

        const stored_comic = await ComicStorage.getByID(SOURCE,ID)
        if (stored_comic) {
            setBookmarked({state:true,tag:stored_comic.tag})
            setHistory(stored_comic.history)
        }
        else setBookmarked({state:false,tag:""})

        if (net_info.isConnected){
            get(setShowCloudflareTurnstileContext, setIsLoading, signal, translate, setFeedBack, SOURCE, ID, SET_CONTENT)
            if (stored_comic) {
                setHistory(stored_comic.history)
                get_requested_info(setShowCloudflareTurnstileContext, setChapterRequested, setChapterToDownload, signal, SOURCE, ID)
            }
        }else{
            Load_Offline()
        }
    }

    

    return (<>{(styles && !isLoading) 
        ? <ScrollView style={styles.screen_container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={()=>{
                    if (!isLoading) onRefresh()
                }} />
            }
            
        >
            <View style={styles.header_container}>
                <View style={styles.header_button_box}>
                    <TouchableRipple
                        rippleColor={Theme[themeTypeContext].ripple_color_outlined}
                        style={{
                            borderRadius:5,
                            borderWidth:0,
                            backgroundColor: "transparent",
                            padding:5,
                        }}
                        
                        onPress={()=>{
                            if (router.canGoBack()) router.back()
                            else router.replace("/explore")
                        }}
                    >
                        <Icon source={"arrow-left-thin"} size={((Dimensions.width+Dimensions.height)/2)*0.045} color={Theme[themeTypeContext].icon_color}/>
                    </TouchableRipple>

                </View>
                <View style={styles.header_button_box}>
                    <TouchableRipple
                        rippleColor={Theme[themeTypeContext].ripple_color_outlined}
                        style={{
                            borderRadius:5,
                            borderWidth:0,
                            backgroundColor: showOption.type === "translate" ? Theme[themeTypeContext].button_selected_color : "transparent",
                            padding:5,
                        }}
                        
                        onPress={() => {
                            if (showOption.type === "translate"){
                                setShowOption({type:null})
                            }else{
                                setShowOption({type:"translate"})
                            }
                        }}
                    >
                        <Icon source={translate.state ? "translate" : "translate-off"} size={((Dimensions.width+Dimensions.height)/2)*0.04} color={Theme[themeTypeContext].icon_color}/>
                    </TouchableRipple>

                    <TouchableRipple
                        rippleColor={Theme[themeTypeContext].ripple_color_outlined}
                        disabled={isLoading}
                        style={{
                            borderRadius:5,
                            borderWidth:0,
                            backgroundColor: "transparent",
                            padding:5,
                        }}
                        
                        onPress={()=>{
                            onRefresh()
                        }}
                    >
                        <Icon source={"refresh"} size={((Dimensions.width+Dimensions.height)/2)*0.04} color={Theme[themeTypeContext].icon_color}/>
                    </TouchableRipple>
                    <TouchableRipple
                        rippleColor={Theme[themeTypeContext].ripple_color_outlined}
                        style={{
                            borderRadius:5,
                            borderWidth:0,
                            backgroundColor: "transparent",
                            padding:5,
                        }}
                        
                        onPress={(async ()=>{
                            await Clipboard.setStringAsync(`https://comicmtl.netlify.app/view/${SOURCE}/${ID}/`)
                            Toast.show({
                                type: 'info',
                                text1: '📋 Copied to your clipboard.',
                                text2: `${apiBaseContext}/view/${SOURCE}/${ID}/`,
                                
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
                        })}
                    >
                        <Icon source={"share-variant"} size={((Dimensions.width+Dimensions.height)/2)*0.04} color={Theme[themeTypeContext].icon_color}/>
                    </TouchableRipple>

                </View>
            </View>
            <AnimatePresence>
                {showOption.type === "translate" &&
                    <View style={styles.option_container} key={"translate"}
                        from={{
                            opacity: 0,
                            scale: 0.9,
                        }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                        }}
                        exit={{
                            opacity: 0,
                            scale: 0.5,
                        }}
                        transition={{
                            type: 'timing',
                            duration: 500,
                        }}
                        exitTransition={{
                            type: 'timing',
                            duration: 250,
                        }}
                    >
                        <View style={{
                            display:"flex",
                            flexDirection:"row",
                            width:"100%",
                            justifyContent:"space-around",
                            gap:25,
                            
                        }}>
                            <View style={{flexGrow:1,}}>
                                <Dropdown
                                    theme_type={themeTypeContext}
                                    Dimensions={Dimensions}

                                    label='From Language' 
                                    data={[
                                        { 
                                            label: "Auto", 
                                            value: 'auto' 
                                        },
                                        { 
                                            label: "Chinese", 
                                            value: 'zh' 
                                        },
                                    ]}
                                    value={translate.from}
                                    onChange={async (item:any) => {
                                        setTranslate({...translate,from:item.value})
                                        await Storage.store("explore_show_translate",{...translate,from:item.value})
                                    }}
                                />
                            </View>
                            <View style={{flexGrow:1,}}>
                                <Dropdown
                                    theme_type={themeTypeContext}
                                    Dimensions={Dimensions}
                                    label='To Language' 
                                    data={[
                                        { 
                                            label: "English", 
                                            value: 'en' 
                                        },
                                    ]}
                                    value={translate.to}
                                    onChange={async (item:any) => {
                                        setTranslate({...translate,to:item.value})
                                        await Storage.store("explore_show_translate",{...translate,to:item.value})
                                    }}
                                />
                            </View>
                        </View>
                        <View style={{
                            width:"100%",
                            display:"flex",
                            alignItems:"center",
                            justifyContent:"center",
                            flexDirection:"row",
                        }}>
                            
                            <Button mode={"contained"} style={{
                                width:"auto",
                                borderRadius:8,
                                backgroundColor: translate.state ? "red": "green",
                            }}
                                onPress={async () => {
                                    if (translate.state){
                                        setTranslate({...translate,state:false})
                                        await Storage.store("explore_show_translate",{...translate,state:false})
                                    }else{
                                        setTranslate({...translate,state:true})
                                        await Storage.store("explore_show_translate",{...translate,state:true})
                                    }
                                    
                                }}
                            >
                                {translate.state ? "Disable Translation" : "Enable Translation"}
                            </Button>

                            
                        </View>
                    </View>
                }
            </AnimatePresence>
            <>{feedBack && !Object.keys(CONTENT).length 
                ? <View
                    style={{
                        width:"100%",
                        height:"auto",
                        display:"flex",
                        justifyContent:"center",
                        alignItems:"center",
                        padding:12,
                        paddingTop:20,
                    }}
                >
                    <Text
                        style={{
                            color:Theme[themeTypeContext].text_color,
                            fontFamily:"roboto-medium",
                            fontSize:(Dimensions.width+Dimensions.height)/2*0.03,
                            textAlign:"center",
                        }}
                    >{feedBack}</Text>
                </View>
                : <View style={styles.body_container}>
                    <View style={styles.body_box_1}>
                        <Image style={styles.item_cover} source={CONTENT.cover}/>
                        <View style={{flex:1,paddingBottom:15,height:"auto"}}>
                            <Text selectable={true}
                                style={{
                                    ...styles.item_info,
                                    fontSize:((Dimensions.width+Dimensions.height)/2)*0.05,
                                    fontFamily:"roboto-bold",
                                    paddingBottom:10,
                                }}
                            >{CONTENT.title}
                            </Text>
                            <Text selectable={true}
                                style={{
                                    ...styles.item_info,
                                    fontSize:((Dimensions.width+Dimensions.height)/2)*0.03
                                }}
                            >Author: {CONTENT.author || "Unknown"}
                            </Text>
                            <Text selectable={true}
                                style={{
                                    ...styles.item_info,
                                    fontSize:((Dimensions.width+Dimensions.height)/2)*0.03
                                }}
                            >Status: {CONTENT.status}
                            </Text>
                            <Text selectable={true}
                                style={{
                                    ...styles.item_info,
                                    fontSize:((Dimensions.width+Dimensions.height)/2)*0.03
                                }}
                            >Category: {CONTENT.category}
                            </Text>
                            <Text selectable={true}
                                style={{
                                    ...styles.item_info,
                                    fontSize:((Dimensions.width+Dimensions.height)/2)*0.03
                                }}
                            >Updated: {CONTENT.updated}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.body_box_2}>
                        <TouchableRipple
                            rippleColor={Theme[themeTypeContext].ripple_color_outlined}
                            style={{
                                display:"flex",
                                flexDirection:"row",
                                paddingRight:10,
                                alignItems:"center",
                                alignSelf:"flex-start",
                                borderWidth:2,
                                borderRadius:5,
                                borderColor:Theme[themeTypeContext].border_color,
                                
                                shadowColor: Theme[themeTypeContext].shadow_color,
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.25,
                                shadowRadius: 3.84,
                                elevation: 5,
                            }}
                            onPress={()=>{
                                setWidgetContext({state:true,component:
                                    <BookmarkWidget
                                        onRefresh={onRefresh}
                                        SOURCE={SOURCE}
                                        ID={ID}
                                        CONTENT={CONTENT}
                                    />
                                })
                            }}
                        >   
                            <>{bookmarked.state
                                ?   <>
                                        <Icon source={"bookmark"} size={((Dimensions.width+Dimensions.height)/2)*0.05} color={Theme[themeTypeContext].icon_color}/>
                                        <Text selectable={false}
                                            numberOfLines={1}
                                            style={{
                                                color:Theme[themeTypeContext].text_color,
                                                fontSize:((Dimensions.width+Dimensions.height)/2)*0.035,
                                                fontFamily:"roboto-bold",
                                            }}
                                        >
                                            {bookmarked.tag}
                                        </Text>
                                    </>
                                : <>
                                    <Icon source={"bookmark-outline"} size={((Dimensions.width+Dimensions.height)/2)*0.05} color={Theme[themeTypeContext].icon_color}/>
                                    <Text selectable={false}
                                        numberOfLines={1}
                                        style={{
                                            color:Theme[themeTypeContext].text_color,
                                            fontSize:((Dimensions.width+Dimensions.height)/2)*0.035,
                                            fontFamily:"roboto-bold",
                                        }}
                                    >
                                        Bookmark
                                    </Text>
                                    
                                </>
                            }</>
                            

                        </TouchableRipple>
                        
                            {Object.keys(history).length
                                ? <TouchableRipple
                                    rippleColor={Theme[themeTypeContext].ripple_color_outlined}
                                    style={{
                                        width:Dimensions.width*0.60,
                                        display:"flex",
                                        flexDirection:"column",
                                        justifyContent:"center",
                                        alignSelf:"center",
                                        padding:8,
                                        borderRadius:Dimensions.width*0.60/2,
                                        backgroundColor:Theme[themeTypeContext].border_color,

                                        shadowColor: Theme[themeTypeContext].shadow_color,
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.25,
                                        shadowRadius: 3.84,
                                        elevation: 5,
                                        
                                    }}
                                    onPress={()=>{
                                        router.push(`/read/${SOURCE}/${ID}/${history.idx}/`)
                                    }}
                                >
                                    <View
                                        style={{
                                            display:"flex",
                                            flexDirection:"column",  
                                            gap:12,
                                            alignItems:"center",
                                        }}
                                    >
                                        <Text selectable={false}
                                            numberOfLines={1}
                                            style={{
                                                color:Theme[themeTypeContext].text_color,
                                                fontSize:((Dimensions.width+Dimensions.height)/2)*0.0325,
                                                fontFamily:"roboto-bold",
                                            }}
                                        >
                                            Continue
                                        </Text>
                                        <Text selectable={false}
                                            numberOfLines={1}
                                            style={{
                                                color:Theme[themeTypeContext].text_color,
                                                fontSize:((Dimensions.width+Dimensions.height)/2)*0.025,
                                                fontFamily:"roboto-bold",
                                            }}
                                        >
                                            {history.title}
                                        </Text>
                                    </View>
                                </TouchableRipple>
                                : <TouchableRipple
                                rippleColor={Theme[themeTypeContext].ripple_color_outlined}
                                style={{
                                    width:Dimensions.width*0.60,
                                    display:"flex",
                                    flexDirection:"column",
                                    justifyContent:"center",
                                    alignSelf:"center",
                                    padding:8,
                                    paddingVertical:12,
                                    borderRadius:Dimensions.width*0.60/2,
                                    backgroundColor:Theme[themeTypeContext].border_color,

                                    shadowColor: Theme[themeTypeContext].shadow_color,
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.25,
                                    shadowRadius: 3.84,
                                    elevation: 5,
                                    
                                }}
                                onPress={async ()=>{
                                    
                                    if (bookmarked.state){
                                        let chapter
                                        if (sort === "descending"){
                                            chapter = CONTENT?.chapters[CONTENT.chapters.length - 1]
                                        }else{
                                            chapter = CONTENT?.chapters[0]
                                        }
                                        const stored_chapter = await ChapterStorage.get(`${SOURCE}-${ID}`,chapter.id)
                                        console.log(stored_chapter)
                                        if (stored_chapter.data_state === "completed"){
                                            await ComicStorage.updateHistory(SOURCE,ID,{idx:chapter.idx, id:chapter.id, title:chapter.title})
                                            router.push(`/read/${SOURCE}/${ID}/${stored_chapter.idx}/`)
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
                                    }else{
                                        Toast.show({
                                            type: 'error',
                                            text1: '🔖 Bookmark required.',
                                            text2: `Add this comic to your bookmark to start reading.`,
                                            
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
                                <View
                                    style={{
                                        display:"flex",
                                        flexDirection:"column",  
                                        gap:12,
                                        alignItems:"center",
                                    }}
                                >
                                    <Text selectable={false}
                                        numberOfLines={1}
                                        style={{
                                            color:Theme[themeTypeContext].text_color,
                                            fontSize:((Dimensions.width+Dimensions.height)/2)*0.0325,
                                            fontFamily:"roboto-bold",
                                        }}
                                    >
                                        Read now
                                    </Text>
                                </View>
                            </TouchableRipple>
                            }
                        
                    </View>
                    <View style={styles.body_box_3}>
                        <View
                            style={{
                                display:"flex",
                                flexDirection:"row",
                                
                                justifyContent:"space-between",
                            }}
                        >
                            <View>
                                <Text 
                                    style={{
                                        ...styles.item_info,
                                        fontSize:((Dimensions.width+Dimensions.height)/2)*0.035,
                                        fontFamily:"roboto-bold",
                                    }}
                                >Synopsis:</Text>
                            </View>
                            
                            <Button mode='outlined'
                                onPress={() => {
                                    if (showMoreSynopsis) setShowMoreSynopsis(false)
                                    else setShowMoreSynopsis(true)
                                }}
                                style={{borderWidth:0}}
                                labelStyle={{
                                    fontSize:((Dimensions.width+Dimensions.height)/2)*0.025,
                                    fontFamily:"roboto-medium",
                                    color:"cyan",

                                }}
                            >{showMoreSynopsis ? "Show Less" : "Show More"}</Button>

                        </View>
                        
                        <Text selectable={true}
                            style={{
                                ...styles.item_info,
                                fontSize:((Dimensions.width+Dimensions.height)/2)*0.025,
                                fontFamily:"roboto-medium",
                                paddingBottom:10,
                                borderColor: Theme[themeTypeContext].border_color,
                                borderBottomWidth:showMoreSynopsis ? 0 : 5,
                                borderRadius:8,
                            }}
                            numberOfLines={showMoreSynopsis ? 0 : 2} 
                            ellipsizeMode='tail'
                        >{CONTENT.synopsis}</Text>
                    </View>
                    <View style={styles.body_box_4}>
                        <View 
                            style={{
                                display:"flex",
                                flexDirection:"row",
                                alignContent:"center"
                            }}
                        >
                            <View style={{flex:1}}>
                                <Text 
                                    style={{
                                        ...styles.item_info,
                                        fontSize:((Dimensions.width+Dimensions.height)/2)*0.035,
                                        fontFamily:"roboto-bold",
                                        textAlign:"center",
                                        borderColor: Theme[themeTypeContext].border_color,
                                        
                                    }}
                                >Chapters</Text>
                            </View>
                            <TouchableRipple
                                rippleColor={Theme[themeTypeContext].ripple_color_outlined}
                                style={{
                                    borderWidth:0,
                                    borderRadius:5,
                                    padding:5,
                                }}
                                onPress={()=>{
                                    if (sort === "descending") setSort("ascending")
                                    else setSort("descending")
                                    SET_CONTENT({...CONTENT,chapters:CONTENT.chapters.reverse()})
                                }}
                            >
                                {sort === "descending"
                                    ? <Icon source={"sort-descending"} size={((Dimensions.width+Dimensions.height)/2)*0.0425} color={Theme[themeTypeContext].icon_color}/>
                                    : <Icon source={"sort-ascending"} size={((Dimensions.width+Dimensions.height)/2)*0.0425} color={Theme[themeTypeContext].icon_color}/>
                                }
                                
                            </TouchableRipple>
                        </View>
                        
                        <View style={styles.chapter_box}>
                            <>{CONTENT.chapters.length
                                ? <>{CONTENT.chapters.slice((page-1)*MAX_OFFSET,((page-1)*MAX_OFFSET)+MAX_OFFSET).map((chapter:any,index:number) => 
                                    <ChapterComponent 
                                        key={index}
                                        SOURCE={SOURCE}
                                        ID={ID}
                                        page={page}
                                        sort={sort}
                                        chapter={chapter}
                                        signal={signal}
                                        isDownloading={isDownloading}
                                        chapterRequested={chapterRequested}
                                        setChapterRequested={setChapterRequested}
                                        chapterToDownload={chapterToDownload}
                                        setChapterToDownload={setChapterToDownload}
                                        downloadProgress={downloadProgress}
                                        setDownloadProgress={setDownloadProgress}
                                        setChapterQueue={setChapterQueue}
                                        chapterQueue={chapterQueue}
                                    />
                                )}</>
                                : <Text
                                    style={{
                                        color:Theme[themeTypeContext].text_color,
                                        fontFamily:"roboto-medium",
                                        fontSize:(Dimensions.width+Dimensions.height)/2*0.03,
                                        textAlign:"center",
                                        padding:16,
                                    }}
                                >🫠 No chapter found.</Text>
                            }</>
                        </View>
                    </View>
                    {Object.keys(CONTENT).length
                        ? <View 
                            style={{
                                display:"flex",
                                flexDirection:"row",
                                justifyContent:"center",
                                gap:8,
                                padding:12,
                            }}
                        >
                            <Button mode='outlined' 
                                labelStyle={{
                                    color:Theme[themeTypeContext].text_color,
                                    fontFamily:"roboto-medium",
                                    fontSize:(Dimensions.width+Dimensions.height)/2*0.03
                                }} 
                                style={{borderWidth:0}} 
                                onPress={(()=>{
                                    if (page === 1) return
                                    setPage((page:number) => page-1)
                                    
                                }
                                    
                                )}
                            >{"<"}</Button>
                            <Button mode='outlined'
                                labelStyle={{
                                    color:Theme[themeTypeContext].text_color,
                                    fontFamily:"roboto-medium",
                                    fontSize:(Dimensions.width+Dimensions.height)/2*0.02
                                }} 
                                style={{
                                    borderRadius:8,
                                    borderColor:Theme[themeTypeContext].border_color,
                                }} 
                                onPress={(()=>{
                                    setWidgetContext({state:true,component:<PageNavigationWidget MAX_OFFSET={MAX_OFFSET} setPage={setPage} CONTENT={CONTENT}/>})
                                })}

                            >{page}</Button>
                            <Button mode='outlined' 
                                labelStyle={{
                                    color:Theme[themeTypeContext].text_color,
                                    fontFamily:"roboto-medium",
                                    fontSize:(Dimensions.width+Dimensions.height)/2*0.03
                                }} 
                                style={{borderWidth:0}} 
                                onPress={(()=>{
                                    if (parseInt(page) >= Math.ceil(CONTENT.chapters.length/MAX_OFFSET)) return
                                    setPage((page:number) => page+1)
                                    
                                })}
                            >{">"}</Button>
                        </View>
                        : <></>
                    }
                </View>
            }</>
            
        </ScrollView>
        : <View style={{zIndex:5,width:"100%",height:"100%",display:"flex",justifyContent:"center",alignItems:"center",backgroundColor:Theme[themeTypeContext].background_color}}>
            <Image setShowCloudflareTurnstile={setShowCloudflareTurnstileContext} source={require("@/assets/gif/cat-loading.gif")} style={{width:((Dimensions.width+Dimensions.height)/2)*0.15,height:((Dimensions.width+Dimensions.height)/2)*0.15}}/>
        </View>
    }</>)
    

}

export default Index;

