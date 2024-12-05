
import React, { useEffect, useState, useCallback, useContext, useRef, Fragment, memo } from 'react';
import { Platform, useWindowDimensions, ScrollView } from 'react-native';

import { Icon, MD3Colors, Button, Text, TextInput, TouchableRipple, ActivityIndicator, Menu, Divider, PaperProvider, Portal } from 'react-native-paper';
import { View, AnimatePresence } from 'moti';
import Toast from 'react-native-toast-message';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';


import Theme from '@/constants/theme';
import Dropdown from '@/components/dropdown';
import { CONTEXT } from '@/constants/module/context';
import Storage from '@/constants/module/storages/storage';
import ComicStorage from '@/constants/module/storages/comic_storage';
import ImageCacheStorage from '@/constants/module/storages/image_cache_storage';
import ChapterStorage from '@/constants/module/storages/chapter_storage';
import ChapterDataStorage from '@/constants/module/storages/chapter_data_storage';

interface BookmarkWidgetProps {
    setIsLoading: any;
    onRefresh: any;
}

const BookmarkWidget: React.FC<BookmarkWidgetProps> = ({
    setIsLoading,
    onRefresh,
}) => {
    const Dimensions = useWindowDimensions();

    const {themeTypeContext, setThemeTypeContext}:any = useContext(CONTEXT)
    const {widgetContext, setWidgetContext}:any = useContext(CONTEXT)
    const {showCloudflareTurnstileContext, setShowCloudflareTurnstileContext}:any = useContext(CONTEXT)
    const {apiBaseContext, setApiBaseContext}:any = useContext(CONTEXT)

    const [BOOKMARK_DATA, SET_BOOKMARK_DATA]: any = useState([])
    const [MIGRATE_BOOKMARK_DATA, SET_MIGRATE_BOOKMARK_DATA]:any = useState([])

    
    const [showMenuOption, setShowMenuOption]:any = useState({state:false,positions:[0,0,0,0],id:""})
    const [searchTag, setSearchTag]:any = useState("")
    
    const [migrateTag,setMigrateTag]:any = useState("")

    const [manageBookmark, setManageBookmark]:any = useState({edit:"",delete:""})
    const [createTag, setCreateTag]:any = useState({state:false,title:""})
    const [removeTag, setRemoveTag]:any = useState({state:false, removing: false})


    const controller = new AbortController();
    const signal = controller.signal;

    const RenderTag =  useCallback(({item}:any) =>{
            const [editTag, setEditTag]:any = useState(item.value)
            useEffect(()=>{
            },[manageBookmark])
            
            return (<>
                {item.value.includes(searchTag) &&
                    (
                        <View
                            style={{
                                display:"flex",
                                flexDirection:"row",
                                alignItems:"center",
                                justifyContent:"space-between",
                                gap:8,
                                zIndex:10,
                            }}
                        >
                            <>{manageBookmark.edit !== item.value && manageBookmark.delete !== item.value && 
                                (<View
                                    style={{
                                        width:"100%",
                                        display:"flex",
                                        flexDirection:"row",
                                        justifyContent:"space-between",
                                        alignItems:"center",
                                        height:"auto",
                                        gap:18,
                                    }}
                                >
                                    <View
                                        style={{
                                            flex:1,
                                        }}
                                    >
                                        <Text
                                            style={{
                                                color:"white",
                                                fontFamily:"roboto-medium",
                                                fontSize:(Dimensions.width+Dimensions.height)/2*0.025,
                                                width:"100%"
                                            }}
                                        >{item.label}</Text>
                                    </View>
                                    <View
                                        style={{
                                            width:"auto",
                                            height:"auto",
                                            
                                        }}
                                    >
                                        
                                        <TouchableRipple
                                            
                                            rippleColor={Theme[themeTypeContext].ripple_color_outlined}
                                            style={{
                                                borderRadius:5,
                                                borderWidth:0,
                                                backgroundColor: "transparent",
                                                padding:5,
                                                
                                            }}

                                            onPress={(event)=>{
                                                if (manageBookmark.edit){
                                                    setManageBookmark({...manageBookmark,edit:""})
                                                    setEditTag("")
                                                }

                                                const x = event.nativeEvent.pageX
                                                const y = event.nativeEvent.pageY
                                                
                                                setShowMenuOption({
                                                    ...showMenuOption,
                                                    state: showMenuOption.id === item.value ? false : true,
                                                    positions:[y+((Dimensions.width+Dimensions.height)/2)*0.0225,0,x-((Dimensions.width+Dimensions.height)/2)*0.18,0],
                                                    id:showMenuOption.id === item.value ? "" : item.value,
                                                })

                                                
                                                
                                            }}
                                        >
                                            
                                            <Icon source={"dots-vertical"} size={((Dimensions.width+Dimensions.height)/2)*0.035} color={Theme[themeTypeContext].icon_color}/>
                                        </TouchableRipple>
                                    </View>
                                </View>)
                            }</>
                            <>{manageBookmark.edit === item.value &&
                                (<View
                                    style={{
                                        display:"flex",
                                        flexDirection:"row",
                                        justifyContent:"space-between",
                                        alignItems:"center",
                                        width:"100%",
                                        height:"auto",
                                        gap:12,
                                        padding:12,
                                    }}
                                >
                                        <View 
                                            style={{flex:1}}
                                        >
                                            <TextInput mode="outlined" label="Edit" textColor={Theme[themeTypeContext].text_color} maxLength={72}
                                                autoFocus={true}
                                                right={<TextInput.Affix text={`| Max: 72`} />} 
                                                style={{
                                                    backgroundColor:Theme[themeTypeContext].background_color,
                                                    borderColor:Theme[themeTypeContext].border_color,
                                                    
                                                }}
                                                outlineColor={Theme[themeTypeContext].text_input_border_color}
                                                value={editTag}
                                                onChangeText={(text)=>{
                                                    setEditTag(text)
                                                }}
                                            />
                                        </View>
                                        <View
                                            style={{
                                                display:"flex",
                                                flexDirection:"row",
                                                gap:8,
                                            }}
                                        >
                                            <TouchableRipple
                                                rippleColor={Theme[themeTypeContext].ripple_color_outlined}
                                                style={{
                                                    borderRadius:5,
                                                    borderWidth:0,
                                                    backgroundColor: "transparent",
                                                    padding:5,
                                                }}

                                                onPress={()=>{
                                                    setManageBookmark({...manageBookmark,edit:""})
                                                    setEditTag("")
                                                    setShowMenuOption({...showMenuOption,state:false,id:""})
                                                }}
                                            >
                                                
                                                <Icon source={"close"} size={((Dimensions.width+Dimensions.height)/2)*0.035} color={"red"}/>
                                            </TouchableRipple>
                                            <TouchableRipple
                                                rippleColor={Theme[themeTypeContext].ripple_color_outlined}
                                                style={{
                                                    borderRadius:5,
                                                    borderWidth:0,
                                                    backgroundColor: "transparent",
                                                    padding:5,
                                                }}

                                                onPress={async ()=>{
                                                    const stored_bookmark = await Storage.get("bookmark");
                                                    
                                                    const index = stored_bookmark.findIndex((item:string) => item === manageBookmark.edit);
                                                    
                                                    if (index !== -1){
                                                        stored_bookmark[index] = editTag;
                                                        await Storage.store("bookmark", stored_bookmark)

                                                        const stored_comics:any = await ComicStorage.getByTag(manageBookmark.edit)
                                                        for (const item of stored_comics){
                                                            await ComicStorage.replaceTag(item.source, item.id, editTag)
                                                        }
                                                        

                                                        
                                                    
                                                        const index_2 = BOOKMARK_DATA.findIndex((item:any) => item.value === manageBookmark.edit);
                                                        if (index_2 !== -1){
                                                            BOOKMARK_DATA[index_2].label = editTag
                                                            BOOKMARK_DATA[index_2].value = editTag
                                                        }
                                                        SET_BOOKMARK_DATA(BOOKMARK_DATA)
                                                        setManageBookmark({...manageBookmark,edit:""})
                                                        setEditTag("")
                                                        
                                                        onRefresh();
                                                    }
                                                    setShowMenuOption({...showMenuOption,state:false,id:""})
                                                }}
                                            >
                                                
                                                <Icon source={"check"} size={((Dimensions.width+Dimensions.height)/2)*0.035} color={"green"}/>
                                            </TouchableRipple>
                                        </View>
                                    
                                            

                                </View>)

                            }</>

                            
                            
                            
                        </View>
                        
                    )
                }
            </>)
        }
    ,[Theme,themeTypeContext,manageBookmark,searchTag,removeTag,createTag,showMenuOption,MIGRATE_BOOKMARK_DATA,BOOKMARK_DATA])
    

    const load_bookmark = async ()=>{
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
    }

    useEffect(()=>{
        SET_MIGRATE_BOOKMARK_DATA([{label:"None",value:""},...BOOKMARK_DATA])
    },[BOOKMARK_DATA])

    useEffect(()=>{
        load_bookmark()
        return () => controller.abort();
    },[])

    return (<>{BOOKMARK_DATA !== null && <>
        
        <View key={"BookmarkWidget"}
            style={{
                zIndex:10,
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
            
            <>{!createTag.state && !removeTag.state && <>
                <View
                    
                    style={{
                        display:"flex",
                        flexDirection:"column",
                        gap:18,
                    }}
                >
                    <>{BOOKMARK_DATA.length
                        ? <>
                            <View 
                                style={{flex:1}}
                            >
                                <TextInput mode="outlined" label="Search" textColor={Theme[themeTypeContext].text_color} 
                                    
                                    style={{
                                        
                                        backgroundColor:Theme[themeTypeContext].background_color,
                                        borderColor:Theme[themeTypeContext].border_color,
                                        
                                    }}
                                    outlineColor={Theme[themeTypeContext].text_input_border_color}
                                    value={searchTag}
                                    onChange={(event)=>{
                                        setSearchTag(event.nativeEvent.text)
                                    }}
                                />
                            </View>
                            <View
                                style={{
                                    maxHeight:Dimensions.height*0.7
                                }}
                            >
                                <ScrollView
                                    contentContainerStyle={{
                                        display:"flex",
                                        flexDirection:"column",
                                        justifyContent:"space-around",
                                        gap:8,
                                        
                                        height:"auto",
                                        paddingVertical:12,
                                        paddingHorizontal:8,
                                    }}
                                    style={{
                                        
                                    }}
                                >
                                    <>{BOOKMARK_DATA.map((item:any) => 
                                        (
                                            <View key={item.value}>
                                                <RenderTag item={item}/>
                                                <View style={{width:"100%",height:2,backgroundColor:Theme[themeTypeContext].border_color}}/>
                                            </View>
                                        )
                                    )}</>
                                </ScrollView>
                            </View>
                        </>
                        : <>
                            <Text style={{
                                width:"100%",
                                textAlign:"center",
                                color:Theme[themeTypeContext].text_color,
                                fontSize:(Dimensions.width+Dimensions.height)/2*0.045,
                                fontFamily:"roboto-bold",
                            }}>No tag found</Text>
                        </>
                        
                    }</>

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
                            style={{backgroundColor:"green",borderRadius:5}} 
                            onPress={(()=>{
                                setCreateTag({state:true,title:""})
                                setShowMenuOption({...showMenuOption,state:false,id:""})
                            })}
                        >+ Create</Button>
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
                                setWidgetContext({state:false,component:<></>})
                            })}
                        >Done</Button>
                    </View>
                </View>
            </>}</>
            
            <>{createTag.state &&
                    <>
                    <View 
                        style={{
                            height:"auto",
                            display:"flex",
                            flexDirection:"column",
                            gap:12,
                        }}
                    >
                        <TextInput mode="outlined" label="Create Tag"  textColor={Theme[themeTypeContext].text_color} maxLength={72}
                            placeholder="Bookmark Tag"
                            
                            right={<TextInput.Affix text={`| Max: 72`} />}
                            style={{
                                
                                backgroundColor:Theme[themeTypeContext].background_color,
                                borderColor:Theme[themeTypeContext].border_color,
                                
                            }}
                            outlineColor={Theme[themeTypeContext].text_input_border_color}
                            value={createTag.title}
                            onChange={(event)=>{
                                setCreateTag({...createTag,title:event.nativeEvent.text})
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
                                
                                setCreateTag({...createTag,state:false})
                                
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
                                
                                const title = createTag.title
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
                                    setCreateTag({state:false,title:""})
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
                                    onRefresh()
                                }
                            })}
                        >Add</Button>
                    </View>
                </>
            }</>

        </View>
        <>{showMenuOption.state &&
            <View
                style={{
                    display:"flex",
                    position:"absolute",
                    zIndex:11,
                    justifyContent:"space-around",
                    flexDirection:"column",
                    
                    backgroundColor:Theme[themeTypeContext].border_color,
                    top:showMenuOption.positions[0],
                    bottom:showMenuOption.positions[1],
                    left:showMenuOption.positions[2],
                    right:showMenuOption.positions[3],
                    
                    width:(Dimensions.width+Dimensions.height)/2*0.2,
                    height:(Dimensions.width+Dimensions.height)/2*0.1,
                    
                    borderRadius:5,
                    borderWidth:2,
                    borderColor:Theme[themeTypeContext].background_color
                }}
            >
                <TouchableRipple
                    
                    rippleColor={Theme[themeTypeContext].ripple_color_outlined}
                    style={{
                        
                        borderWidth:0,
                        backgroundColor: "transparent",
                        padding:5,
                        width:"100%",
                        
                    }}

                    onPress={(event)=>{
                        setManageBookmark({...manageBookmark,edit:showMenuOption.id})
                        setShowMenuOption({...showMenuOption,state:false})
                    }}
                >
                    <View
                        style={{
                            display:"flex",
                            flexDirection:"row",
                            justifyContent:"center",
                            alignItems:"center",
                            paddingHorizontal:18,
                            
                        }}
                    >
                        <Icon source={"pencil"} size={((Dimensions.width+Dimensions.height)/2)*0.025} color={"cyan"}/>
                        <View>
                            <Text selectable={false}
                                style={{
                                    textAlign:"center",
                                    color:"cyan",
                                    fontFamily:"roboto-medium",
                                    fontSize:(Dimensions.width+Dimensions.height)/2*0.02
                                }}
                            >Edit</Text>
                        </View>
                    </View>
                </TouchableRipple>
                <View style={{width:"100%",height:2,backgroundColor:Theme[themeTypeContext].background_color}}/>
                <TouchableRipple
                    
                    rippleColor={Theme[themeTypeContext].ripple_color_outlined}
                    style={{
                        
                        borderWidth:0,
                        backgroundColor: "transparent",
                        padding:5,
                        width:"100%",
                    }}

                    onPress={(event)=>{
                        setManageBookmark({...manageBookmark,edit:"",delete:showMenuOption.id})
                        setShowMenuOption({...showMenuOption,state:false})
                    }}
                >
                    <View
                        style={{
                            display:"flex",
                            flexDirection:"row",
                            justifyContent:"center",
                            alignItems:"center",
                            paddingHorizontal:18,
                            
                        }}
                    >
                        <Icon source={"trash-can"} size={((Dimensions.width+Dimensions.height)/2)*0.025} color={"red"}/>
                        <View>
                            <Text selectable={false}
                                style={{
                                    textAlign:"center",
                                    color:"red",
                                    fontFamily:"roboto-medium",
                                    fontSize:(Dimensions.width+Dimensions.height)/2*0.02
                                }}
                            >Delete</Text>
                        </View>
                    </View>
                </TouchableRipple>

            </View>
        
        }</>
        <>{manageBookmark.delete && (

        
            <View
                style={{
                    top:0,
                    left:0,
                    position:"absolute",
                    width:Dimensions.width,
                    height:Dimensions.height,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    zIndex:11,
                    display:"flex",
                    justifyContent:"center",
                    alignItems:"center",
                    padding:15,
                }}
            >
                <View
                    style={{
                        backgroundColor:Theme[themeTypeContext].background_color,
                        maxWidth:500,
                        width:"100%",
                        height:"auto",
                        
                        borderColor:Theme[themeTypeContext].border_color,
                        borderWidth:2,
                        borderRadius:8,
                        padding:12,
                        display:"flex",
                        justifyContent:"center",
                        
                        flexDirection:"column",
                        gap:18,
                    }}
                >
                    <View
                        style={{
                            borderBottomWidth:2,
                            borderColor:Theme[themeTypeContext].border_color,
                            padding:8,
                            width:"100%",
                        }}
                    >
                        <Text
                            numberOfLines={1}
                            style={{
                                color:"red",
                                fontFamily:"roboto-bold",
                                fontSize:(Dimensions.width+Dimensions.height)/2*0.03,
                                textAlign:"center",
                            }}
                        >Delete Tag: "{manageBookmark.delete}"</Text>
                    </View>
                    <View
                        style={{
                            width:"100%",
                            display:"flex",
                            flexDirection:"column",
                            gap:12,
                        }}
                    >
                        <View style={{flex:1}}>
                            <Dropdown
                                theme_type={themeTypeContext}
                                Dimensions={Dimensions}

                                label='Migrate comics to tag' 
                                data={MIGRATE_BOOKMARK_DATA.filter((item:any) => item.value !== manageBookmark.delete)}
                                value={migrateTag}
                                onChange={(async (item:any) => {
                                    setMigrateTag(item.value)
                                })}
                            />
                        </View>
                        <>{!migrateTag && (
                            <Text
                            style={{
                                color:Theme[themeTypeContext].text_color,
                                fontFamily:"roboto-bold",
                                fontSize:(Dimensions.width+Dimensions.height)/2*0.02,
                                textAlign:"center",
                            }}
                            >Setting migration to None will remove all comics and chapters for this bookmark tag.</Text>
                        )}</>
                        <View
                            style={{
                                display:"flex",
                                flexDirection:"row",
                                width:"100%",
                                justifyContent:"space-around",
                                alignItems:"center",
                            }}
                        >
                            <>{migrateTag 
                            
                                ? <TouchableRipple
                                    
                                    rippleColor={Theme[themeTypeContext].ripple_color_outlined}
                                    style={{
                                        
                                        borderWidth:0,
                                        backgroundColor: "blue",
                                        padding:5,
                                        borderRadius:8,
                                        paddingHorizontal:12,
                                        paddingVertical:8,

                                        
                                    }}

                                    onPress={async (event)=>{
                                        const stored_bookmark = await Storage.get("bookmark")
                                        const index = stored_bookmark.findIndex((item:any) => item === manageBookmark.delete)
                                        if (index === -1) return

                                        const stored_comics = await ComicStorage.getByTag(manageBookmark.delete)
                                        for (const comic of stored_comics) {
                                            const source = comic.source;
                                            const comic_id = comic.id
                                            await ComicStorage.replaceTag(source,comic_id,migrateTag)
                                            
                                        }

                                        stored_bookmark.splice(index, 1);
                                        await Storage.store("bookmark",stored_bookmark);

                                        
                                        
                                    
                                        const index_2 = BOOKMARK_DATA.findIndex((item:any) => item.value === manageBookmark.delete);
                                        if (index_2 !== -1){
                                            BOOKMARK_DATA.splice(index_2, 1);
                                        }
                                        SET_BOOKMARK_DATA(BOOKMARK_DATA)
                                        setManageBookmark({...manageBookmark,edit:"",delete:""})
                                        setShowMenuOption({...showMenuOption,state:false,id:""})
                                        setMigrateTag("")
                                        
                                        onRefresh();
                                    }}
                                >
                                    
                                    <Text selectable={false}
                                        style={{
                                            textAlign:"center",
                                            color:Theme[themeTypeContext].text_color,
                                            fontFamily:"roboto-medium",
                                            fontSize:(Dimensions.width+Dimensions.height)/2*0.02
                                        }}
                                    >Migrate</Text>
                                        
                                </TouchableRipple>
                                : <TouchableRipple
                                    
                                rippleColor={Theme[themeTypeContext].ripple_color_outlined}
                                style={{
                                    
                                    borderWidth:0,
                                    backgroundColor: "red",
                                    padding:5,
                                    borderRadius:8,
                                    paddingHorizontal:12,
                                    paddingVertical:8,

                                    
                                }}

                                onPress={async (event)=>{
                                    const stored_bookmark = await Storage.get("bookmark");
                                    const index = stored_bookmark.findIndex((item:any) => item === manageBookmark.delete)
                                    if (index === -1) return
                                    await ComicStorage.removeByTag(manageBookmark.delete);
                                    stored_bookmark.splice(index, 1);
                                    await Storage.store("bookmark",stored_bookmark);
                                
                                    const index_2 = BOOKMARK_DATA.findIndex((item:any) => item.value === manageBookmark.delete);
                                    if (index_2 !== -1){
                                        BOOKMARK_DATA.splice(index_2, 1);
                                    }
                                    SET_BOOKMARK_DATA(BOOKMARK_DATA)
                                    setManageBookmark({...manageBookmark,edit:"",delete:""})
                                    setShowMenuOption({...showMenuOption,state:false,id:""})
                                    setMigrateTag("")
                                    onRefresh()
                                    
                                }}
                            >
                                
                                <Text selectable={false}
                                    style={{
                                        textAlign:"center",
                                        color:Theme[themeTypeContext].text_color,
                                        fontFamily:"roboto-medium",
                                        fontSize:(Dimensions.width+Dimensions.height)/2*0.02
                                    }}
                                >Delete</Text>
                                    
                            </TouchableRipple>
                            }</>
                            <TouchableRipple
                                
                                rippleColor={Theme[themeTypeContext].ripple_color_outlined}
                                style={{
                                    
                                    borderWidth:2,
                                    borderColor:Theme[themeTypeContext].border_color,
                                    backgroundColor: "transparent",
                                    padding:5,
                                    borderRadius:8,
                                    paddingHorizontal:12,
                                    paddingVertical:8,

                                    
                                }}

                                onPress={(event)=>{
                                    setShowMenuOption({...showMenuOption,state:false,id:""})
                                    setManageBookmark({...manageBookmark,edit:"",delete:""})
                                }}
                            >
                                
                                <Text selectable={false}
                                    style={{
                                        textAlign:"center",
                                        color:Theme[themeTypeContext].text_color,
                                        fontFamily:"roboto-medium",
                                        fontSize:(Dimensions.width+Dimensions.height)/2*0.02
                                    }}
                                >Cancel</Text>
                                    
                            </TouchableRipple>
                        </View>

                    </View>
                </View>

            </View>
        )}</>

    </>}</>) 
}

export default BookmarkWidget;