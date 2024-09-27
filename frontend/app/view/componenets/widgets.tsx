import React, { useEffect, useState, useCallback, useContext, useRef } from 'react';
import { useWindowDimensions } from 'react-native';

import { Icon, MD3Colors, Button, Text, TextInput } from 'react-native-paper';
import { View, AnimatePresence } from 'moti';
import Toast from 'react-native-toast-message';

import Theme from '@/constants/theme';
import Dropdown from '@/components/dropdown';
import { CONTEXT } from '@/constants/module/context';
import Storage from '@/constants/module/storage';


export const DownloadWidget = () => {
    const Dimensions = useWindowDimensions();

    const {themeTypeContext, setThemeTypeContext}:any = useContext(CONTEXT)
    const {widgetContext, setWidgetContext}:any = useContext(CONTEXT)



    const [_colorizer, _setColorizer] = useState(false)
    const [_translate, _setTranslate] = useState({state:false,from:"zh",to:"en"})
    return (<AnimatePresence>
        <View 
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
                <Dropdown
                    theme_type={themeTypeContext}
                    Dimensions={Dimensions}

                    label='Colorizer' 
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
                    value={_colorizer}
                    onChange={(item:any) => {
                        _setColorizer(item.value)
                    }}
                />
                <Dropdown
                    theme_type={themeTypeContext}
                    Dimensions={Dimensions}

                    label='From Language' 
                    data={[
                        { 
                            label: "Chinese", 
                            value: 'zh' 
                        },
                    ]}
                    value={_translate.from}
                    onChange={async (item:any) => {
                        _setTranslate({..._translate,from:item.value})
                        
                    }}
                />
                <Dropdown
                    theme_type={themeTypeContext}
                    Dimensions={Dimensions}

                    label='To Language' 
                    data={[
                        
                        { 
                            label: "English", 
                            value: 'en' 
                        },
                    ]}
                    value={_translate.to}
                    onChange={async (item:any) => {
                        
                        _setTranslate({..._translate,to:item.value})
                        
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
                <Button mode='contained' 
                    labelStyle={{
                        color:Theme[themeTypeContext].text_color,
                        fontFamily:"roboto-medium",
                        fontSize:(Dimensions.width+Dimensions.height)/2*0.02
                    }} 
                    style={{backgroundColor:"red",borderRadius:5}} 
                    onPress={(()=>{
                        
                        setWidgetContext({state:false,component:undefined})
                        
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
                    Toast.show({
                        type: 'info',
                        text1: '🕓 Your request has been placed in the queue.',
                        text2: 'Check back later to download your chapter.\nThe chapter will be removed from the cloud after 30 minutes or when the server out of storage.',
                        
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
                })}
                >Request</Button>
            </View>
        </View>
    </AnimatePresence>) 
}

export const BookmarkWidget = () => {
    const Dimensions = useWindowDimensions();

    const {themeTypeContext, setThemeTypeContext}:any = useContext(CONTEXT)
    const {widgetContext, setWidgetContext}:any = useContext(CONTEXT)

    const [BOOKMARK_DATA, SET_BOOKMARK_DATA]: any = useState(null)

    const [bookmark, setBookmark]:any = useState("")
    const [createBookmark, setCreateBookmark]:any = useState({state:false,title:""})

    useEffect(()=>{
        (async ()=>{
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
    },[])

    return (<>{BOOKMARK_DATA !== null && 
        <AnimatePresence>
            <View 
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
                    
                    <>{createBookmark.state 
                        ? <TextInput mode="outlined" label="Create Bookmark"  textColor={Theme[themeTypeContext].text_color} maxLength={72}
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
                        : <>
                            <Dropdown
                                theme_type={themeTypeContext}
                                Dimensions={Dimensions}

                                label='Add to bookmark' 
                                data={BOOKMARK_DATA}
                                value={bookmark}
                                onChange={(item:any) => {
                                    setBookmark(item.value)
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
                    <>{createBookmark.state
                        ? <>
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
                        </>
                        : <>
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
                                onPress={(()=>{
                                    setWidgetContext({state:false,component:null})
                                })}
                            >Done</Button>
                        </>
                    }</>
                </View>
            </View>
        </AnimatePresence>
    }</>) 
}
