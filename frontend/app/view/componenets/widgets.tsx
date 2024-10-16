import React, { useEffect, useState, useCallback, useContext, useRef } from 'react';
import { Platform, useWindowDimensions } from 'react-native';

import { Icon, MD3Colors, Button, Text, TextInput, TouchableRipple, ActivityIndicator } from 'react-native-paper';
import { View, AnimatePresence } from 'moti';
import Toast from 'react-native-toast-message';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';


import Theme from '@/constants/theme';
import Dropdown from '@/components/dropdown';
import { CONTEXT } from '@/constants/module/context';
import { store_comic_cover } from '../modules/content';
import Storage from '@/constants/module/storage';
import ComicStorage from '@/constants/module/comic_storage';
import ImageCacheStorage from '@/constants/module/image_cache_storage';
import ChapterStorage from '@/constants/module/chapter_storage';


export const PageNavigationWidget = ({MAX_OFFSET,setPage,CONTENT}:any) =>{
    const Dimensions = useWindowDimensions();

    const {themeTypeContext, setThemeTypeContext}:any = useContext(CONTEXT)
    const {widgetContext, setWidgetContext}:any = useContext(CONTEXT)

    const [goToPage, setGoToPage] = useState("");
    const [_feedBack, _setFeedBack] = useState("");
    return (<View 
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
        <View style={{height:"auto"}}>
            <TextInput mode="outlined" label="Go to page"  textColor={Theme[themeTypeContext].text_color} maxLength={1000000000}
                placeholder="Go to page"
                right={<TextInput.Affix text={`/${Math.ceil(CONTENT.chapters.length/MAX_OFFSET)}`} />}
                style={{
                    
                    backgroundColor:Theme[themeTypeContext].background_color,
                    borderColor:Theme[themeTypeContext].border_color,
                    
                }}
                outlineColor={Theme[themeTypeContext].text_input_border_color}
                value={goToPage}
                onChange={(event)=>{
                    
                    const value = event.nativeEvent.text
                    
                    const isInt = /^-?\d+$/.test(value);
                    if (isInt || value === "") {
                        if (parseInt(value) > Math.ceil(CONTENT.chapters.length/MAX_OFFSET)){
                            _setFeedBack("Page is out of index.")
                        }else{
                            _setFeedBack("")
                            setGoToPage(value)
                        }
                        
                    }
                    else _setFeedBack("Input is not a valid number.")
                    
                }}
            />
            
        </View>
        {_feedBack 
            ? <Text 
                style={{
                    color:Theme[themeTypeContext].text_color,
                    fontFamily:"roboto-medium",
                    fontSize:(Dimensions.width+Dimensions.height)/2*0.02,
                    textAlign:"center",
                }}
                
            >{_feedBack}</Text>
            : <></>
        }
        <View 
            style={{
                display:"flex",
                flexDirection:"row",
                width:"100%",
                justifyContent:"space-around",
                alignItems:"center",
            }}
        >
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
            onPress={(()=>{
                const isInt = /^-?\d+$/.test(goToPage);
                if (isInt) {
                    if (parseInt(goToPage) > Math.ceil(CONTENT.chapters.length/MAX_OFFSET) || !parseInt(goToPage)){
                        _setFeedBack("Page is out of index.")
                    }else{
                        setPage(parseInt(goToPage))
                        setWidgetContext({state:false,component:<></>})
                    }
                    
                }else _setFeedBack("Input is not a valid number.")
            })}
        >Go</Button>
        </View>
        
    </View>)
}

interface RequestChapterWidgetProps {
    SOURCE: string | string[];
    ID: string | string[];
    CHAPTER: any;
    chapterQueue: any;
    setChapterQueue: any;
    chapterRequested: any;
    setChapterRequested: any;
    get_requested_info: any;
  }

