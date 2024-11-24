import React, { useEffect, useState, useCallback, useContext, useRef, useMemo } from 'react';
import { Link, router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Image as RNImage, StyleSheet, useWindowDimensions, ScrollView, Pressable, RefreshControl, Platform, FlatList, TouchableOpacity } from 'react-native';
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
import { Marquee } from '@animatereactnative/marquee';
import { Slider } from '@rneui/themed-edge';

import Storage from '@/constants/module/storages/storage';
import ChapterStorage from '@/constants/module/storages/chapter_storage';
import Image from '@/components/Image';
import {CONTEXT} from '@/constants/module/context';
import {blobToBase64, base64ToBlob, getImageLayout} from "@/constants/module/file_manager";
import Theme from '@/constants/theme';
import ChapterImage from '../../components/chapter_image';
import Menu from '../../components/menu/menu';
import Disqus from '../../components/disqus';
import { get_chapter } from '../../modules/get_chapter';
import ComicStorage from '@/constants/module/storages/comic_storage';

const Index = ({}:any) => {
    const SOURCE = useLocalSearchParams().source;
    const COMIC_ID = useLocalSearchParams().comic_id;
    const Dimensions = useWindowDimensions();
    const StaticDimensions = useMemo(() => Dimensions, [])
    

    const {showMenuContext, setShowMenuContext}:any = useContext(CONTEXT)
    const {themeTypeContext, setThemeTypeContext}:any = useContext(CONTEXT)
    const {showCloudflareTurnstileContext, setShowCloudflareTurnstileContext}:any = useContext(CONTEXT)
    const {apiBaseContext, setApiBaseContext}:any = useContext(CONTEXT)

    const [isError,setIsError]:any = useState({state:false,text:""})
    const [isLoading, setIsLoading]:any = useState(true)
    const [chapterInfo, setChapterInfo]:any = useState({})
    const [showOptions, setShowOptions]:any = useState({type:"general",state:false})
    const [DATA, SET_DATA]:any = useState([])
    const [isAdding, setIsAdding]:any = useState(false)
    const [zoom, setZoom]:any = useState(0)

    const CHAPTER_IDX = useRef(Number(useLocalSearchParams().chapter_idx as string));


    useFocusEffect(useCallback(() => {
        setShowMenuContext(null)
        return () => {
        }
    },[]))

    // First Load
    useEffect(()=>{(async () => {
        if (!SOURCE || !COMIC_ID || !CHAPTER_IDX.current){
            setIsError({state:true,text:"Invalid source, comic id or chapter idx!"})
            return
        }

        const stored_chapter = await ChapterStorage.getByIdx(`${SOURCE}-${COMIC_ID}`,CHAPTER_IDX.current, {exclude_fields:["data"]})   
        if (stored_chapter?.data_state !== "completed"){
            setIsError({state:true,text:"Chapter is not download yet!"})
            return
        }

        setChapterInfo({
            chapter_id: stored_chapter?.id,
            chapter_idx: stored_chapter?.id,
            title: stored_chapter?.title,
        })
        const stored_chapter_zoom = await Storage.get("CHAPTER_ZOOM") || 0
        setZoom(stored_chapter_zoom)

        const chapter_current_data = await get_chapter(SOURCE,COMIC_ID,CHAPTER_IDX.current)

        SET_DATA(chapter_current_data)
        setIsLoading(false)
    })()},[])


    useFocusEffect(useCallback(() => {
        return () => {
            SET_DATA([])
        }
    },[]))

    const renderItem = useCallback(({item,index}:any) => {
        return <ChapterImage key={index} item={item} zoom={zoom} showOptions={showOptions} setShowOptions={setShowOptions} setIsLoading={setIsLoading} SET_DATA={SET_DATA}/>
    },[zoom,showOptions])


    return (<>
        {isError.state
            ? <View
                style={{
                    display:"flex",
                    flexDirection:"column",
                    gap:8,
                    width:"100%",
                    height:"100%",
                    backgroundColor:Theme[themeTypeContext].background_color,
                }}
            >
                <View
                    style={{
                        width:"100%",
                        height:"auto",
                        display:"flex",
                        flexDirection:"row",
                        justifyContent:"space-between",
                        alignItems:"center",
                        padding:16,
                        gap:8,
                        backgroundColor:Theme[themeTypeContext].background_color,
                        borderBottomWidth:2,
                        borderColor:Theme[themeTypeContext].border_color,
                        pointerEvents:"auto",
                    }}
                >
                    <TouchableRipple
                        rippleColor={Theme[themeTypeContext].ripple_color_outlined}
                        style={{
                            borderRadius:5,
                            borderWidth:0,
                            backgroundColor: "transparent",
                            padding:5,
                            
                        }}
                        
                        onPress={()=>{
                            router.replace("/explore")
                        }}
                    >
                        <Icon source={"arrow-left-thin"} size={((Dimensions.width+Dimensions.height)/2)*0.05} color={Theme[themeTypeContext].icon_color}/>
                    </TouchableRipple>
                    <View
                        style={{
                            flex:1,
                        }}
                    >
                        <Text selectable={false}
                            numberOfLines={1}
                            style={{
                                color:Theme[themeTypeContext].text_color,
                                fontSize:((Dimensions.width+Dimensions.height)/2)*0.045,
                                fontFamily:"roboto-bold",
                            }}
                        >
                            Explore
                        </Text>
                    </View>
                </View>
                <View 
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
                            fontSize:(Dimensions.width+Dimensions.height)/2*0.03
                        }}
                    >{isError.text}</Text>
                </View>
            </View>
            : <>{!isLoading
                ? <>
                    <View
                        
                        style={{
                            width:"100%",
                            height:"100%",
                            backgroundColor:Theme[themeTypeContext].background_color,
                            zIndex:0
                        }}
                    >   
                        <FlatList 
                            data={DATA}
                            renderItem={renderItem}
                            windowSize={21}
                            ItemSeparatorComponent={undefined}
                        />
                    </View>
                    <AnimatePresence exitBeforeEnter>
                        {showOptions.state && 
                            <View
                                style={{
                                    position:"absolute",
                                    width:"100%",
                                    height:"100%",
                                    display:"flex",
                                    flexDirection:"column",
                                    zIndex:1,
                                }}
                            >
                                <>{showOptions.type === "general" && <>
                                    <Pressable
                                        onPress={()=>{setShowOptions({...showOptions,state:!showOptions.state})}}
                                        style={{flex:1,backgroundColor:"rgba(0,0,0,0.5)",pointerEvents:"auto"}}
                                    >
                                        <View  
                                            id='reading-options'
                                            style={{
                                                flex:1,
                                                display:"flex",
                                                flexDirection:"column",
                                                alignItems:"flex-start",
                                                backgroundColor:"transparent",
                                                pointerEvents:"auto",
                                            }}
                                            from={{
                                                opacity: 0,
                                            }}
                                            animate={{
                                                opacity: 1,

                                            }}
                                            exit={{
                                                opacity: 0,
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
                                            
                                                <View 
                                                    style={{
                                                        width:"100%",
                                                        height:"auto",
                                                        display:"flex",
                                                        flexDirection:"row",
                                                        justifyContent:"space-between",
                                                        alignItems:"center",
                                                        padding:16,
                                                        gap:8,
                                                        backgroundColor:Theme[themeTypeContext].background_color,
                                                        borderBottomWidth:2,
                                                        borderColor:Theme[themeTypeContext].border_color,
                                                        pointerEvents:"auto",
                                                    }}
                                                >
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
                                                            else router.replace(`/view/${SOURCE}/${COMIC_ID}/`)
                                                        }}
                                                    >
                                                        <Icon source={"arrow-left-thin"} size={((Dimensions.width+Dimensions.height)/2)*0.05} color={Theme[themeTypeContext].icon_color}/>
                                                    </TouchableRipple>
                                                    <View
                                                        style={{
                                                            flex:1,
                                                        }}
                                                    >
                                                        <Text selectable={false}
                                                            numberOfLines={1}
                                                            style={{
                                                                color:Theme[themeTypeContext].text_color,
                                                                fontSize:((Dimensions.width+Dimensions.height)/2)*0.045,
                                                                fontFamily:"roboto-bold",
                                                            }}
                                                        >
                                                            {chapterInfo.title}
                                                        </Text>
                                                    </View>
                                                    
                                                </View>
                                                <View 
                                                    style={{
                                                        display:"flex",
                                                        flexDirection:"column",
                                                        width:"100%",
                                                        flex:1,
                                                        padding:16,
                                                        alignItems:"flex-end",
                                                        gap:12,
                                                        justifyContent:"center",
                                                    }}
                                                >
                                                    <View style={{width:"auto",height:"auto",display:"flex",flexDirection:"column",alignItems:"center",gap:8, pointerEvents:"auto"}}>
                                                        <View style={{
                                                            width:"auto",
                                                            height:"auto",
                                                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                                            paddingHorizontal:12,
                                                            paddingVertical:12,
                                                            borderRadius:12,
                                                            
                                                        }}>
                                                            <Slider
                                                                style={{ 
                                                                    width: ((Dimensions.width+Dimensions.height)/2)*0.06,
                                                                    height: Dimensions.height*0.525,
                                                                    pointerEvents:"auto",
                                                                }}
                                                                value={zoom}
                                                                onValueChange={async (value)=>{
                                                                    await Storage.store("CHAPTER_ZOOM", value)
                                                                    setZoom(value)
                                                                }}
                                                                
                                                                maximumValue={80}
                                                                minimumValue={-80}
                                                                step={1}
                                                                
                                                                orientation="vertical"
                                                                
                                                                minimumTrackTintColor={Theme[themeTypeContext].text_color}
                                                                maximumTrackTintColor={Theme[themeTypeContext].border_color}

                                                                thumbStyle={{ 
                                                                    height: "auto", 
                                                                    width: "auto", 
                                                                    backgroundColor: Theme[themeTypeContext].background_color,
                                                                    padding:5,
                                                                    
                                                                }}
                                                                thumbProps={{children: (<>
                                                                    <>{zoom < 0
                                                                        && <Icon source={"magnify-plus-outline"} size={((Dimensions.width+Dimensions.height)/2)*0.05} color={Theme[themeTypeContext].icon_color}/>
                                                                    }</>
                                                                    <>{zoom === 0
                                                                        && <Icon source={"magnify"} size={((Dimensions.width+Dimensions.height)/2)*0.05} color={Theme[themeTypeContext].icon_color}/>
                                                                    }</>
                                                                    <>{zoom > 0
                                                                        && <Icon source={"magnify-minus-outline"} size={((Dimensions.width+Dimensions.height)/2)*0.05} color={Theme[themeTypeContext].icon_color}/>
                                                                    }</>
                                                                </>)}}

                                                                
                                                            />
                                                            
                                                        </View>
                                                        <TouchableRipple
                                                            rippleColor={Theme[themeTypeContext].ripple_color_outlined}
                                                            style={{
                                                                borderRadius:5,
                                                                borderWidth:0,
                                                                backgroundColor: "transparent",
                                                                padding:5,
                                                                pointerEvents:"auto",
                                                            }}
                                                            
                                                            onPress={async ()=>{
                                                                await Storage.store("CHAPTER_ZOOM", 0)
                                                                setZoom(0)
                                                            }}
                                                        >
                                                            <Icon source={"magnify-remove-cursor"} size={((Dimensions.width+Dimensions.height)/2)*0.05} color={Theme[themeTypeContext].icon_color}/>
                                                        </TouchableRipple>
                                                    </View>
                                                </View>
                                            
                                            
                                        </View>
                                        
                                    </Pressable>
                                </>}</>
                                <>{showOptions.type === "comments"&& <>
                                    <View
                                        style={{
                                            width:"100%",
                                            height:"auto",
                                            padding:16,
                                            backgroundColor:Theme[themeTypeContext].background_color,
                                            borderBottomWidth:2,
                                            borderColor:Theme[themeTypeContext].border_color,
                                        }}
                                    >
                                        <Text selectable={false}
                                            numberOfLines={1}
                                            style={{
                                                color:Theme[themeTypeContext].text_color,
                                                fontSize:((Dimensions.width+Dimensions.height)/2)*0.045,
                                                fontFamily:"roboto-bold",
                                            }}
                                        >
                                            {chapterInfo.title}
                                        </Text>
                                    </View>
                                    <View
                                        style={{
                                            flex:1,
                                            backgroundColor:Theme[themeTypeContext].background_color,
                                        }}
                                    >   
                                        <Disqus title={chapterInfo.title} identifier={`${SOURCE}-${COMIC_ID}-${CHAPTER_IDX.current}`} url={`${apiBaseContext}/read/${SOURCE}/${COMIC_ID}/`}
                                            paddingVertical={16} paddingHorizontal={25}
                                        />
                                    </View>
                                </>}</>
                                <Menu showOptions={showOptions} setShowOptions={setShowOptions}/>
                            </View>
                        }
                    </AnimatePresence>
                    
                </>
                

                :<View style={{zIndex:5,width:"100%",height:"100%",display:"flex",justifyContent:"center",alignItems:"center",backgroundColor:Theme[themeTypeContext].background_color}}>
                    <Image setShowCloudflareTurnstile={setShowCloudflareTurnstileContext} source={require("@/assets/gif/cat-loading.gif")} style={{width:((Dimensions.width+Dimensions.height)/2)*0.15,height:((Dimensions.width+Dimensions.height)/2)*0.15}}/>
                </View>
            }</>
        }
    </>)
    

}

export default Index;

