import React, { useEffect, useState, useCallback, useContext, useRef } from 'react';
import { Link } from 'expo-router';
import Image from '@/components/Image';
import { StyleSheet, View, useWindowDimensions, ScrollView, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon, MD3Colors, Button, Text } from 'react-native-paper';
import CountryFlag from "react-native-country-flag";
import Dropdown from '@/components/dropdown';


import Theme from '@/constants/theme';
import { __styles } from '../stylesheet/styles';
import Storage from '@/constants/module/storage';
import ImageStorage from '@/constants/module/image_storage';
import { CONTEXT } from '@/constants/module/context';
import { get_list } from '@/app/explore/module/content'
import { transformAsync } from '@babel/core';





const ShowList = ({showCloudflareTurnstile,setShowCloudflareTurnstile,itemSelected,setItemSelected}:any) => {
    

    const {showMenuContext, setShowMenuContext}:any = useContext(CONTEXT)
    const {themeTypeContext, setThemeTypeContext}:any = useContext(CONTEXT)
    const {apiBaseContext, setApiBaseContext}:any = useContext(CONTEXT)
    
    const [styles, setStyles]:any = useState("")
    const Dimensions = useWindowDimensions();

    const [CONTENT, SET_CONTENT]:any = useState([])
    const [isLoading, setIsLoading]:any = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const scrollOffset = useRef(0);

    const [showOption, setShowOption]:any = useState({type:null})
    const [translate, setTranslate]:any = useState({});
    
    const controller = new AbortController();
    const signal = controller.signal;

    useEffect(() => { 
        (async ()=>{
            
            setStyles(__styles(themeTypeContext,Dimensions))

            let __translate:any = await Storage.get("explore_translate")
            if (!__translate) {
                __translate = {state:false,from:"auto",to:"en"}
                await Storage.store("explore_translate",JSON.stringify(__translate))
            }else __translate = JSON.parse(__translate)

            setTranslate(__translate)
            get_list(setShowCloudflareTurnstile,signal,setIsLoading,__translate,SET_CONTENT,apiBaseContext)
        })()

        return () => {
            controller.abort();
        };
    },[])



    const onRefresh = () => {
        if (!(styles && themeTypeContext && apiBaseContext)) return
        setIsLoading(true);
        SET_CONTENT([])
        get_list(setShowCloudflareTurnstile,signal,setIsLoading,translate,SET_CONTENT,apiBaseContext)
    }


    const onScroll = useCallback((event:any) => {
        const nativeEvent = event.nativeEvent
        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
        var currentOffset = event.nativeEvent.contentOffset.y;
        var direction = currentOffset > scrollOffset.current ? 'down' : 'up';
        scrollOffset.current = currentOffset;
        if (direction === 'down') {
            if (contentOffset.y <= contentSize.height*0.025) {
                setShowMenuContext(true)
            }else{
                setShowMenuContext(false)
            }
        }
        else {
            
            if (layoutMeasurement.height + contentOffset.y >= (contentSize.height - contentSize.height*0.025)) {
                setShowMenuContext(false)
            }else{
                setShowMenuContext(true)
            }
        }
        
    },[])

    

    return (<>{(styles) ?
    <ScrollView style={styles.screen_container}
        refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={()=>{
                if (!isLoading) onRefresh()
            }} />
        }
        onScroll={(event) => {onScroll(event)}}
        scrollEventThrottle={16}
    >

        <View style={styles.header_container}>
            <Text style={styles.header_text}>Explore</Text>

            <View style={styles.header_button_box}>

                
                

                <Button mode={"outlined"} style={{...styles.header_translate_button,backgroundColor: showOption.type === "translate" ? Theme[themeTypeContext].button_selected_color : "transparent"}}
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
                

                <Button mode={"outlined"} style={styles.header_search_button}
                    onPress={() => {setShowOption({type:"search"})}}
                >
                    <Icon source={"magnify"} size={((Dimensions.width+Dimensions.height)/2)*0.04} color={Theme[themeTypeContext].icon_color}/>
                </Button>

                <Button mode={"outlined"} style={styles.header_refresh_button} disabled={isLoading}
                    onPress={onRefresh}
                >
                    <Icon color={Theme[themeTypeContext].icon_color} source={"refresh"} size={((Dimensions.width+Dimensions.height)/2)*0.04}/>
                </Button>
            </View>
            

        </View>

        {showOption.type === "translate" 
            ? <View style={styles.option_container}>
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
                                await Storage.store("explore_translate",JSON.stringify({...translate,from:item.value}))
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
                                await Storage.store("explore_translate",JSON.stringify({...translate,to:item.value}))
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
                                await Storage.store("explore_translate",JSON.stringify({...translate,state:false}))
                            }else{
                                setTranslate({...translate,state:true})
                                await Storage.store("explore_translate",JSON.stringify({...translate,state:true}))
                            }
                            
                        }}
                    >
                        {translate.state ? "Disable Translation" : "Enable Translation"}
                    </Button>

                    
                </View>
            </View>
            : <></>

        }
        
        
        <View style={styles.body_container}>
            {isLoading
                ? <Image setShowCloudflareTurnstile={setShowCloudflareTurnstile} source={require("@/assets/gif/cat-loading.gif")} style={{width:((Dimensions.width+Dimensions.height)/2)*0.15,height:((Dimensions.width+Dimensions.height)/2)*0.15}}/>
                : <>{CONTENT.map((item:any,index:number)=>(
                    <Pressable key={index}
                        onPress={() => {setItemSelected(item.id)}}
                    >
                        <View style={styles.item_box}>
                            <Image setShowCloudflareTurnstile={setShowCloudflareTurnstile} onError={(error:any)=>{console.log("load image error",error)}} source={{uri:`${apiBaseContext}${item.cover}`}} style={styles.item_cover}
                                contentFit="cover" transition={1000}
                            />
                            <Text style={styles.item_title}>{item.title}</Text>
                        </View>
                    </Pressable>
                ))}</>
            }

        </View>

    </ScrollView>
    : <></>
    }
    </>);
}

export default ShowList;

