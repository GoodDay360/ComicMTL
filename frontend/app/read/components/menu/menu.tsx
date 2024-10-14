import React, { useEffect, useState } from 'react';
import { Link, usePathname } from 'expo-router';
import { StyleSheet, View} from 'react-native';
import { __styles } from './stylesheet/styles';
import storage from '@/constants/module/storage';
import { Icon, MD3Colors, Button } from 'react-native-paper';
import Theme from '@/constants/theme';
import {useWindowDimensions} from 'react-native';
import MenuButton from './components/menu_button';

const Menu = ({showOptions,setShowOptions}:any) => {
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
            ? <View
                style={style.menu_container}
            >
                <MenuButton showOptions={showOptions} identifier="comments" label="Comments" icon="chat" 
                    onPress={()=>{
                        setShowOptions({...showOptions,type:"comments"})
                    }}
                />
                <MenuButton showOptions={showOptions} identifier="general" label="General" icon="cog" 
                    onPress={()=>{
                        setShowOptions({...showOptions,type:"general"})
                    }}
                />
            </View>
            : <></>
        }
        
    </>}</>);
}

export default Menu;
