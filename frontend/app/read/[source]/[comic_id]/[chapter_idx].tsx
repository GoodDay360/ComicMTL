import React, { useEffect, useState, useCallback, useContext, useRef, useMemo } from 'react';
import { Link, router, useLocalSearchParams, useNavigation, useFocusEffect } from 'expo-router';
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
import JSZip from 'jszip';
import { Marquee } from '@animatereactnative/marquee';
import { Slider } from '@rneui/themed';

import ChapterStorage from '@/constants/module/chapter_storage';
import Image from '@/components/Image';
import {CONTEXT} from '@/constants/module/context';
import {blobToBase64, base64ToBlob, getImageLayout} from "@/constants/module/file_manager";
import Theme from '@/constants/theme';
import ChapterImage from '../../components/chapter_image';
import Menu from '../../components/menu/menu';
import Disqus from '../../components/disqus';

const Index = ({}:any) => {
    const SOURCE = useLocalSearchParams().source;
    const COMIC_ID = useLocalSearchParams().comic_id;
    const CHAPTER_IDX = Number(useLocalSearchParams().chapter_idx as string);
    const Dimensions = useWindowDimensions();
    const StaticDimensions = useMemo(() => Dimensions, [])
    

    const {showMenuContext, setShowMenuContext}:any = useContext(CONTEXT)
    const {themeTypeContext, setThemeTypeContext}:any = useContext(CONTEXT)
    const {showCloudflareTurnstileContext, setShowCloudflareTurnstileContext}:any = useContext(CONTEXT)
    const {apiBaseContext, setApiBaseContext}:any = useContext(CONTEXT)

    const [chapterInfo, setChapterInfo]:any = useState({})
    const [showOptions, setShowOptions]:any = useState({type:"general",state:false})
    const [imagesID, setImagesID]:any = useState([])
    const [zoom, setZoom]:any = useState(0)

    const images:any = useRef({})
    useEffect(()=>{
        setShowMenuContext(false)
    },[])

    useEffect(()=>{(async () => {
        return
        console.log(SOURCE,COMIC_ID,CHAPTER_IDX)
        const stored_chapter = await ChapterStorage.getByIdx(`${SOURCE}-${COMIC_ID}`,CHAPTER_IDX)   
        console.log(stored_chapter)
        if (stored_chapter?.data_state === "completed"){
            setChapterInfo({
                chapter_id: stored_chapter?.id,
                chapter_idx: stored_chapter?.id,
                title: stored_chapter?.title,
            })
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

    useEffect(()=>{
        if (!imagesID.length){
            images.current = {}
        }
    },[imagesID])

    useFocusEffect(useCallback(() => {
        return () => {
            setImagesID([])
            
        }
    },[]))

    const renderItem = useCallback(({ item, index }:any) => {
        return (
            <ChapterImage key={index} image_data={images.current[item].data} layout={images.current[item].layout} zoom={zoom}/>
        )
    }, [zoom])

    return (<>{!imagesID.length 
        ? <>
            <View
                
                style={{
                    width:"100%",
                    height:"100%",
                    backgroundColor:Theme[themeTypeContext].background_color,
                    zIndex:0
                }}
            >   
                <FlashList 
                    data={imagesID}
                    renderItem={({item,index}:any) => <ChapterImage key={index} image_data={images.current[item].data} layout={images.current[item].layout} zoom={zoom} showOptions={showOptions} setShowOptions={setShowOptions}/>}
                    estimatedItemSize={StaticDimensions.height}
                    extraData={{zoom:zoom,showOptions:showOptions,setShowOptions:setShowOptions}}
                />
                
            </View>
            <AnimatePresence exitBeforeEnter>
                {!showOptions.state && 
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
                                                    router.replace(`/view/${SOURCE}/${COMIC_ID}/`)
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
                                                        fontSize:((Dimensions.width+Dimensions.height)/2)*0.05,
                                                        fontFamily:"roboto-bold",
                                                    }}
                                                >
                                                    {chapterInfo.title}
                                                </Text>
                                            </View>
                                            <TouchableRipple
                                                rippleColor={Theme[themeTypeContext].ripple_color_outlined}
                                                style={{
                                                    borderRadius:5,
                                                    borderWidth:0,
                                                    backgroundColor: "transparent",
                                                    padding:5,
                                                }}
                                                
                                                onPress={()=>{
                                                    console.log("HO2h2")
                                                }}
                                            >
                                                <Icon source={"cloud-refresh"} size={((Dimensions.width+Dimensions.height)/2)*0.05} color={Theme[themeTypeContext].icon_color}/>
                                            </TouchableRipple>
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
                                            <View style={{width:"auto",height:"auto",display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
                                                <View style={{
                                                    pointerEvents:"auto",
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
                                                        onValueChange={setZoom}
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
                                                    
                                                    onPress={()=>{
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
                        <>{showOptions.type === "comments"&&
                            <View
                                style={{
                                    flex:1,
                                    backgroundColor:"transparent",
                                }}
                        >
                            <Disqus title="TEST" identifier={`${SOURCE}-${COMIC_ID}`} url={`${apiBaseContext}/read/${SOURCE}/${COMIC_ID}/`}
                                padding={25}
                            />
                        </View>
                        }</>
                        <Menu showOptions={showOptions} setShowOptions={setShowOptions}/>
                    </View>
                }
            </AnimatePresence>
            
        </>
        

        :<View style={{zIndex:5,width:"100%",height:"100%",display:"flex",justifyContent:"center",alignItems:"center",backgroundColor:Theme[themeTypeContext].background_color}}>
            <Image setShowCloudflareTurnstile={setShowCloudflareTurnstileContext} source={require("@/assets/gif/cat-loading.gif")} style={{width:((Dimensions.width+Dimensions.height)/2)*0.15,height:((Dimensions.width+Dimensions.height)/2)*0.15}}/>
        </View>
    }</>)
    

}

export default Index;

