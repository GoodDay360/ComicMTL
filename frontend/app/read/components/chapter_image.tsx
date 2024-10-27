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
import Image from '@/components/Image';
import {CONTEXT} from '@/constants/module/context';
import {blobToBase64, base64ToBlob} from "@/constants/module/file_manager";
import Theme from '@/constants/theme';

const ChapterImage = ({item, zoom, showOptions,setShowOptions}:any)=>{
    const SOURCE = useLocalSearchParams().source;
    const COMIC_ID = useLocalSearchParams().comic_id;
    const CHAPTER_IDX = Number(useLocalSearchParams().chapter_idx as string);
    const Dimensions = useWindowDimensions();

    const {showMenuContext, setShowMenuContext}:any = useContext(CONTEXT)
    const {themeTypeContext, setThemeTypeContext}:any = useContext(CONTEXT)
    const {showCloudflareTurnstileContext, setShowCloudflareTurnstileContext}:any = useContext(CONTEXT)


    return (
        <Pressable
            onPress={()=>{setShowOptions({type:"general",state:!showOptions.state})}}
            style={{
                display:"flex",
                width:"100%",
                height:"auto",
                borderWidth:0,
                alignItems:"center",
            }}
        >
            {item.type === "image" && (

                <Image source={{type:"base64",data:item.image_data}} 
                    contentFit="contain"
                    style={{
                        width:Dimensions.width > 720 
                            ? 0.8 * Dimensions.width * (1 - zoom / 100)
                            : `${100 - zoom}%`,
                        aspectRatio: item.layout.width / item.layout.height,
                    }}
                    onLoadEnd={()=>{
                        // console.log("CLEANED")
                        // delete images.current[image_key]
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
                        No more available chapters on local.
                    </Text>
                    <Text selectable={false}
                        numberOfLines={1}
                        style={{
                            color:Theme[themeTypeContext].text_color,
                            fontSize:(0.03 * ((Dimensions.width+Dimensions.height)/2)) * (1 - zoom/100),
                            fontFamily:"roboto-bold",
                        }}
                    >
                        You can go back and download more.
                    </Text>
                </View>
            )}
    </Pressable>)
}

export default ChapterImage