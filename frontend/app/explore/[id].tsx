import React, { useEffect, useState, useCallback, useContext, useRef } from 'react';
import { Link, router, useLocalSearchParams, useNavigation } from 'expo-router';
import Image from '@/components/Image';
import { StyleSheet, useWindowDimensions, ScrollView, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon, MD3Colors, Button, Text, TextInput } from 'react-native-paper';
import CountryFlag from "react-native-country-flag";
import Dropdown from '@/components/dropdown';


import Theme from '@/constants/theme';
import { __styles } from './stylesheet/show_styles';
import Storage from '@/constants/module/storage';
import ImageCacheStorage from '@/constants/module/image_cache_storage';
import { CONTEXT } from '@/constants/module/context';
import { transformAsync } from '@babel/core';
import { View, AnimatePresence } from 'moti';

import { get } from './module/content'




const Show = ({}:any) => {
    const {showMenuContext, setShowMenuContext}:any = useContext(CONTEXT)
    const {themeTypeContext, setThemeTypeContext}:any = useContext(CONTEXT)
    const {apiBaseContext, setApiBaseContext}:any = useContext(CONTEXT)
    const {widgetContext, setWidgetContext}:any = useContext(CONTEXT)
    const {showCloudflareTurnstileContext, setShowCloudflareTurnstileContext}:any = useContext(CONTEXT)

    const ID = useLocalSearchParams().id;
    const Dimensions = useWindowDimensions();

    const [styles, setStyles]:any = useState("")
    const [translate, setTranslate]:any = useState({});
    const [CONTENT, SET_CONTENT]:any = useState({})
    const [isLoading, setIsLoading]:any = useState(true);
    const [showOption, setShowOption]:any = useState({type:null})
    const [showMoreSynopsis, setShowMoreSynopsis]:any = useState(false)
    const [refreshing, setRefreshing] = useState(false);
    
    const controller = new AbortController();
    const signal = controller.signal;

    useEffect(() => { 
        (async ()=>{
            setShowMenuContext(false)
            setStyles(__styles(themeTypeContext,Dimensions))

            let __translate:any = await Storage.get("explore_show_translate")
            if (!__translate) {
                __translate = {state:false,from:"auto",to:"en"}
                await Storage.store("explore_show_translate",__translate)
            }else __translate = __translate

            setTranslate(__translate)
            get(setShowCloudflareTurnstileContext, setIsLoading, signal, __translate, ID, SET_CONTENT)
        })()

        return () => {
            controller.abort();
        };
    },[])

    const onRefresh = () => {
        if (!(styles && themeTypeContext && apiBaseContext)) return
        setIsLoading(true);
        SET_CONTENT([])
        get(setShowCloudflareTurnstileContext, setIsLoading, signal, translate, ID, SET_CONTENT)
    }

    return (<>{(styles && !isLoading) 
        ? <ScrollView style={styles.screen_container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={()=>{
                    if (!isLoading) onRefresh()
                }} />
            }
            
        >
            <View style={styles.header_container}>
                <View style={styles.header_button_box}>
                    <Button mode={"outlined"} 
                        style={{
                            borderWidth:0,
                            backgroundColor: "translate",
                            display:"flex",
                        }}
                        onPress={()=>{
                            router.push("/explore/")
                        }}
                    >
                        <Icon source={"chevron-left"} size={((Dimensions.width+Dimensions.height)/2)*0.045} color={Theme[themeTypeContext].icon_color}/>
                    </Button>

                </View>
                <View style={styles.header_button_box}>
                    <Button mode={"outlined"} style={{borderWidth:0,backgroundColor: showOption.type === "translate" ? Theme[themeTypeContext].button_selected_color : "transparent"}}
                        onPress={() => {
                            if (showOption.type === "translate"){
                                setShowOption({type:null})
                            }else{
                                setShowOption({type:"translate"})
                            }
                        }}
                    >
                        <Icon source={translate.state ? "translate" : "translate-off"} size={((Dimensions.width+Dimensions.height)/2)*0.04} color={Theme[themeTypeContext].icon_color}/>
                    </Button>

                    <Button mode={"outlined"} style={{borderWidth:0,backgroundColor: "transparent"}} disabled={isLoading}
                        onPress={()=>{
                            onRefresh()
                        }}
                    >
                        <Icon source={"refresh"} size={((Dimensions.width+Dimensions.height)/2)*0.04} color={Theme[themeTypeContext].icon_color}/>
                    </Button>
                    <Button mode={"outlined"} style={{borderWidth:0,backgroundColor: "transparent"}}
                        onPress={()=>{
                            
                        }}
                    >
                        <Icon source={"share-variant"} size={((Dimensions.width+Dimensions.height)/2)*0.04} color={Theme[themeTypeContext].icon_color}/>
                    </Button>

                </View>
            </View>
            {showOption.type === "translate" &&
                <View style={styles.option_container}
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
                                    await Storage.store("explore_show_translate",{...translate,from:item.value})
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
                                    await Storage.store("explore_show_translate",{...translate,to:item.value})
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
                                    await Storage.store("explore_show_translate",{...translate,state:false})
                                }else{
                                    setTranslate({...translate,state:true})
                                    await Storage.store("explore_show_translate",{...translate,state:true})
                                }
                                
                            }}
                        >
                            {translate.state ? "Disable Translation" : "Enable Translation"}
                        </Button>

                        
                    </View>
                </View>
            }
            <View style={styles.body_container}>
                <View style={styles.body_box_1}>
                    <Image style={styles.item_cover} source={{uri:`${apiBaseContext}${CONTENT.cover}`}}/>
                    <View style={{flex:1,paddingBottom:15,height:"auto"}}>
                        <Text 
                            style={{
                                ...styles.item_info,
                                fontSize:((Dimensions.width+Dimensions.height)/2)*0.05,
                                fontFamily:"roboto-bold",
                                paddingBottom:10,
                            }}
                        >{CONTENT.title}
                        </Text>
                        <Text 
                            style={{
                                ...styles.item_info,
                                fontSize:((Dimensions.width+Dimensions.height)/2)*0.03
                            }}
                        >Author: {CONTENT.author || "Unknown"}
                        </Text>
                        <Text 
                            style={{
                                ...styles.item_info,
                                fontSize:((Dimensions.width+Dimensions.height)/2)*0.03
                            }}
                        >Status: {CONTENT.status}
                        </Text>
                        <Text 
                            style={{
                                ...styles.item_info,
                                fontSize:((Dimensions.width+Dimensions.height)/2)*0.03
                            }}
                        >Category: {CONTENT.category}
                        </Text>
                        <Text 
                            style={{
                                ...styles.item_info,
                                fontSize:((Dimensions.width+Dimensions.height)/2)*0.03
                            }}
                        >Updated: {CONTENT.updated}
                        </Text>
                    </View>
                </View>
                <View style={styles.body_box_2}>
                    <View
                        style={{
                            display:"flex",
                            flexDirection:"row",
                            
                            justifyContent:"space-between",
                        }}
                    >
                        <View>
                            <Text 
                                style={{
                                    ...styles.item_info,
                                    fontSize:((Dimensions.width+Dimensions.height)/2)*0.04,
                                    fontFamily:"roboto-bold",
                                }}
                            >Synopsis:</Text>
                        </View>
                        
                        <Button mode='outlined'
                            onPress={() => {
                                if (showMoreSynopsis) setShowMoreSynopsis(false)
                                else setShowMoreSynopsis(true)
                            }}
                            style={{borderWidth:0}}
                            labelStyle={{
                                fontSize:((Dimensions.width+Dimensions.height)/2)*0.025,
                                fontFamily:"roboto-medium",
                                color:"cyan",

                            }}
                        >{showMoreSynopsis ? "Show Less" : "Show More"}</Button>

                    </View>
                    
                    <Text 
                        style={{
                            ...styles.item_info,
                            fontSize:((Dimensions.width+Dimensions.height)/2)*0.03,
                            fontFamily:"roboto-medium",
                            paddingBottom:10,
                            borderColor: Theme[themeTypeContext].border_color,
                            borderBottomWidth:showMoreSynopsis ? 0 : 5,
                        }}
                        numberOfLines={showMoreSynopsis ? 0 : 2} 
                        ellipsizeMode='tail'
                    >{CONTENT.synopsis}</Text>
                </View>
            </View>
        </ScrollView>
        : <View style={{width:"100%",height:"100%",display:"flex",justifyContent:"center",alignItems:"center",backgroundColor:Theme[themeTypeContext].background_color}}>
            <Image setShowCloudflareTurnstile={setShowCloudflareTurnstileContext} source={require("@/assets/gif/cat-loading.gif")} style={{width:((Dimensions.width+Dimensions.height)/2)*0.15,height:((Dimensions.width+Dimensions.height)/2)*0.15}}/>
        </View>
    }</>)
    

}

export default Show;

