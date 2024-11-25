
import React, { useEffect, useState, useCallback, useContext, useRef, Fragment } from 'react';
import { Platform, useWindowDimensions, ScrollView } from 'react-native';

import { Icon, MD3Colors, Button, Text, TextInput, TouchableRipple, ActivityIndicator, Menu, Divider, PaperProvider, Portal } from 'react-native-paper';
import { View, AnimatePresence } from 'moti';
import Toast from 'react-native-toast-message';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';


import Theme from '@/constants/theme';
import Dropdown from '@/components/dropdown';
import { CONTEXT } from '@/constants/module/context';
import { store_comic_cover } from '../../modules/content';
import Storage from '@/constants/module/storages/storage';
import ComicStorage from '@/constants/module/storages/comic_storage';
import ImageCacheStorage from '@/constants/module/storages/image_cache_storage';
import ChapterStorage from '@/constants/module/storages/chapter_storage';


interface RequestChapterWidgetProps {
    SOURCE: string | string[];
    ID: string | string[];
    CHAPTER: any;
    chapter_requested: any;
    get_requested_info: any;
}

const RequestChapterWidget: React.FC<RequestChapterWidgetProps> = ({
    SOURCE,
    ID,
    CHAPTER,
    chapter_requested,
    get_requested_info
}) => {
    const Dimensions = useWindowDimensions();

    const {themeTypeContext, setThemeTypeContext}:any = useContext(CONTEXT)
    const {widgetContext, setWidgetContext}:any = useContext(CONTEXT)
    const {showCloudflareTurnstileContext, setShowCloudflareTurnstileContext}:any = useContext(CONTEXT)



    const [colorize, setColorize] = useState(false)
    const [translate, setTranslate] = useState({state:true,target:"ENG"})
    const [isRequesting, setIsRequesting] = useState(false)

    
    return (<View key={"RequestChapterWidget"}
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
        }}
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
        <View 
            style={{
                height:"auto",
                display:"flex",
                flexDirection:"column",
                gap:12,
            }}
        >
            <Dropdown disable={isRequesting}
                theme_type={themeTypeContext}
                Dimensions={Dimensions}

                label='Colorize' 
                data={[
                    { 
                        label: "Enable", 
                        value: true 
                    },
                    { 
                        label: "Disable", 
                        value: false
                    },
                ]}
                value={colorize}
                onChange={(item:any) => {
                    setColorize(item.value)
                }}
            />
            <Dropdown disable={isRequesting}
                theme_type={themeTypeContext}
                Dimensions={Dimensions}

                label='Translation' 
                data={[
                    { 
                        label: "Enable", 
                        value: true
                    },
                    { 
                        label: "Disable", 
                        value: false 
                    },
                ]}
                value={translate.state}
                onChange={async (item:any) => {
                    setTranslate({...translate,state:item.value})
                    
                }}
            />
            <>{translate.state &&
                <>
                    <Dropdown disable={isRequesting}
                        theme_type={themeTypeContext}
                        Dimensions={Dimensions}

                        label='Target Language' 
                        data={[
                            { label: "Chinese (Simplified)", value: "CHS" },
                            { label: "Chinese (Traditional)", value: "CHT" },
                            { label: "Czech", value: "CSY" },
                            { label: "Dutch", value: "NLD" },
                            { label: "English", value: "ENG" },
                            { label: "French", value: "FRA" },
                            { label: "German", value: "DEU" },
                            { label: "Hungarian", value: "HUN" },
                            { label: "Italian", value: "ITA" },
                            { label: "Japanese", value: "JPN" },
                            { label: "Korean", value: "KOR" },
                            { label: "Polish", value: "PLK" },
                            { label: "Portuguese (Brazil)", value: "PTB" },
                            { label: "Romanian", value: "ROM" },
                            { label: "Russian", value: "RUS" },
                            { label: "Spanish", value: "ESP" },
                            { label: "Turkish", value: "TRK" },
                            { label: "Ukrainian", value: "UKR" },
                            { label: "Vietnamese", value: "VIN" },
                            { label: "Arabic", value: "ARA" },
                            { label: "Serbian", value: "SRP" },
                            { label: "Croatian", value: "HRV" },
                            { label: "Thai", value: "THA" },
                            { label: "Indonesian", value: "IND" },
                            { label: "Filipino (Tagalog)", value: "FIL" }
                        ]}
                        value={translate.target}
                        onChange={async (item:any) => {
                            setTranslate({...translate,target:item.value})
                            
                        }}
                    />
                </>
                
            }</>
        </View>
        
        <View 
            style={{
                display:"flex",
                flexDirection:"row",
                width:"100%",
                justifyContent:"space-around",
                alignItems:"center",
            }}
        >
            {isRequesting 
                ? <ActivityIndicator animating={true}/>
                
                : <>
                    <Button mode='contained' 
                        labelStyle={{
                            color:Theme[themeTypeContext].text_color,
                            fontFamily:"roboto-medium",
                            fontSize:(Dimensions.width+Dimensions.height)/2*0.02
                        }} 
                        style={{backgroundColor:"red",borderRadius:5}} 
                        onPress={(()=>{
                            
                            setWidgetContext({state:false,component:<></>})
                            
                        })}
                    >Cancel</Button>
                    <Button mode='contained' 
                    labelStyle={{
                        color:Theme[themeTypeContext].text_color,
                        fontFamily:"roboto-medium",
                        fontSize:(Dimensions.width+Dimensions.height)/2*0.02
                    }} 
                    style={{backgroundColor:"green",borderRadius:5}} 
                    onPress={(async ()=>{
                        setIsRequesting(true)
                        chapter_requested.current[CHAPTER.id] = {state: "queue"}
                        
                        const API_BASE = await Storage.get("IN_USE_API_BASE")
                        const stored_socket_info = await Storage.get("SOCKET_INFO")
                        axios({
                            method: 'post',
                            url: `${API_BASE}/api/queue/request_chapter/`,
                            headers: {
                                'X-CLOUDFLARE-TURNSTILE-TOKEN': await Storage.get("cloudflare-turnstile-token")
                            },
                            data: {
                                source: SOURCE,
                                comic_id: ID,
                                chapter_id:CHAPTER.id,
                                chapter_idx:CHAPTER.idx,
                                socket_id: stored_socket_info.id,
                                channel_name: stored_socket_info.channel_name,
                                options: {
                                    colorize: colorize,
                                    translate: translate,
                                }

                            },
                            timeout: 10000,
                            
                        }).then(async () => {
                            const stored_comic = await ComicStorage.getByID(SOURCE, ID);
                            const stored_chapter_queue = stored_comic.chapter_requested.filter((ch:any) => ch.chapter_id !== CHAPTER.id);

                            stored_chapter_queue.push({
                                chapter_id: CHAPTER.id,
                                chapter_idx: CHAPTER.idx,
                                options: { colorize, translate }
                            });
                            await ComicStorage.updateChapterQueue(SOURCE, ID, stored_chapter_queue);


                            await get_requested_info()
                            Toast.show({
                                type: 'info',
                                text1: '🕓 Your request has been placed in the queue.',
                                text2: 'Check back later to download your chapter.\nAfter it ready, chapter will be removed from the cloud when server out of storage.',
                                
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
                            setWidgetContext({state:false,component:<></>})
                            setIsRequesting(false)
                        }).catch((error) => {
                            console.log(error)
                            var error_text_1
                            var error_text_2
                            if (error.status === 511) {
                                setShowCloudflareTurnstileContext(true)
                                error_text_1 = "❗Your session token is expired."
                                error_text_2 = "You can request again after we renewing new session automaticly"
                            }else{
                                error_text_1 = "❗❓Sometime went wrong while requesting."
                                error_text_2 = "Try refresh to see if it solve the issue.\nIf the error still show, you can report this issue to the Github repo."
                            }
                            Toast.show({
                                type: 'error',
                                text1: error_text_1,
                                text2: error_text_2,
                                
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
                            setIsRequesting(false)
                        })
                        
                    })}
                    >Request</Button>
                </>
            }
        </View>
    </View>) 
}

export default RequestChapterWidget;