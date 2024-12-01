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


import ComicComponent from './components/comic_component';
import BookmarkWidget from './components/widgets/bookmark';

import { __styles } from './stylesheet/styles';
import Storage from '@/constants/module/storages/storage';
import ChapterStorage from '@/constants/module/storages/chapter_storage';
import Image from '@/components/Image';
import {CONTEXT} from '@/constants/module/context';
import {blobToBase64, base64ToBlob, getImageLayout} from "@/constants/module/file_manager";
import Theme from '@/constants/theme';
import ComicStorage from '@/constants/module/storages/comic_storage';

const Index = ({}:any) => {
    const Dimensions = useWindowDimensions();
    const controller = new AbortController();
    const signal = controller.signal;

    const {showMenuContext, setShowMenuContext}:any = useContext(CONTEXT)
    const {themeTypeContext, setThemeTypeContext}:any = useContext(CONTEXT)
    const {apiBaseContext, setApiBaseContext}:any = useContext(CONTEXT)
    const {widgetContext, setWidgetContext}:any = useContext(CONTEXT)
    const {showCloudflareTurnstileContext, setShowCloudflareTurnstileContext}:any = useContext(CONTEXT)
    
    const [styles, setStyles]:any = useState("")
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [onRefresh, setOnRefresh] = useState(false)

    
    const [COMIC_DATA, SET_COMIC_DATA] = useState<any>([])


    useFocusEffect(useCallback(() => {
        (async ()=>{
            setIsLoading(true)
            const stored_recent = await Storage.get("RECENT") || []
            stored_recent.sort((a:any,b:any) => b.timestamp - a.timestamp)
            const stored_comic = []
            for (const item of stored_recent) {
                const comic = await ComicStorage.getByID(item.source,item.comic_id)
                if (comic) stored_comic.push(comic)
            }
            SET_COMIC_DATA(stored_comic)
            setIsLoading(false)
        })()
    },[onRefresh]))



    const RenderComicComponent = useCallback(({item,index}:any) => {
        console.log(item,index)
        return <ComicComponent index={index} item={item} 
            />
    },[])

    useFocusEffect(useCallback(() => {
        setIsLoading(true)
        setShowMenuContext(true)
        setStyles(__styles(themeTypeContext,Dimensions))

        return () => {
            controller.abort();
        };
    },[]))

    return (<>{styles && ! isLoading
        ? <>
            <View style={styles.screen_container}
                
            >
                <View style={styles.header_container}>
                    <Text style={styles.header_text}>Recent</Text>
                </View>
                <ScrollView
                    contentContainerStyle={{
                        width:"100%",
                        height:COMIC_DATA.length ? "auto" : "100%",
                        maxHeight:"auto",
                        display:"flex",
                        paddingHorizontal:12,
                        paddingVertical:18,
                        flexDirection:"row",
                        justifyContent:"flex-start",
                        gap:Math.max((Dimensions.width+Dimensions.height)/2*0.015,8),
                        flexWrap:"wrap",
                    }}
                    
                >
                    <>{COMIC_DATA.length
                        ? <>{COMIC_DATA.map((item:any,index:number) => (
                                <RenderComicComponent key={index} item={item} index={index} />
                            ))
                        }</>
                        : <View
                            style={{
                                width:"100%",
                                height:"100%",
                                backgroundColor:"transparent",
                                display:"flex",
                                justifyContent:"center",
                                alignItems:"center",
                                flexDirection:"row",
                                gap:12,
                            }}
                        >   
                            <>
                                <Icon source={"dots-hexagon"} color={Theme[themeTypeContext].icon_color} size={((Dimensions.width+Dimensions.height)/2)*0.03}/>
                                <Text selectable={false}
                                    style={{
                                        fontFamily:"roboto-bold",
                                        fontSize:((Dimensions.width+Dimensions.height)/2)*0.025,
                                        color:Theme[themeTypeContext].text_color,
                                    }}
                                >There no recent read.</Text>
                            </>
                        </View>
                    }</>

                </ScrollView>
            </View>

        </>
        : <View style={{zIndex:5,width:"100%",height:"100%",display:"flex",justifyContent:"center",alignItems:"center",backgroundColor:Theme[themeTypeContext].background_color}}>
            <Image setShowCloudflareTurnstile={setShowCloudflareTurnstileContext} source={require("@/assets/gif/cat-loading.gif")} style={{width:((Dimensions.width+Dimensions.height)/2)*0.15,height:((Dimensions.width+Dimensions.height)/2)*0.15}}/>
        </View>
    }</>)
    

}

export default Index;

