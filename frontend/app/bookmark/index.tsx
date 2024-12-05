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

import BookmarkComponent from './components/bookmark_component';
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
    const [search, setSearch] = useState<any>({state:false,text:""})

    const [BOOKMARK_DATA, SET_BOOKMARK_DATA]:any = useState([])
    const [SELECTED_BOOKMARK, SET_SELECTED_BOOKMARK] = useState<string>("")

    const [COMIC_DATA, SET_COMIC_DATA] = useState<any>([])

    useEffect(() => {
        (async ()=>{
            if (!SELECTED_BOOKMARK) return
            const stored_comic = await ComicStorage.getByTag(SELECTED_BOOKMARK)
            console.log(stored_comic)
            SET_COMIC_DATA(stored_comic)
        })()
    },[SELECTED_BOOKMARK,onRefresh])

    useFocusEffect(useCallback(() => {
        (async ()=>{
            setIsLoading(true)
            const stored_bookmark = await Storage.get("bookmark") || []
            console.log(stored_bookmark)
            
            SET_BOOKMARK_DATA(stored_bookmark)
            console.log("AA",stored_bookmark.length )
            if (stored_bookmark.length) {
                SET_SELECTED_BOOKMARK(stored_bookmark[0])
            }
            setIsLoading(false)
        })()
    },[onRefresh]))

    const renderBookmarkComponent = useCallback(({item,index}:any) => {
        return <BookmarkComponent key={index.toString()} item={item} 
                SELECTED_BOOKMARK={SELECTED_BOOKMARK} SET_SELECTED_BOOKMARK={SET_SELECTED_BOOKMARK}
            />
    },[SELECTED_BOOKMARK])

    const renderComicComponent = useCallback(({item,index}:any) => {
        return <ComicComponent key={index.toString()} item={item} 
                
            />
    },[SELECTED_BOOKMARK])

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
                    <Text style={styles.header_text}>Bookmark</Text>

                    <View style={styles.header_button_box}>

                        <TouchableRipple
                            rippleColor={Theme[themeTypeContext].ripple_color_outlined}
                            style={{
                                ...styles.header_search_button,
                                backgroundColor: search.state ? Theme[themeTypeContext].button_selected_color : "transparent",   
                            }}
                            
                            onPress={() => {
                                setSearch({...search,state:!search.state})
                            }}
                        >
                            <Icon source={"magnify"} size={((Dimensions.width+Dimensions.height)/2)*0.04} color={Theme[themeTypeContext].icon_color}/>
                        </TouchableRipple>
                    </View>
                    

                </View>
                <>{search.state && (
                    <View
                        style={{
                            width:"100%",
                            height:"auto",
                            paddingHorizontal:12,
                            paddingVertical:18,
                            borderBottomWidth:2,
                            borderColor:Theme[themeTypeContext].border_color,
                        }}
                    >
                        <TextInput mode="outlined" label="Search" textColor={Theme[themeTypeContext].text_color} 
                            
                            style={{
                                
                                backgroundColor:Theme[themeTypeContext].background_color,
                                borderColor:Theme[themeTypeContext].border_color,
                                
                            }}
                            outlineColor={Theme[themeTypeContext].text_input_border_color}
                            value={search.text}
                            onChange={(event)=>{
                                setSearch({...search,text:event.nativeEvent.text})
                            }}
                        />

                    </View>
                )}</>
                <View
                    style={{
                        display:"flex",
                        flexDirection:"row",
                        width:"100%",
                        height:"auto",
                        backgroundColor:"transparent",
                        borderBottomWidth:2,
                        borderColor:Theme[themeTypeContext].border_color,
                    }}
                >            
                    <FlatList
                        contentContainerStyle={{
                            flex:1,
                            flexGrow: 1,
                        }}
                        horizontal={true}
                        data={BOOKMARK_DATA}
                        renderItem={renderBookmarkComponent}
                        ItemSeparatorComponent={undefined}
                    />
                    <TouchableRipple
                        rippleColor={Theme[themeTypeContext].ripple_color_outlined}
                        style={{
                            borderRadius:5,
                            borderWidth:0,
                            backgroundColor: "transparent",
                            padding:5,
                            justifyContent:"center",
                            alignItems:"center",
                        }}
                        onPress={() => {
                            setWidgetContext({state:true,component:
                                <BookmarkWidget
                                    setIsLoading={setIsLoading}
                                    onRefresh={()=>{setOnRefresh(!onRefresh)}}

                                />
                            })
                        }}
                    >
                        <Icon source={require("@/assets/icons/tag-edit-outline.png")} size={((Dimensions.width+Dimensions.height)/2)*0.0325} color={Theme[themeTypeContext].icon_color}/>
                    </TouchableRipple>
                </View>
                <FlatList
                    contentContainerStyle={{
                        flexGrow: 1,
                        padding:12,
                        flexDirection:"row",
                        gap:Math.max((Dimensions.width+Dimensions.height)/2*0.015,8),
                        flexWrap:"wrap",
                    }}
                    renderItem={renderComicComponent}
                    ItemSeparatorComponent={undefined}
                    data={COMIC_DATA.filter((item:any) => item.info.title.toLowerCase().includes(search.text.toLowerCase()))}
                    ListEmptyComponent={
                        <View
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
                            <>{BOOKMARK_DATA.length 
                                ? <>
                                    {search.text && COMIC_DATA.length
                                        ? <>
                                            <Icon source={"magnify-scan"} color={Theme[themeTypeContext].icon_color} size={((Dimensions.width+Dimensions.height)/2)*0.03}/>
                                            <Text selectable={false}
                                                style={{
                                                    fontFamily:"roboto-bold",
                                                    fontSize:((Dimensions.width+Dimensions.height)/2)*0.025,
                                                    color:Theme[themeTypeContext].text_color,
                                                }}
                                            >Search no result</Text>
                                        </>
                                        : <>
                                            <Icon source={require("@/assets/icons/tag-hidden.png")} color={Theme[themeTypeContext].icon_color} size={((Dimensions.width+Dimensions.height)/2)*0.03}/>
                                            <Text selectable={false}
                                                style={{
                                                    fontFamily:"roboto-bold",
                                                    fontSize:((Dimensions.width+Dimensions.height)/2)*0.025,
                                                    color:Theme[themeTypeContext].text_color,
                                                }}
                                            >This tag is empty.</Text>
                                        </>
                                    }
                                </>
                                : <View style={{
                                    display:"flex",
                                    flexDirection:"column", 
                                    justifyContent:"center",
                                    alignItems:"center",
                                    width:"100%",
                                    height:"auto",
                                }}>
                                    
                                    <Text selectable={false}
                                        style={{
                                            fontFamily:"roboto-bold",
                                            fontSize:((Dimensions.width+Dimensions.height)/2)*0.025,
                                            color:Theme[themeTypeContext].text_color,
                                            textAlign:"center",
                                        }}
                                    >
                                        No tag found. {"\n"}Press{"  "}
                                        <Icon source={require("@/assets/icons/tag-edit-outline.png")} color={Theme[themeTypeContext].icon_color} size={((Dimensions.width+Dimensions.height)/2)*0.03}/>  
                                        {"  "}to create bookmark tag.
                                    </Text>
                                </View>

                            }
                            </>
                            
                        </View>
                        
                    }
                />
            </View>

        </>
        : <View style={{zIndex:5,width:"100%",height:"100%",display:"flex",justifyContent:"center",alignItems:"center",backgroundColor:Theme[themeTypeContext].background_color}}>
            <Image setShowCloudflareTurnstile={setShowCloudflareTurnstileContext} source={require("@/assets/gif/cat-loading.gif")} style={{width:((Dimensions.width+Dimensions.height)/2)*0.15,height:((Dimensions.width+Dimensions.height)/2)*0.15}}/>
        </View>
    }</>)
    

}

export default Index;

