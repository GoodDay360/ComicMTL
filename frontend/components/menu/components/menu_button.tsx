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
        <View style={style.menu_button_box}>
            {current_pathname === pathname 
                ? <TouchableRipple
                    rippleColor={Theme[themeTypeContext].ripple_color_outlined}
                    onPress={() => {
                        
                        router.push(pathname)
                    }}
                    
                    style={style.selected_menu_button}
                >

                    <Icon source={icon} size={((Dimensions.width+Dimensions.height)/2)*0.035} color={Theme[themeTypeContext].icon_color}/>
                
                </TouchableRipple>
                : <>
                    <TouchableRipple
                        rippleColor={Theme[themeTypeContext].ripple_color_outlined}
                        onPress={() => {
                            
                            router.push(pathname)
                        }}
                        
                        style={style.menu_button}
                        
                    >
                        <View
                            style={{
                                display:"flex",
                                alignItems:"center",
                                justifyContent:"center",
                                gap:8,
                                width:"100%",
                                height:"100%",
                            }}
                        >
                            <Icon source={icon} size={((Dimensions.width+Dimensions.height)/2)*0.035} color={Theme[themeTypeContext].icon_color}/>
                            <Text selectable={false} style={style.menu_button_text}>{label}</Text>
                        </View>
                    </TouchableRipple>
                    
                </>
            }
            
        </View>


    </>}</>);
}

export default MenuButton;
