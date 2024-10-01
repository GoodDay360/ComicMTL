import React, { useEffect, useState, useCallback, useContext, useRef } from 'react';
import { Link, router, useLocalSearchParams, useNavigation, useFocusEffect } from 'expo-router';
import Image from '@/components/Image';
import { StyleSheet, useWindowDimensions, ScrollView, Pressable, RefreshControl, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon, MD3Colors, Button, Text, TextInput, TouchableRipple } from 'react-native-paper';

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
import { RequestChapterWidget, BookmarkWidget } from '../componenets/widgets';


import { get, store_comic_cover } from '../module/content'
import { createSocket, setupSocketNetworkListener } from '../module/socket';





const Show = ({}:any) => {
    const SOURCE = useLocalSearchParams().source;
    const ID = useLocalSearchParams().id;

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

    const [socket, setSocket]:any = useState(null)
    const [socketInfo,setSocketInfo]:any = useState({})
    const [socketNetworkListener,setSocketNetworkListener]:any = useState(null)
    

    const [CONTENT, SET_CONTENT]:any = useState({})
    const [isLoading, setIsLoading]:any = useState(true);
    const [feedBack, setFeedBack]:any = useState("");
    const [showOption, setShowOption]:any = useState({type:null})
    const [showMoreSynopsis, setShowMoreSynopsis]:any = useState(false)
    const [refreshing, setRefreshing]:any = useState(false);
    const [sort, setSort]:any = useState("descending")
    const [page, setPage]:any = useState(1)
    const [bookmarked, setBookmarked]:any = useState(false)
    
    const controller = new AbortController();
    const signal = controller.signal;

    // Test Section
    useEffect(() => {(async ()=>{
        // return
        // console.log("asdsadsad",await ComicStorage.getByID("id-test"))
        // await ComicStorage.store("id-test", "tag-test", {type:"AA"});
        // console.log("AAAAA",await ChapterStorage.getAll(`${SOURCE}-${ID}`))
        // console.log("AAAAA2",await ChapterStorage.get(`${SOURCE}-${ID}`, '/manga-od825111/1/30.html'))
        // return
        // console.log(`${SOURCE}-${ID}`)
        // await ChapterStorage.add(`${SOURCE}-${ID}`, 251,'/manga-od825111/1/31.html', 'KEooo', "I AM BLOB");

    })()},[])

    useFocusEffect(useCallback(() => {
        var unsubscribe:any = null
        const handleOpen = (event: any) => {
            console.log("o",event)
        }
        const handleMessage = async (event: any) => {
            const stored_socket_info = await Storage.get("SOCKET_INFO") 
            const result = JSON.parse(event.data)
            console.log("m",result)
            if (result.type === "socket_info"){
                await Storage.store("SOCKET_INFO", {id:stored_socket_info.id,channel_name:result.channel_name})
                setSocketInfo({...socketInfo,channel_name:result.channel_name})
            }
        }
        if (!socket){
            createSocket(socketBaseContext, setSocket, handleOpen, handleMessage);
        }else{
           unsubscribe = setupSocketNetworkListener(socketBaseContext, socket, setSocket, handleOpen, handleMessage);
        }
        return () => {
            if (socket){
                socket.close()
                setSocket(null)
                console.log("SOCKET DISCONNECTED")
            }
            if (unsubscribe) {
                unsubscribe()
                unsubscribe = null
                console.log("SOCKET NETWORK LISTENER DISCONNECTED")
            }
        }
    },[socket,socketNetworkListener]))

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
            const stored_comic = await ComicStorage.getByID(`${SOURCE}-${ID}`)
            
            if (stored_comic) {
                const DATA:any = {}
                DATA["id"] = ID
                
                for (const [key, value] of Object.entries(stored_comic.info)) {
                    DATA[key] = value
                }
                DATA["chapters"] = await ChapterStorage.getAll(`${SOURCE}-${ID}`,{exclude_field:["data","item"]})
                console.log(DATA)
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


    const Request_Download = async (CHAPTER:any) => {
        const stored_comic = await ComicStorage.getByID(`${SOURCE}-${ID}`)
        if (stored_comic)  setWidgetContext({state:true,component:() => RequestChapterWidget(SOURCE,ID,CHAPTER)})
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

            const stored_comic = await ComicStorage.getByID(`${SOURCE}-${ID}`)
            if (stored_comic) setBookmarked(true)
            else setBookmarked(false)

            const net_info = await NetInfo.fetch()
            if (net_info.isConnected){
                get(setShowCloudflareTurnstileContext, setIsLoading, signal, __translate, setFeedBack, SOURCE, ID, SET_CONTENT)
            }else{
                Load_Offline()
            }
            
        })()

        return () => {
            controller.abort();
        };
    },[])

    const onRefresh = async () => {
        if (!(styles && themeTypeContext && apiBaseContext)) return
        const net_info = await NetInfo.fetch()
        setIsLoading(true);
        SET_CONTENT([])

        const stored_comic = await ComicStorage.getByID(`${SOURCE}-${ID}`)
        if (stored_comic) setBookmarked(true)
        else setBookmarked(false)

        if (net_info.isConnected){
            get(setShowCloudflareTurnstileContext, setIsLoading, signal, translate, setFeedBack, SOURCE, ID, SET_CONTENT)
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
                            else router.navigate("/explore")
                        }}
                    >
                        <Icon source={"chevron-left"} size={((Dimensions.width+Dimensions.height)/2)*0.045} color={Theme[themeTypeContext].icon_color}/>
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
                            await Clipboard.setStringAsync(`${apiBaseContext}/view/${SOURCE}/${ID}/`)
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
            {showOption.type === "translate" &&
                <View style={styles.option_container}
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
                                alignSelf:"flex-start",
                                borderWidth:2,
                                borderRadius:5,
                                borderColor:Theme[themeTypeContext].border_color,
                            }}
                            onPress={()=>{
                                setWidgetContext({state:true,component:()=>{return BookmarkWidget(onRefresh,SOURCE,CONTENT)}})
                            }}
                        >   
                            <>{bookmarked 
                                ? <Icon source={"bookmark"} size={((Dimensions.width+Dimensions.height)/2)*0.05} color={Theme[themeTypeContext].icon_color}/>
                                : <Icon source={"bookmark-outline"} size={((Dimensions.width+Dimensions.height)/2)*0.05} color={Theme[themeTypeContext].icon_color}/>
                            }</>
                            

                        </TouchableRipple>
                        <Button mode='contained'
                            style={{
                                alignSelf:"center",
                                width:"65%",
                                height: "auto",
                                
                                // Notice I use border_color instead. It just look good to me :)
                                backgroundColor:Theme[themeTypeContext].border_color,
                                borderWidth:3,
                            }}
                            labelStyle={{
                                fontSize:((Dimensions.width+Dimensions.height)/2)*0.038,
                                fontFamily:"roboto-bold",
                                color:Theme[themeTypeContext].text_color,
                                paddingVertical:8,
                                marginBottom:Platform.OS === "web" ? 8 : 0,
                                
                            }}
                            onPress={()=>{}}
                        >
                            Read
                        </Button>
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
                                ? <>{CONTENT.chapters.slice((page-1)*MAX_OFFSET,((page-1)*MAX_OFFSET)+MAX_OFFSET).map((chapter:any,index:number) => (
                                    <View key={index}
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
                                            onPress={( () => {
                                                
                                                Request_Download(chapter)
                                            })}
                                        >
                                            {chapter.title}
                                        </Button>
                                        <TouchableRipple
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
                                    </View>
                                ))}</>
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
                                    setWidgetContext({state:true,component:()=>{
                                        const [goToPage, setGoToPage] = useState("");
                                        const [_feedBack, _setFeedBack] = useState("");
                                        return (<View 
                                            style={{
                                                backgroundColor:Theme[themeTypeContext].background_color,
                                                maxWidth:500,
                                                width:"100%",
                                                
                                                borderColor:Theme[themeTypeContext].border_color,
                                                borderWidth:2,
                                                borderRadius:8,
                                                padding:12,
                                                display:"flex",
                                                justifyContent:"center",
                                                
                                                flexDirection:"column",
                                                gap:12,
                                            }}>
                                            <View style={{height:"auto"}}>
                                                <TextInput mode="outlined" label="Go to page"  textColor={Theme[themeTypeContext].text_color} maxLength={1000000000}
                                                    placeholder="Go to page"
                                                    right={<TextInput.Affix text={`/${Math.ceil(CONTENT.chapters.length/MAX_OFFSET)}`} />}
                                                    style={{
                                                        
                                                        backgroundColor:Theme[themeTypeContext].background_color,
                                                        borderColor:Theme[themeTypeContext].border_color,
                                                        
                                                    }}
                                                    outlineColor={Theme[themeTypeContext].text_input_border_color}
                                                    value={goToPage}
                                                    onChange={(event)=>{
                                                        
                                                        const value = event.nativeEvent.text
                                                        
                                                        const isInt = /^-?\d+$/.test(value);
                                                        if (isInt || value === "") {
                                                            if (parseInt(value) > Math.ceil(CONTENT.chapters.length/MAX_OFFSET)){
                                                                _setFeedBack("Page is out of index.")
                                                            }else{
                                                                _setFeedBack("")
                                                                setGoToPage(value)
                                                            }
                                                            
                                                        }
                                                        else _setFeedBack("Input is not a valid number.")
                                                        
                                                    }}
                                                />
                                                
                                            </View>
                                            {_feedBack 
                                                ? <Text 
                                                    style={{
                                                        color:Theme[themeTypeContext].text_color,
                                                        fontFamily:"roboto-medium",
                                                        fontSize:(Dimensions.width+Dimensions.height)/2*0.02,
                                                        textAlign:"center",
                                                    }}
                                                    
                                                >{_feedBack}</Text>
                                                : <></>
                                            }
                                            <View 
                                                style={{
                                                    display:"flex",
                                                    flexDirection:"row",
                                                    width:"100%",
                                                    justifyContent:"space-around",
                                                    alignItems:"center",
                                                }}
                                            >
                                                <Button mode='contained' 
                                                    labelStyle={{
                                                        color:Theme[themeTypeContext].text_color,
                                                        fontFamily:"roboto-medium",
                                                        fontSize:(Dimensions.width+Dimensions.height)/2*0.02
                                                    }} 
                                                    style={{backgroundColor:"red",borderRadius:5}} 
                                                    onPress={(()=>{
                                                        
                                                        setWidgetContext({state:false,component:undefined})
                                                        
                                                    })}
                                                >Cancel</Button>
                                                <Button mode='contained' 
                                                labelStyle={{
                                                    color:Theme[themeTypeContext].text_color,
                                                    fontFamily:"roboto-medium",
                                                    fontSize:(Dimensions.width+Dimensions.height)/2*0.02
                                                }} 
                                                style={{backgroundColor:"green",borderRadius:5}} 
                                                onPress={(()=>{
                                                    const isInt = /^-?\d+$/.test(goToPage);
                                                    if (isInt) {
                                                        if (parseInt(goToPage) > Math.ceil(CONTENT.chapters.length/MAX_OFFSET) || !parseInt(goToPage)){
                                                            _setFeedBack("Page is out of index.")
                                                        }else{
                                                            setPage(parseInt(goToPage))
                                                            setWidgetContext({state:false,component:undefined})
                                                        }
                                                        
                                                    }else _setFeedBack("Input is not a valid number.")
                                                })}
                                            >Go</Button>
                                            </View>
                                            
                                        </View>)
                                    }})
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

export default Show;

