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

import ChapterStorage from '@/constants/module/chapter_storage';
import Image from '@/components/Image';
import {CONTEXT} from '@/constants/module/context';
import {blobToBase64, base64ToBlob} from "@/constants/module/file_manager";
import Theme from '@/constants/theme';

const ChapterImage = ({image_data, layout}:any)=>{
    const SOURCE = useLocalSearchParams().source;
    const COMIC_ID = useLocalSearchParams().comic_id;
    const CHAPTER_IDX = Number(useLocalSearchParams().chapter_idx as string);
    const Dimensions = useWindowDimensions();

    const {showMenuContext, setShowMenuContext}:any = useContext(CONTEXT)
    const {themeTypeContext, setThemeTypeContext}:any = useContext(CONTEXT)
    const {showCloudflareTurnstileContext, setShowCloudflareTurnstileContext}:any = useContext(CONTEXT)



    

    return <>{Object.keys(layout).length 
        ? <View
            style={{
                width:"100%",
                height:"auto",
                display:"flex",
                alignItems:"center",
                padding:0,
                margin:0,
                borderWidth:0,
            }}
        >
            <Image source={{type:"base64",data:image_data}} 
                contentFit="contain"
                style={{
                    width:Dimensions.width > 720 ? Dimensions.width * 0.8 : "100%",
                    aspectRatio: layout.width / layout.height,
                }}
                onLoadEnd={()=>{
                    // console.log("CLEANED")
                    // delete images.current[image_key]
                }}
            />
        </View>
        : <View
            style={{
                width:"100%",
                height:"auto",
                display:"flex",
                alignItems:"center",
                justifyContent:"center",
                backgroundColor:Theme[themeTypeContext].background_color,
            }}
        >
            <ActivityIndicator animating={true}/>
        </View>
    }</>
}

export default ChapterImage