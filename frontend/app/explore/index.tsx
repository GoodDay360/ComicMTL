import React, { useEffect, useState, useCallback, useContext, useRef } from 'react';
import { Link, router, useFocusEffect } from 'expo-router';
import Image from '@/components/Image';
import { StyleSheet, useWindowDimensions, ScrollView, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon, MD3Colors, Button, Text, TextInput, TouchableRipple } from 'react-native-paper';
import CountryFlag from "react-native-country-flag";
import Dropdown from '@/components/dropdown';


import Theme from '@/constants/theme';
import { __styles } from './stylesheet/styles';
import Storage from '@/constants/module/storages/storage';
import ImageStorage from '@/constants/module/storages/image_cache_storage';
import { CONTEXT } from '@/constants/module/context';
import { get_list } from '@/app/explore/module/content'
import { transformAsync } from '@babel/core';
import { View, AnimatePresence } from 'moti';
import { PageNavigationWidget } from './components/widgets';

const Index = ({}:any) => {
    const Dimensions = useWindowDimensions();

    const {showMenuContext, setShowMenuContext}:any = useContext(CONTEXT)
    const {themeTypeContext, setThemeTypeContext}:any = useContext(CONTEXT)
    const {apiBaseContext, setApiBaseContext}:any = useContext(CONTEXT)
    const {widgetContext, setWidgetContext}:any = useContext(CONTEXT)
    const {showCloudflareTurnstileContext, setShowCloudflareTurnstileContext}:any = useContext(CONTEXT)
    
    const [styles, setStyles]:any = useState("")
    

    const [CONTENT, SET_CONTENT]:any = useState([])
    const [isLoading, setIsLoading]:any = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [feedBack, setFeedBack] = useState("")
    const scrollOffset = useRef(0);

    const [showOption, setShowOption]:any = useState({type:null})
    const [translate, setTranslate]:any = useState({});
    const [search, setSearch]:any = useState({text:"",type:1});
    const [source, setSource]:any = useState("colamanga")
    const [page, setPage] = useState(1);
    
    const controller = new AbortController();
    const signal = controller.signal;

    useFocusEffect(useCallback(() => {
        setShowMenuContext(true)
        return () => {
            
        };
    }, []))
    
    useFocusEffect(useCallback(() => {
        (async ()=>{
            setStyles(__styles(themeTypeContext,Dimensions))

            let __translate:any = await Storage.get("explore_translate")
            if (!__translate) {
                __translate = {state:false,from:"auto",to:"en"}
                await Storage.store("explore_translate",__translate)
            }else __translate = __translate

            setTranslate(__translate)
            get_list(setShowCloudflareTurnstileContext,setFeedBack,signal,setIsLoading,__translate,SET_CONTENT,search,page)
        })()

        return () => {
            controller.abort();
        };
    },[]))



    const onRefresh = () => {
        if (!(styles && themeTypeContext && apiBaseContext)) return
        setIsLoading(true);
        SET_CONTENT([])
        get_list(setShowCloudflareTurnstileContext,setFeedBack,signal,setIsLoading,translate,SET_CONTENT,search,page)
        
    }

    useEffect(()=>{
        onRefresh()
    },[page])



    

    return (<>{(styles && !isLoading) ? <>
        <ScrollView style={styles.screen_container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={()=>{
                    if (!isLoading) onRefresh()
                }} />
            }
        >

            <View style={styles.header_container}>
                <Text style={styles.header_text}>Explore</Text>

                <View style={styles.header_button_box}>

                    
                    

                    <TouchableRipple
                        rippleColor={Theme[themeTypeContext].ripple_color_outlined}
                        style={{
                            ...styles.header_translate_button,
                            backgroundColor: showOption.type === "translate" ? Theme[themeTypeContext].button_selected_color : "transparent"
                        }}
                        
                        onPress={() => {
                            if (showOption.type === "translate"){
                                setShowOption({type:null})
                            }else{
                                setShowOption({type:"translate"})
                            }
                        }}
                    >
                        <Icon source={translate.state ? "translate" : "translate-off"} size={((Dimensions.width+Dimensions.height)/2)*0.04} color={Theme[themeTypeContext].icon_color}/>
                    </TouchableRipple>
                    

                    <TouchableRipple
                        rippleColor={Theme[themeTypeContext].ripple_color_outlined}
                        style={{
                            ...styles.header_search_button,
                            backgroundColor: showOption.type === "search" ? Theme[themeTypeContext].button_selected_color : "transparent"
                        }}
                        
                        onPress={() => {
                            if (showOption.type === "search"){
                                setShowOption({type:null})
                            }else{
                                setShowOption({type:"search"})
                            }
                        }}
                    >
                        <Icon source={"magnify"} size={((Dimensions.width+Dimensions.height)/2)*0.04} color={Theme[themeTypeContext].icon_color}/>
                    </TouchableRipple>

                    <TouchableRipple
                        rippleColor={Theme[themeTypeContext].ripple_color_outlined}
                        disabled={isLoading}
                        style={
                            styles.header_refresh_button
                        }
                        
                        onPress={onRefresh}
                    >
                        <Icon color={Theme[themeTypeContext].icon_color} source={"refresh"} size={((Dimensions.width+Dimensions.height)/2)*0.04}/>
                    </TouchableRipple>
                </View>
                

            </View>
            <AnimatePresence>
                {showOption.type === "translate" &&
                    <View style={styles.option_container} key={"translate"}
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
                        <View style={{
                            display:"flex",
                            flexDirection:"row",
                            width:"100%",
                            justifyContent:"space-around",
                            gap:25,
                            
                        }}>
                            <View style={{flexGrow:1,}}>
                                <Dropdown
                                    theme_type={themeTypeContext}
                                    Dimensions={Dimensions}

                                    label='From Language' 
                                    data={[
                                        { 
                                            label: "Auto", 
                                            value: 'auto' 
                                        },
                                        { 
                                            label: "Chinese", 
                                            value: 'zh' 
                                        },
                                    ]}
                                    value={translate.from}
                                    onChange={async (item:any) => {
                                        setTranslate({...translate,from:item.value})
                                        await Storage.store("explore_translate",{...translate,from:item.value})
                                    }}
                                />
                            </View>
                            <View style={{flexGrow:1,}}>
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
                                    value={translate.to}
                                    onChange={async (item:any) => {
                                        setTranslate({...translate,to:item.value})
                                        await Storage.store("explore_translate",{...translate,to:item.value})
                                    }}
                                />
                            </View>
                        </View>
                        <View style={{
                            width:"100%",
                            display:"flex",
                            alignItems:"center",
                            justifyContent:"center",
                            flexDirection:"row",
                        }}>
                            
                            <Button mode={"contained"} style={{
                                width:"auto",
                                borderRadius:8,
                                backgroundColor: translate.state ? "red": "green",
                            }}
                                onPress={async () => {
                                    if (translate.state){
                                        setTranslate({...translate,state:false})
                                        await Storage.store("explore_translate",{...translate,state:false})
                                    }else{
                                        setTranslate({...translate,state:true})
                                        await Storage.store("explore_translate",{...translate,state:true})
                                    }
                                    
                                }}
                            >
                                {translate.state ? "Disable Translation" : "Enable Translation"}
                            </Button>

                            
                        </View>
                    </View>
                }

                {showOption.type === "search" &&
                    <View style={styles.option_container} key={"search"}
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
                        <View style={{
                            display:"flex",
                            flexDirection: Dimensions.width <= 720 ? "column" : "row",
                            width:"100%",
                            alignItems:"center",
                            justifyContent:"center",
                            gap:25,
                            
                        }}>
                            <View style={{flex:1,width:"100%"}}>
                                <TextInput mode="outlined" label="Search"  textColor={Theme[themeTypeContext].text_color} 
                                    placeholder="Tip: search by using the original language for better results"
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
                            <View 
                                style={{
                                    display:"flex",
                                    flexDirection:Dimensions.width <= 720 ? "row-reverse" : "row",
                                    gap:25, 
                                    justifyContent:"center",
                                    alignItems:"center",
                                }}>
                                <Button mode="contained" disabled={isLoading}
                                    style={{
                                
                                        borderRadius:5,
                                        backgroundColor: "purple",
                                    }}
                                    labelStyle={{fontFamily:"roboto-medium",fontSize:(Dimensions.width+Dimensions.height)/2*0.0220}}
                                    onPress={()=>{
                                        onRefresh()
                                    }}
                                >
                                    Search
                                </Button>
                                <View style={{flexGrow:1}}>
                                    <Dropdown
                                        theme_type={themeTypeContext}
                                        Dimensions={Dimensions}

                                        label='Search Type' 
                                        data={[
                                            { 
                                                label: "Obscure ", 
                                                value: 1
                                            },
                                            { 
                                                label: "Precise", 
                                                value: 2
                                            },
                                        ]}
                                        value={search.type}
                                        onChange={(item:any) => {
                                            setSearch({...search,type:item.value})
                                        }}
                                    />
                                </View>
                            </View>

                            
                        </View>
                    </View>
                }
            </AnimatePresence>
            <View style={styles.body_container}>
                
                <View style={styles.content_container}>
                    {feedBack
                        ? <View 
                            style={{
                                width:"100%",
                                height:"auto",
                                display:"flex",
                                justifyContent:"center",
                                alignItems:"center",
                                padding:12,
                                paddingTop:20,
                            }}
                        >
                            <Text
                                style={{
                                    color:Theme[themeTypeContext].text_color,
                                    fontFamily:"roboto-medium",
                                    fontSize:(Dimensions.width+Dimensions.height)/2*0.03
                                }}
                            >{feedBack}</Text>
                        </View>
                        : <>
                            {CONTENT.map((item:any,index:number)=>(
                                <TouchableRipple 
                                    rippleColor={Theme[themeTypeContext].ripple_color_outlined}
                                    onPress={()=>{router.navigate(`/view/${source}/${item.id}`)}} key={index}
                                    style={styles.item_box}
                                >
                                    <>
                                        <Image onError={(error:any)=>{console.log("load image error",error)}} source={{uri:`${apiBaseContext}${item.cover}`}} style={styles.item_cover}
                                                contentFit="cover" transition={1000}
                                            />
                                        
                                        <Text selectable={false} style={styles.item_title}>{item.title}</Text>
                                    </>
                                </TouchableRipple>
                                
                            ))}
                        </>
                        
                    }
                    

                </View>
                {CONTENT.length 
                    ? <View 
                        style={{
                            display:"flex",
                            flexDirection:"row",
                            justifyContent:"center",
                            gap:8,
                            padding:12,
                        }}
                    >
                        <Button mode='outlined' 
                            labelStyle={{
                                color:Theme[themeTypeContext].text_color,
                                fontFamily:"roboto-medium",
                                fontSize:(Dimensions.width+Dimensions.height)/2*0.03
                            }} 
                            style={{borderWidth:0}} 
                            onPress={(()=>{
                                if (page === 1) return
                                setPage((page:number) => page-1)
                                
                            }
                                
                            )}
                        >{"<"}</Button>
                        <Button mode='outlined'
                            labelStyle={{
                                color:Theme[themeTypeContext].text_color,
                                fontFamily:"roboto-medium",
                                fontSize:(Dimensions.width+Dimensions.height)/2*0.02
                            }} 
                            style={{
                                borderRadius:8,
                                borderColor:Theme[themeTypeContext].border_color,
                            }} 
                            onPress={(()=>{
                                setWidgetContext({state:true,component:<PageNavigationWidget setPage={setPage}/>})
                                    
                            })}

                        >{page}</Button>
                        <Button mode='outlined' 
                            labelStyle={{
                                color:Theme[themeTypeContext].text_color,
                                fontFamily:"roboto-medium",
                                fontSize:(Dimensions.width+Dimensions.height)/2*0.03
                            }} 
                            style={{borderWidth:0}} 
                            onPress={(()=>{
                                setPage((page:number) => page+1)
                                
                            })}
                        >{">"}</Button>
                    </View>
                    : <></>
                }
                
            </View>

        </ScrollView>
    </>
    : <View style={{zIndex:5,width:"100%",height:"100%",display:"flex",justifyContent:"center",alignItems:"center",backgroundColor:Theme[themeTypeContext].background_color}}>
        <Image setShowCloudflareTurnstile={setShowCloudflareTurnstileContext} source={require("@/assets/gif/cat-loading.gif")} style={{width:((Dimensions.width+Dimensions.height)/2)*0.15,height:((Dimensions.width+Dimensions.height)/2)*0.15}}/>
    </View>
    }</>);
}

export default Index;

