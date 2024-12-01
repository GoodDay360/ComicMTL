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

const ComicComponent = ({item, SELECTED_BOOKMARK, SET_SELECTED_BOOKMARK}:any) => {
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
        <TouchableRipple 
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
    </>}</>)
    

}

export default ComicComponent;

