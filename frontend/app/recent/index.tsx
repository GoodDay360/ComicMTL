import React, { useEffect, useState } from 'react';
import { Link } from 'expo-router';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon, MD3Colors, Button, Text } from 'react-native-paper';

import { __styles } from './stylesheet/styles';

import storage from '@/constants/module/storage';
const Recent = () => {
    const [style, setStyle]:any = useState("")
    const [themeType, setThemeType]:any = useState("")
    const Dimensions = useWindowDimensions();

    useEffect(() => { 
        (async ()=>{
            const theme_type = await storage.get("theme") || "DARK_GREEN"
            setThemeType(theme_type)
            setStyle(__styles(theme_type,Dimensions))
        })()
    },[])

    return (<View style={style.screen_container}>

        <View style={style.header_container}>
            <Text style={style.header_text}>Recent</Text>
        </View>
        
        <View style={style.body_container}>

        </View>

    </View>);
}

export default Recent;

{/* <Link href="/play">Go to Play</Link> */}