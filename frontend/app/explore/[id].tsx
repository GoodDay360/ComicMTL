import React, { useEffect, useState, useCallback, useContext, useRef } from 'react';
import { Link, useLocalSearchParams, useNavigation } from 'expo-router';
import Image from '@/components/Image';
import { StyleSheet, useWindowDimensions, ScrollView, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon, MD3Colors, Button, Text, TextInput } from 'react-native-paper';
import CountryFlag from "react-native-country-flag";
import Dropdown from '@/components/dropdown';


import Theme from '@/constants/theme';
import { __styles } from './stylesheet/show_styles';
import Storage from '@/constants/module/storage';
import ImageStorage from '@/constants/module/image_storage';
import { CONTEXT } from '@/constants/module/context';
import { transformAsync } from '@babel/core';
import { View, AnimatePresence } from 'moti';





const Show = ({showCloudflareTurnstile,setShowCloudflareTurnstile}:any) => {
    const {showMenuContext, setShowMenuContext}:any = useContext(CONTEXT)
    const {themeTypeContext, setThemeTypeContext}:any = useContext(CONTEXT)
    const {apiBaseContext, setApiBaseContext}:any = useContext(CONTEXT)
    const {widgetContext, setWidgetContext}:any = useContext(CONTEXT)

    const LOCAL_PARAMS = useLocalSearchParams()

    const Dimensions = useWindowDimensions();

    const [styles, setStyles]:any = useState("")
    const [translate, setTranslate]:any = useState({});
    
    const controller = new AbortController();
    const signal = controller.signal;

    useEffect(() => { 
        (async ()=>{
            console.log(LOCAL_PARAMS)
            setStyles(__styles(themeTypeContext,Dimensions))

            let __translate:any = await Storage.get("explore_show_translate")
            if (!__translate) {
                __translate = {state:false,from:"auto",to:"en"}
                await Storage.store("explore_show_translate",JSON.stringify(__translate))
            }else __translate = JSON.parse(__translate)

            setTranslate(__translate)
            
        })()

        return () => {
            controller.abort();
        };
    },[])

    return (<>
        <Text>{LOCAL_PARAMS.id}</Text>
        </>)
    

}

export default Show;

