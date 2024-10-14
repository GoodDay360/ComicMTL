import React, { useEffect, useState, useContext } from 'react';
import { Link, router, usePathname } from 'expo-router';
import { StyleSheet} from 'react-native';
import { __styles } from '../stylesheet/styles';
import storage from '@/constants/module/storage';
import { Icon, MD3Colors, Button, Text, TouchableRipple } from 'react-native-paper';
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
        <View style={style.menu_button_box} key={pathname}
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
                ? <TouchableRipple
                    rippleColor={Theme[themeTypeContext].ripple_color_outlined}
                    onPress={() => {
                        
                        router.push(pathname)
                    }}
                    
                    style={style.selected_menu_button}
                >

                    <Icon source={icon} size={((Dimensions.width+Dimensions.height)/2)*0.045} color={Theme[themeTypeContext].icon_color}/>
                
                </TouchableRipple>
                : <><TouchableRipple
                    rippleColor={Theme[themeTypeContext].ripple_color_outlined}
                    onPress={() => {
                        
                        router.push(pathname)
                    }}
                    
                    style={style.menu_button}
                    
                >
                    <Icon source={icon} size={((Dimensions.width+Dimensions.height)/2)*0.045} color={Theme[themeTypeContext].icon_color}/>
                    
                </TouchableRipple><Text style={style.menu_button_text}>{label}</Text></>
            }
            
        </View>


    </>}</>);
}

export default MenuButton;
