import React, { useEffect, useState } from 'react';
import { Link, usePathname } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { __styles } from './stylesheet/styles';
import storage from '@/constants/module/storage';
import { Icon, MD3Colors, Button } from 'react-native-paper';
import Theme from '@/constants/theme';
import {useWindowDimensions} from 'react-native';
import MenuButton from './components/menu_button';

const Menu = () => {
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
    

    return (<>{style && themeType && <>
        {Dimensions.width <= 720
            ? <View style={style.menu_container}>
                <MenuButton pathname="/recent" label="Recent" icon="history"/>
                <MenuButton pathname="/bookmark" label="Bookmark" icon="bookmark"/>
                <MenuButton pathname="/explore" label="Explore" icon="compass"/>
                <MenuButton pathname="/setting" label="Setting" icon="cog"/>
            </View>
            : <></>
        }
        
    </>}</>);
}

export default Menu;
