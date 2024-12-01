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
import Image from '@/components/Image';
import {CONTEXT} from '@/constants/module/context';
import {blobToBase64, base64ToBlob, getImageLayout} from "@/constants/module/file_manager";
import Theme from '@/constants/theme';
import ComicStorage from '@/constants/module/storages/comic_storage';

const BookmarkComponent = ({item, SELECTED_BOOKMARK, SET_SELECTED_BOOKMARK}:any) => {
    const Dimensions = useWindowDimensions();
    const controller = new AbortController();
    const signal = controller.signal;

    const {showMenuContext, setShowMenuContext}:any = useContext(CONTEXT)
    const {themeTypeContext, setThemeTypeContext}:any = useContext(CONTEXT)
    const {apiBaseContext, setApiBaseContext}:any = useContext(CONTEXT)
    const {widgetContext, setWidgetContext}:any = useContext(CONTEXT)
    const {showCloudflareTurnstileContext, setShowCloudflareTurnstileContext}:any = useContext(CONTEXT)
    

    useFocusEffect(useCallback(() => {


        return () => {
            controller.abort();
        };
    },[]))

    return (<>
        <TouchableRipple
            rippleColor={Theme[themeTypeContext].ripple_color_outlined}
            style={{
                width:"auto",
                height:"auto",
                backgroundColor: SELECTED_BOOKMARK === item ? Theme[themeTypeContext].border_color : "transparent",
                borderBottomWidth: SELECTED_BOOKMARK === item ? 3.5 : 0,
                borderColor:Theme[themeTypeContext].button_color,
                paddingHorizontal:18,
                paddingVertical:14,
                borderRadius:2,
            }}
            onPress={()=>{SET_SELECTED_BOOKMARK(item)}}
        >
            <View
                style={{
                    width:"auto",
                    height:"auto",
                }}
            >
                <Text selectable={false}
                    style={{
                        color:Theme[themeTypeContext].text_color,
                        fontFamily:"roboto-bold",
                        fontSize:((Dimensions.width+Dimensions.height)/2)*0.0185,
                    }}
                >
                    {item}
                </Text>
            </View>
        </TouchableRipple>
    </>)
    

}

export default BookmarkComponent;

