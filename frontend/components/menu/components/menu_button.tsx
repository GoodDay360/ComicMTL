import React, { useEffect, useState } from 'react';
import { Link, router, usePathname } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { __styles } from '../stylesheet/styles';
import storage from '@/constants/module/storage';
import { Icon, MD3Colors, Button, Text } from 'react-native-paper';
import Theme from '@/constants/theme';
import {useWindowDimensions} from 'react-native';


const MenuButton = ({pathname, label, icon}:any) => {
    const [style, setStyle]:any = useState("")
    const [themeType, setThemeType]:any = useState("")
    const Dimensions = useWindowDimensions();
    const current_pathname = usePathname();

    useEffect(() => { 
        (async ()=>{
            const theme_type = await storage.get("theme") || "DARK_GREEN"
            setThemeType(theme_type)
            setStyle(__styles(theme_type,Dimensions))
        })()
    },[])
    

    return (<>{style && themeType && <>
            <Button
                onPress={() => {router.navigate(pathname)}}
                mode={current_pathname === pathname ? "contained": "outlined"}
                style={current_pathname === pathname ? style.current_menu_button : style.menu_button}
            >
                <View style={current_pathname !== pathname ? style.menu_button_box : {}}>
                    <Icon source={icon} size={Dimensions.width*0.05} color={Theme[themeType].icon_color}/>
                    {current_pathname !== pathname && <>
                        <Text style={style.menu_button_text}>{label}</Text>
                    </>}
                </View>
            </Button>
            
            
    </>}</>);
}

export default MenuButton;
