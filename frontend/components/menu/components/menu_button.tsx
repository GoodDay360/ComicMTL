import React, { useEffect, useState, useContext } from 'react';
import { Link, router, usePathname } from 'expo-router';
import { StyleSheet} from 'react-native';
import { __styles } from '../stylesheet/styles';
import storage from '@/constants/module/storage';
import { Icon, MD3Colors, Button, Text } from 'react-native-paper';
import Theme from '@/constants/theme';
import {useWindowDimensions} from 'react-native';
import { CONTEXT } from '@/constants/module/context';
import { View } from 'moti';

const MenuButton = ({pathname, label, icon}:any) => {
    const [style, setStyle]:any = useState("")
    const {themeTypeContext, setThemeTypeContext}:any = useContext(CONTEXT)
    const Dimensions = useWindowDimensions();
    const current_pathname = usePathname();

    useEffect(() => { 
        (async ()=>{
            setStyle(__styles(themeTypeContext,Dimensions))
        })()
    },[])


    return (<>{style && <>
        <View style={style.menu_button_box}
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
            {current_pathname === pathname 
                ? <Button
                    onPress={() => {router.navigate(pathname)}}
                    mode={"contained"}
                    style={style.selected_menu_button}
                >

                    <Icon source={icon} size={Dimensions.width*0.045} color={Theme[themeTypeContext].icon_color}/>
                
                </Button>
                : <><Button
                    onPress={() => {router.navigate(pathname)}}
                    mode={"outlined"}
                    style={style.menu_button}
                    
                >
                    <Icon source={icon} size={Dimensions.width*0.045} color={Theme[themeTypeContext].icon_color}/>
                    
                </Button><Text style={style.menu_button_text}>{label}</Text></>
            }
            
        </View>


    </>}</>);
}

export default MenuButton;
