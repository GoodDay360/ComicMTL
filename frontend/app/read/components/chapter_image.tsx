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

import ChapterStorage from '@/constants/module/storages/chapter_storage';
import ChapterDataStorage from '@/constants/module/storages/chapter_data_storage';
import Image from '@/components/Image';
import {CONTEXT} from '@/constants/module/context';
import {blobToBase64, base64ToBlob} from "@/constants/module/file_manager";
import Theme from '@/constants/theme';
import { get_chapter } from '../modules/get_chapter';

const ChapterImage = ({item, zoom, showOptions,setShowOptions, setIsLoading, SET_DATA}:any)=>{
    const SOURCE = useLocalSearchParams().source;
    const COMIC_ID = useLocalSearchParams().comic_id;
    const CHAPTER_IDX = Number(useLocalSearchParams().chapter_idx as string);
    const Dimensions = useWindowDimensions();

    const {showMenuContext, setShowMenuContext}:any = useContext(CONTEXT)
    const {themeTypeContext, setThemeTypeContext}:any = useContext(CONTEXT)
    const {showCloudflareTurnstileContext, setShowCloudflareTurnstileContext}:any = useContext(CONTEXT)

    const [isReady, setIsReady] = useState(false);
    const [isError, setIsError] = useState({state:false,text:""});

    const image = useRef<any>(null);
    const image_layout = useRef<any>(null);

    useEffect(()=>{(async () => {
        if (item.type === "page"){
            const store_chapter_image_data = await ChapterDataStorage.get(item.id)
            if (store_chapter_image_data){
                image.current = {type:"blob",data:store_chapter_image_data.data}
                image_layout.current = store_chapter_image_data.layout

                setIsReady(true)
            }else{
                setIsError({state:true,text:"Image not found!"})
            }
        }else setIsReady(true)
        
    })()},[])


    return ( <Pressable
                onPress={()=>{setShowOptions({type:"general",state:!showOptions.state})}}
                style={{
                    display:"flex",
                    width:"100%",
                    height:"auto",
                    borderWidth:0,
                    alignItems:"center",
                }}
            >
                <>{isReady
                    ? (<>
                        {item.type === "page" && (
                            <Image source={image.current} 
                                contentFit="contain"
                                style={{
                                    width:Dimensions.width > 720 
                                        ? 0.8 * Dimensions.width * (1 - zoom / 100)
                                        : `${100 - zoom}%`,
                                    aspectRatio: image_layout.current.width / image_layout.current.height,
                                }}
                                onLoadEnd={()=>{
                                }}
                            />
                        )}
                        {item.type === "chapter-info-banner" && (
                            <View
                                style={{
                                    display:"flex",
                                    flexDirection:"column",
                                    alignItems:"center",
                                    gap:12,
                                    width:Dimensions.width > 720 
                                        ? 0.8 * Dimensions.width * (1 - zoom / 100)
                                        : `${100 - zoom}%`,
                                    height:"auto",
                                    backgroundColor:"black",
                                    padding:16,
                                }}
                            >
                                <Text selectable={false}
                                    numberOfLines={1}
                                    style={{
                                        color:Theme[themeTypeContext].text_color,
                                        fontSize:(0.03 * ((Dimensions.width+Dimensions.height)/2)) * (1 - zoom/100),
                                        fontFamily:"roboto-bold",
                                    }}
                                >
                                    End: {item.value.last}
                                </Text>
        
                                <Text selectable={false}
                                    numberOfLines={1}
                                    style={{
                                        color:Theme[themeTypeContext].text_color,
                                        fontSize:(0.03 * ((Dimensions.width+Dimensions.height)/2)) * (1 - zoom/100),
                                        fontFamily:"roboto-bold",
                                    }}
                                >
                                    Next: {item.value.next}
                                </Text>
        
                            </View>
                        )}
                        {item.type === "no-chapter-banner" && (
                            <View
                                style={{
                                    display:"flex",
                                    flexDirection:"column",
                                    alignItems:"center",
                                    gap:12,
                                    width:Dimensions.width > 720 
                                        ? 0.8 * Dimensions.width * (1 - zoom / 100)
                                        : `${100 - zoom}%`,
                                    height:"auto",
                                    backgroundColor:"black",
                                    padding:16,
                                }}
                            >
                                <Text selectable={false}
                                    numberOfLines={1}
                                    style={{
                                        color:Theme[themeTypeContext].text_color,
                                        fontSize:(0.03 * ((Dimensions.width+Dimensions.height)/2)) * (1 - zoom/100),
                                        fontFamily:"roboto-bold",
                                    }}
                                >
                                    No more chapters on local.
                                </Text>
                                <Text selectable={false}
                                    numberOfLines={1}
                                    style={{
                                        color:Theme[themeTypeContext].text_color,
                                        fontSize:(0.03 * ((Dimensions.width+Dimensions.height)/2)) * (1 - zoom/100),
                                        fontFamily:"roboto-bold",
                                    }}
                                >
                                    You can go back and download more if available.
                                </Text>
                            </View>
                        )}

                        {item.type === "chapter-navigate" && (
                            
                            <View
                                style={{
                                    display:"flex",
                                    flexDirection:"row",
                                    justifyContent:"space-between",
                                    alignItems:"center",
                                    width:Dimensions.width > 720 
                                        ? 0.8 * Dimensions.width * (1 - zoom / 100)
                                        : `${100 - zoom}%`,
                                    paddingHorizontal: 12,
                                    paddingVertical: 18,
                                }}
                            >
                                <TouchableRipple
                                    rippleColor={Theme[themeTypeContext].ripple_color_outlined}
                                    style={{
                                        width:"auto",
                                        display:"flex",
                                        flexDirection:"column",
                                        justifyContent:"center",
                                        alignSelf:"center",
                                        padding:8,
                                        paddingHorizontal:18,
                                        borderRadius:Dimensions.width*0.65/2,
                                        backgroundColor:Theme[themeTypeContext].border_color,

                                        shadowColor: Theme[themeTypeContext].shadow_color,
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.25,
                                        shadowRadius: 3.84,
                                        elevation: 5,
                                        
                                    }}
                                    onPress={async ()=>{
                                        const stored_chapter_info = await ChapterStorage.getByIdx(`${SOURCE}-${COMIC_ID}`,item.chapter_idx-1)
                                        if (stored_chapter_info?.data_state === "completed"){
                                            router.replace(`/read/${SOURCE}/${COMIC_ID}/${stored_chapter_info.idx}/`)
                                        }else{
                                            Toast.show({
                                                type: 'info',
                                                text1: 'Chapter not download yet.',
                                                text2: "You can go back and download more.",
                                                
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
                                    <Text selectable={false}
                                        style={{
                                            color:Theme[themeTypeContext].text_color,
                                            fontFamily:"roboto-medium",
                                            fontSize:(Dimensions.width+Dimensions.height)/2*0.03
                                        }}
                                    >Previous</Text>
                                </TouchableRipple>

                                <TouchableRipple
                                    rippleColor={Theme[themeTypeContext].ripple_color_outlined}
                                    style={{
                                        width:"auto",
                                        display:"flex",
                                        flexDirection:"column",
                                        justifyContent:"center",
                                        alignSelf:"center",
                                        padding:8,
                                        paddingHorizontal:18,
                                        borderRadius:Dimensions.width*0.65/2,
                                        backgroundColor:Theme[themeTypeContext].border_color,

                                        shadowColor: Theme[themeTypeContext].shadow_color,
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.25,
                                        shadowRadius: 3.84,
                                        elevation: 5,
                                    }}
                                    onPress={async ()=>{
                                        const stored_chapter_info = await ChapterStorage.getByIdx(`${SOURCE}-${COMIC_ID}`,item.chapter_idx+1)
                                        if (stored_chapter_info?.data_state === "completed"){
                                            router.replace(`/read/${SOURCE}/${COMIC_ID}/${stored_chapter_info.idx}/`)
                                        }else{
                                            Toast.show({
                                                type: 'info',
                                                text1: 'Chapter not download yet.',
                                                text2: "You can go back and download more.",
                                                
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
                                    <Text selectable={false}
                                        style={{
                                            color:Theme[themeTypeContext].text_color,
                                            fontFamily:"roboto-medium",
                                            fontSize:(Dimensions.width+Dimensions.height)/2*0.03
                                        }}
                                    >Next</Text>
                                </TouchableRipple>
                            </View>
                            
                        )}
                    </>)
                    : (
                        <View
                            style={{
                                display:"flex",
                                justifyContent:"center",
                                alignItems:"center",
                                backgroundColor:Theme[themeTypeContext].background_color,
                                width:Dimensions.width > 720 
                                    ? 0.8 * Dimensions.width * (1 - zoom / 100)
                                    : `${100 - zoom}%`,
                                height: Dimensions.height * 0.75
                            }}
                        >
                            {isError.state 
                                ? (
                                    <View 
                                        style={{
                                            display:'flex',
                                            flexDirection:"column",
                                            justifyContent:"center",
                                            alignItems:"center",
                                            width:"100%",
                                            height:"100%",
                                            gap:12,
                                        }}
                                    >
                                        
                                        <Icon source={"alert-circle"} size={25} color={"red"}/>
                                        <Text style={{color:"white",fontSize:12,fontFamily:"roboto-bold"}}>{isError.text}</Text>
                                    </View>
                                )
                                : (<ActivityIndicator animating={true}/>)
                            }
                            
                
                        </View>
                    )
                }</>
                
        </Pressable>
    )
}

export default ChapterImage