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

import { __styles } from '../stylesheet/styles';
import Storage from '@/constants/module/storages/storage';
import ChapterStorage from '@/constants/module/storages/chapter_storage';
import CoverStorage from '@/constants/module/storages/cover_storage';

import Image from '@/components/Image';
import {CONTEXT} from '@/constants/module/context';
import {blobToBase64, base64ToBlob, getImageLayout} from "@/constants/module/file_manager";
import Theme from '@/constants/theme';
import ComicStorage from '@/constants/module/storages/comic_storage';

const ComicComponent = ({index, item, SELECTED_BOOKMARK, SET_SELECTED_BOOKMARK}:any) => {
    const Dimensions = useWindowDimensions();
    const controller = new AbortController();
    const signal = controller.signal;

    const {showMenuContext, setShowMenuContext}:any = useContext(CONTEXT)
    const {themeTypeContext, setThemeTypeContext}:any = useContext(CONTEXT)
    const {apiBaseContext, setApiBaseContext}:any = useContext(CONTEXT)
    const {widgetContext, setWidgetContext}:any = useContext(CONTEXT)
    const {showCloudflareTurnstileContext, setShowCloudflareTurnstileContext}:any = useContext(CONTEXT)

    const [styles, setStyles]:any = useState(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    
    const cover:any = useRef("")

    useFocusEffect(useCallback(() => {
        (async ()=>{
            setIsLoading(true)
            setStyles(__styles(themeTypeContext,Dimensions))
            const stored_bookmark = await Storage.get("bookmark") || []
            console.log(stored_bookmark)
            cover.current  = await CoverStorage.get(`${item.source}-${item.id}`) || ""
            setIsLoading(false)
        })()

        return () => {
            cover.current = ""
            controller.abort();
        };
    },[]))

    return (<>{styles && !isLoading && <>
        <>{index === 0
            ? <View
                style={{
                    width:"100%",
                    height:"auto",
                    paddingHorizontal:0,
                    paddingVertical:18,
                    borderBottomWidth:2,
                    borderColor:Theme[themeTypeContext].border_color,
                    display:"flex",
                    flexDirection:Dimensions.width >= 700 ? "row" : "column",
                    justifyContent:"space-around",
                    alignItems:"center",
                    gap:12,
                }}
            >
                
                <TouchableRipple 
                    rippleColor={Theme[themeTypeContext].ripple_color_outlined}
                    onPress={()=>{router.navigate(`/view/${item.source}/${item.id}/?mode=local`)}}
                    style={{...styles.item_box, marginHorizontal:12,}}
                >
                    <>
                        <Image onError={(error:any)=>{console.log("load image error",error)}} source={cover.current} 
                                style={styles.item_cover}
                                contentFit="cover" transition={1000}
                                onLoadEnd={()=>{cover.current = ""}}
                            />
                    </>
                </TouchableRipple>
                <View
                    style={{
                        flex:1,
                        width:"auto",
                        height:Dimensions.width >= 700 ? "100%" : "auto",
                        paddingVertical:12,
                        alignItems:"center",
                        justifyContent:"space-around",
                        gap:12,
                    }}
                >
                    <Text style={{
                        color:Theme[themeTypeContext].text_color,
                        fontSize:((Dimensions.width+Dimensions.height)/2)*0.035,
                        fontFamily:"roboto-bold",
                        textAlign:"center",
                        width:"100%",
                    }}>{item.info.title}</Text>

                    <TouchableRipple
                        rippleColor={Theme[themeTypeContext].ripple_color_outlined}
                        style={{
                            width:Dimensions.width*0.40,
                            display:"flex",
                            flexDirection:"column",
                            justifyContent:"center",
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
                            router.replace(`/read/${item.source}/${item.id}/${item.history.idx}/`)
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
                                    fontSize:((Dimensions.width+Dimensions.height)/2)*0.0225,
                                    fontFamily:"roboto-bold",
                                }}
                            >
                                Continue
                            </Text>
                            <Text selectable={false}
                                numberOfLines={1}
                                style={{
                                    color:Theme[themeTypeContext].text_color,
                                    fontSize:((Dimensions.width+Dimensions.height)/2)*0.02,
                                    fontFamily:"roboto-bold",
                                }}
                            >
                                {item.history.title}
                            </Text>
                        </View>
                    </TouchableRipple>



                </View>

            </View>

            : <TouchableRipple 
                rippleColor={Theme[themeTypeContext].ripple_color_outlined}
                onPress={()=>{router.navigate(`/view/${item.source}/${item.id}/?mode=local`)}}
                style={styles.item_box}
            >
                <>
                    <Image onError={(error:any)=>{console.log("load image error",error)}} source={cover.current} 
                            style={styles.item_cover}
                            contentFit="cover" transition={1000}
                            onLoadEnd={()=>{cover.current = ""}}
                        />
                    
                    <Text style={styles.item_title}>{item.info.title}</Text>
                </>
            </TouchableRipple>
            }</>
    </>}</>)
    

}

export default ComicComponent;

