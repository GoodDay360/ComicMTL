import React, { useEffect, useState, useContext } from 'react';
import { Link, router, usePathname } from 'expo-router';
import { StyleSheet} from 'react-native';
import { __styles } from '../stylesheet/styles';
import storage from '@/constants/module/storages/storage';
import { Icon, MD3Colors, Button, Text, TouchableRipple } from 'react-native-paper';
import Theme from '@/constants/theme';
import {useWindowDimensions} from 'react-native';
import { CONTEXT } from '@/constants/module/context';
import { View } from 'moti';

const MenuButton = ({showOptions, identifier, label, icon, onPress}:any) => {
    const [style, setStyle]:any = useState("")
    const {themeTypeContext, setThemeTypeContext}:any = useContext(CONTEXT)
    const Dimensions = useWindowDimensions();


    useEffect(() => { 
        (async ()=>{
            setStyle(__styles(themeTypeContext,Dimensions))
        })()
    },[])


    return (<>{style && <>
        <View style={style.menu_button_box} key={identifier}
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
            {showOptions.type === identifier
                ? <TouchableRipple
                    rippleColor={Theme[themeTypeContext].ripple_color_outlined}
                    onPress={onPress}
                    
                    style={style.selected_menu_button}
                >

                    <Icon source={icon} size={((Dimensions.width+Dimensions.height)/2)*0.035} color={Theme[themeTypeContext].icon_color}/>
                
                </TouchableRipple>
                : <><TouchableRipple
                    rippleColor={Theme[themeTypeContext].ripple_color_outlined}
                    onPress={onPress}
                    
                    style={style.menu_button}
                    
                >
                    <Icon source={icon} size={((Dimensions.width+Dimensions.height)/2)*0.035} color={Theme[themeTypeContext].icon_color}/>
                    
                </TouchableRipple><Text style={style.menu_button_text}>{label}</Text></>
            }
            
        </View>


    </>}</>);
}

export default MenuButton;
