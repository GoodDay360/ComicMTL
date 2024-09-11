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


    return (<>{(style && themeType) && <View style={style.menu_button_box}>
            {current_pathname === pathname 
                ? <Button
                    onPress={() => {router.navigate(pathname)}}
                    mode={"contained"}
                    style={style.selected_menu_button}
                >

                    <Icon source={icon} size={Dimensions.width*0.045} color={Theme[themeType].icon_color}/>
                
                </Button>
                : <><Button
                    onPress={() => {router.navigate(pathname)}}
                    mode={"outlined"}
                    style={style.menu_button}
                    
                >
                    <Icon source={icon} size={Dimensions.width*0.045} color={Theme[themeType].icon_color}/>
                    
                </Button><Text style={style.menu_button_text}>{label}</Text></>
            }
            
    </View>}</>);
}

export default MenuButton;
