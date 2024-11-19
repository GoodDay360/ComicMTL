
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
import { store_comic_cover } from '../../modules/content';
import Storage from '@/constants/module/storages/storage';
import ComicStorage from '@/constants/module/storages/comic_storage';
import ImageCacheStorage from '@/constants/module/storages/image_cache_storage';
import ChapterStorage from '@/constants/module/storages/chapter_storage';


interface BookmarkWidgetProps {
    onRefresh: any;
    SOURCE: string | string[];
    ID: string | string[];
    CONTENT: any;
}

const BookmarkWidget: React.FC<BookmarkWidgetProps> = ({
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

    const [BOOKMARK_DATA, SET_BOOKMARK_DATA]: any = useState([])
    const [MIGRATE_BOOKMARK_DATA, SET_MIGRATE_BOOKMARK_DATA]:any = useState([])

    
    const [showMenuOption, setShowMenuOption]:any = useState({state:false,positions:[0,0,0,0],id:""})
    const [searchTag, setSearchTag]:any = useState("")
    
    const [migrateTag,setMigrateTag]:any = useState("")

    const [defaultTag, setDefaultTag]:any = useState("")
    const [bookmark, setBookmark]:any = useState("")
    const [manageBookmark, setManageBookmark]:any = useState({state:false,edit:"",delete:""})
    const [createTag, setCreateTag]:any = useState({state:false,title:""})
    const [removeTag, setRemoveTag]:any = useState({state:false, removing: false})


    const controller = new AbortController();
    const signal = controller.signal;

    const RenderTag =  useCallback(({item}:any) =>{
            const [editTag, setEditTag]:any = useState(item.value)
            useEffect(()=>{
                console.log("render again?")
            },[])
            
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
                                    <Text
                                        style={{
                                            color:"white",
                                            fontFamily:"roboto-medium",
                                            fontSize:(Dimensions.width+Dimensions.height)/2*0.025
                                        }}
                                    >{item.label}</Text>
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
                            <>{manageBookmark.edit &&
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
                                                        if ((manageBookmark.edit === defaultTag) && (editTag !== defaultTag)) {
                                                            onRefresh();
                                                            setWidgetContext({state:false,component:<></>});

                                                        }else{
                                                            
                                                            const index = BOOKMARK_DATA.findIndex((item:any) => item.value === manageBookmark.edit);
                                                            if (index !== -1){
                                                                BOOKMARK_DATA[index].label = editTag
                                                                BOOKMARK_DATA[index].value = editTag
                                                            }
                                                            SET_BOOKMARK_DATA(BOOKMARK_DATA)
                                                            setManageBookmark({...manageBookmark,edit:""})
                                                            setEditTag("")
                                                        }
                                                        
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
    ,[Theme,themeTypeContext,manageBookmark,searchTag,removeTag,createTag,defaultTag,bookmark,showMenuOption,MIGRATE_BOOKMARK_DATA,BOOKMARK_DATA])
    

    const load_bookmark = async ()=>{
        const stored_comic = await ComicStorage.getByID(SOURCE,CONTENT.id)
        
        if (stored_comic) {
            setDefaultTag(stored_comic.tag)
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
    }

    useEffect(()=>{
        console.log(BOOKMARK_DATA)
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
            
            <>{!manageBookmark.state && !createTag.state && !removeTag.state &&
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
                                    if (stored_comic) setRemoveTag({...removeTag,state:true})
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
                                fontSize:(Dimensions.width+Dimensions.height)/2*0.02,
                                paddingVertical:4,
                            }} 
                            style={{backgroundColor:"blue",borderRadius:5}} 
                            onPress={(()=>{
                                setManageBookmark({...manageBookmark,state:true})
                            })}
                        >Manage Bookmark</Button>
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
                                if (defaultTag !== bookmark){
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

            <>{manageBookmark.state && !createTag.state && !removeTag.state && <>
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
                            }}>No bookmark found</Text>
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
                                setManageBookmark({...manageBookmark,state:false,edit:"",delete:""})
                                setShowMenuOption({...showMenuOption,state:false,id:""})
                            })}
                        >Back</Button>
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
                        <TextInput mode="outlined" label="Create Bookmark"  textColor={Theme[themeTypeContext].text_color} maxLength={72}
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
                                }
                            })}
                        >Add</Button>
                    </View>
                </>
            }</>
            <>{removeTag.state &&
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
                        <>{removeTag.removing 
                            ? <ActivityIndicator animating={true}/>
                            :<>
                        
                                <Button mode='outlined' disabled={removeTag.removing}
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
                                        setRemoveTag({...removeTag,state:false})
                                    })}
                                >No</Button>
                                <Button mode='contained' disabled={removeTag.removing}
                                    labelStyle={{
                                        color:Theme[themeTypeContext].text_color,
                                        fontFamily:"roboto-medium",
                                        fontSize:(Dimensions.width+Dimensions.height)/2*0.02
                                    }} 
                                    style={{backgroundColor:"red",borderRadius:5}} 
                                    onPress={(async ()=>{
                                        setRemoveTag({...removeTag,removing:false})
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
        <>{showMenuOption.state && manageBookmark.state &&
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

                                        if (defaultTag === manageBookmark.delete) {
                                            setWidgetContext({state:false,component:<></>});
                                            onRefresh();
                                        }else {
                                            const index_2 = BOOKMARK_DATA.findIndex((item:any) => item.value === manageBookmark.delete);
                                            if (index_2 !== -1){
                                                BOOKMARK_DATA.splice(index_2, 1);
                                            }
                                            SET_BOOKMARK_DATA(BOOKMARK_DATA)
                                            setManageBookmark({...manageBookmark,edit:"",delete:""})
                                            setShowMenuOption({...showMenuOption,state:false,id:""})
                                            setMigrateTag("")
                                        }
                                    
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

                                    if (defaultTag === manageBookmark.delete) {
                                        setWidgetContext({state:false,component:<></>});
                                        onRefresh();
                                    }else {
                                        const index_2 = BOOKMARK_DATA.findIndex((item:any) => item.value === manageBookmark.delete);
                                        if (index_2 !== -1){
                                            BOOKMARK_DATA.splice(index_2, 1);
                                        }
                                        SET_BOOKMARK_DATA(BOOKMARK_DATA)
                                        setManageBookmark({...manageBookmark,edit:"",delete:""})
                                        setShowMenuOption({...showMenuOption,state:false,id:""})
                                        setMigrateTag("")
                                    }
                                    
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