export const RequestChapterWidget: React.FC<RequestChapterWidgetProps> = ({
    SOURCE,
    ID,
    CHAPTER,
    chapterQueue,
    setChapterQueue,
    chapterRequested,
    setChapterRequested,
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
                        const new_queue:any = {}
                        new_queue[CHAPTER.id] = "queue"
                        setChapterRequested({...chapterRequested,...new_queue})
                        
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

interface BookmarkWidgetProps {
    onRefresh: any;
    SOURCE: string | string[];
    ID: string | string[];
    CONTENT: any;
  }

export const BookmarkWidget: React.FC<BookmarkWidgetProps> = ({
    onRefresh,
    SOURCE,
    ID,
    CONTENT
}) => {
    const Dimensions = useWindowDimensions();

    const {themeTypeContext, setThemeTypeContext}:any = useContext(CONTEXT)
    const {widgetContext, setWidgetContext}:any = useContext(CONTEXT)
    const {showCloudflareTurnstileContext, setShowCloudflareTurnstileContext}:any = useContext(CONTEXT)
    const {apiBaseContext, setApiBaseContext}:any = useContext(CONTEXT)

    const [BOOKMARK_DATA, SET_BOOKMARK_DATA]: any = useState(null)

    const [defaultBookmark, setDefaultBookmark]:any = useState("")
    const [bookmark, setBookmark]:any = useState("")
    const [createBookmark, setCreateBookmark]:any = useState({state:false,title:""})
    const [removeBookmark, setRemoveBookmark]:any = useState({state:false, removing: false})

    const controller = new AbortController();
    const signal = controller.signal;


    useEffect(()=>{
        (async ()=>{
            const stored_comic = await ComicStorage.getByID(SOURCE,CONTENT.id)
            
            if (stored_comic) {
                setDefaultBookmark(stored_comic.tag)
                setBookmark(stored_comic.tag)
            }

            const stored_bookmark_data = await Storage.get("bookmark") || []
            if (stored_bookmark_data.length) {
                const bookmark_data:Array<Object> = []
                for (const item of stored_bookmark_data) {
                    bookmark_data.push({
                        label:item,
                        value:item,
                    })
                }
                
                SET_BOOKMARK_DATA(bookmark_data.sort())
            }else SET_BOOKMARK_DATA([])
        })()
        return () => controller.abort();
    },[])

    return (<>{BOOKMARK_DATA !== null && 
        
        <View key={"BookmarkWidget"}
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
            
            <>{!createBookmark.state && !removeBookmark.state &&
                <>
                    <View
                        style={{
                            width:"100%",
                            height:"auto",
                            display:"flex",
                            flexDirection:"row",
                            alignItems:"flex-end",
                            justifyContent:"space-between",
                            gap:8,
                        }}
                    >
                        <View style={{flex:1}}>
                            <Dropdown
                                theme_type={themeTypeContext}
                                Dimensions={Dimensions}

                                label='Add to bookmark' 
                                data={BOOKMARK_DATA}
                                value={bookmark}
                                onChange={(async (item:any) => {
                                    setBookmark(item.value)
                                })}
                            />
                        </View>
                        <>{bookmark &&
                            <TouchableRipple
                                rippleColor={Theme[themeTypeContext].ripple_color_outlined}
                                style={{
                                    padding:5,
                                    borderRadius:5,
                                    borderWidth:0,
                                    backgroundColor: "transparent",
                                }}
                                onPress={(async ()=>{
                                    const stored_comic = await ComicStorage.getByID(SOURCE,CONTENT.id)
                                    if (stored_comic) setRemoveBookmark({...removeBookmark,state:true})
                                    else setBookmark("")
                                })}
                            >
                                <Icon source={"tag-remove-outline"} size={((Dimensions.width+Dimensions.height)/2)*0.035} color={"red"}/>
                            </TouchableRipple>
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
                        <Button mode='contained' 
                    labelStyle={{
                        color:Theme[themeTypeContext].text_color,
                        fontFamily:"roboto-medium",
                        fontSize:(Dimensions.width+Dimensions.height)/2*0.02
                    }} 
                    style={{backgroundColor:"blue",borderRadius:5}} 
                    onPress={(()=>{
                        setCreateBookmark({state:true,title:""})
                    })}
                        >+ Create Bookmark</Button>
                        <Button mode='outlined' 
                            labelStyle={{
                                color:Theme[themeTypeContext].text_color,
                                fontFamily:"roboto-medium",
                                fontSize:(Dimensions.width+Dimensions.height)/2*0.02,
                                

                            }} 
                            style={{
                                
                                borderRadius:5,
                                borderWidth:2,
                                borderColor:Theme[themeTypeContext].border_color
                            }} 
                            onPress={(async ()=>{
                                if (defaultBookmark !== bookmark){
                                    const stored_comic = await ComicStorage.getByID(SOURCE,CONTENT.id)
                                    if (stored_comic) await ComicStorage.replaceTag(SOURCE, CONTENT.id, bookmark)
                                    else {
                                        const cover_result:any = await store_comic_cover(setShowCloudflareTurnstileContext,signal,SOURCE,ID,CONTENT)
                                        
                                        await ComicStorage.store(SOURCE,CONTENT.id, bookmark, {
                                            cover:cover_result,
                                            title:CONTENT.title,
                                            author:CONTENT.author,
                                            category:CONTENT.category,
                                            status:CONTENT.status,
                                            synopsis:CONTENT.synopsis,
                                            updated:CONTENT.updated,
                                        })
                                    }
                                    onRefresh()
                                }
                                setWidgetContext({state:false,component:<></>})
                                
                            })}
                        >Done</Button>
                    </View>
                </>
            }</>
            
            <>{createBookmark.state &&
                    <>
                    <View 
                        style={{
                            height:"auto",
                            display:"flex",
                            flexDirection:"column",
                            gap:12,
                        }}
                    >
                        <TextInput mode="outlined" label="Create Bookmark"  textColor={Theme[themeTypeContext].text_color} maxLength={72}
                            placeholder="Bookmark Tag"
                            
                            right={<TextInput.Affix text={`| Max: 72`} />}
                            style={{
                                
                                backgroundColor:Theme[themeTypeContext].background_color,
                                borderColor:Theme[themeTypeContext].border_color,
                                
                            }}
                            outlineColor={Theme[themeTypeContext].text_input_border_color}
                            value={createBookmark.title}
                            onChange={(event)=>{
                                setCreateBookmark({...createBookmark,title:event.nativeEvent.text})
                            }}
                        />
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
                        <Button mode='outlined' 
                            labelStyle={{
                                color:Theme[themeTypeContext].text_color,
                                fontFamily:"roboto-medium",
                                fontSize:(Dimensions.width+Dimensions.height)/2*0.02,
                                

                            }} 
                            style={{
                                
                                borderRadius:5,
                                borderWidth:2,
                                borderColor:Theme[themeTypeContext].border_color
                            }} 
                            onPress={(()=>{
                                
                                setCreateBookmark({...createBookmark,state:false})
                                
                            })}
                        >Cancel</Button>
                        <Button mode='contained' 
                            labelStyle={{
                                color:Theme[themeTypeContext].text_color,
                                fontFamily:"roboto-medium",
                                fontSize:(Dimensions.width+Dimensions.height)/2*0.02
                            }} 
                            style={{backgroundColor:"green",borderRadius:5}} 
                            onPress={(async()=>{
                                
                                const title = createBookmark.title
                                if (!title) return

                                const stored_bookmark_data = await Storage.get("bookmark") || []
                                if (stored_bookmark_data.includes(title)){
                                    Toast.show({
                                        type: 'error',
                                        text1: '🔖 Duplicate Bookmark',
                                        text2: `Tag "${title}" already existed in your bookmark.`,
                                        
                                        position: "bottom",
                                        visibilityTime: 5000,
                                        text1Style:{
                                            fontFamily:"roboto-bold",
                                            fontSize:((Dimensions.width+Dimensions.height)/2)*0.025
                                        },
                                        text2Style:{
                                            fontFamily:"roboto-medium",
                                            fontSize:((Dimensions.width+Dimensions.height)/2)*0.0185,
                                            
                                        },
                                    });
                                }else{
                                    await Storage.store("bookmark", [...stored_bookmark_data,title].sort())
                                    SET_BOOKMARK_DATA([...BOOKMARK_DATA,
                                        {label:title,value:title}
                                    ].sort())
                                    setCreateBookmark({state:false,title:""})
                                    Toast.show({
                                        type: 'info',
                                        text1: '🔖 Create Bookmark',
                                        text2: `Tag "${title}" added to your bookmark.`,
                                        
                                        position: "bottom",
                                        visibilityTime: 3000,
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
                            })}
                        >Add</Button>
                    </View>
                </>
            }</>
            <>{removeBookmark.state &&
                <>
                    <View 
                        style={{
                            height:"auto",
                            display:"flex",
                            flexDirection:"column",
                            gap:12,
                        }}
                    >
                        <Text
                            style={{
                                color:Theme[themeTypeContext].text_color,
                                fontFamily:"roboto-bold",
                                fontSize:(Dimensions.width+Dimensions.height)/2*0.03,
                                textAlign:"center",
                            }}
                        >Are you sure you want to remove this comic from bookmark?</Text>

                        <Text
                            style={{
                                color:Theme[themeTypeContext].text_color,
                                fontFamily:"roboto-medium",
                                fontSize:(Dimensions.width+Dimensions.height)/2*0.025,
                                textAlign:"center",
                            }}
                        >This will remove all local saved info and chapters.</Text>
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
                        <>{removeBookmark.removing 
                            ? <ActivityIndicator animating={true}/>
                            :<>
                        
                                <Button mode='outlined' disabled={removeBookmark.removing}
                                    labelStyle={{
                                        color:Theme[themeTypeContext].text_color,
                                        fontFamily:"roboto-medium",
                                        fontSize:(Dimensions.width+Dimensions.height)/2*0.02,
                                        

                                    }} 
                                    style={{
                                        
                                        borderRadius:5,
                                        borderWidth:2,
                                        borderColor:Theme[themeTypeContext].border_color
                                    }} 
                                    onPress={(()=>{
                                        setRemoveBookmark({...removeBookmark,state:false})
                                    })}
                                >No</Button>
                                <Button mode='contained' disabled={removeBookmark.removing}
                                    labelStyle={{
                                        color:Theme[themeTypeContext].text_color,
                                        fontFamily:"roboto-medium",
                                        fontSize:(Dimensions.width+Dimensions.height)/2*0.02
                                    }} 
                                    style={{backgroundColor:"red",borderRadius:5}} 
                                    onPress={(async ()=>{
                                        setRemoveBookmark({...removeBookmark,removing:false})
                                        if (Platform.OS !== "web"){
                                            const comic_dir = FileSystem.documentDirectory + "ComicMTL/" + `${SOURCE}/` + `${ID}/`
                                            await FileSystem.deleteAsync(comic_dir, { idempotent: true })
                                        }
                                        
                                        await ChapterStorage.drop(`${SOURCE}-${CONTENT.id}`)
                                        await ComicStorage.removeByID(SOURCE,CONTENT.id)
                                        
                                        onRefresh()
                                        setWidgetContext({state:false,component:<></>})
                                    })}
                                >Yes</Button>
                            </>
                        }</>
                        
                    </View>
                </>
            }</>

        </View>
        
    }</>) 
}
