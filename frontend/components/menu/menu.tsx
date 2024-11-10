import React, { useEffect, useState, useContext, useCallback } from 'react';
import { Link, usePathname, useFocusEffect } from 'expo-router';
import { StyleSheet, View} from 'react-native';
import { __styles } from './stylesheet/styles';
import storage from '@/constants/module/storages/storage';
import { Icon, MD3Colors, Button, Text, TouchableRipple } from 'react-native-paper';
import Theme from '@/constants/theme';
import {useWindowDimensions} from 'react-native';
import MenuButton from './components/menu_button';

import { CONTEXT } from '@/constants/module/context';
import Storage from '@/constants/module/storages/storage';

const Menu = () => {
    const [style, setStyle]:any = useState("")
    const {themeTypeContext, setThemeTypeContext}:any = useContext(CONTEXT)
    const [showMenuContext,setShowMenuContext]:any = useState(true)

    const Dimensions = useWindowDimensions();

    useFocusEffect(useCallback(() => {
        (async ()=>{
            const MENU_STATE = await Storage.get("MENU_STATE")
            if (MENU_STATE === null || MENU_STATE === undefined) setShowMenuContext(true)
            else setShowMenuContext(MENU_STATE)
            
        })()
        return () => {
                
        }
    },[]))
    

    useEffect(() => { 
        (async ()=>{
            console.log(showMenuContext)
            setStyle(__styles(themeTypeContext,Dimensions))
        })()
    },[])
    

    return (<>{style && <>
        <View
            style={{
                ...style.menu_container,
                position: showMenuContext ? "relative" : "absolute",
                height: showMenuContext ? "100%" : "auto",
                backgroundColor: showMenuContext? Theme[themeTypeContext].background_color : "transparent",
                marginBottom: showMenuContext ? 0 : Dimensions.height*0.015,
                borderRightWidth: showMenuContext ? 0.5 : 0,
                
            }}
        >
            
            <>{showMenuContext && 
                <>
                    <View
                        style={{
                            paddingVertical: showMenuContext ? 12 : 18,
                            width:"100%",
                            height:"auto",
                            display:"flex",
                            justifyContent:"center",
                            alignItems:"center",
                            borderBottomWidth: 0.5,
                            borderColor: Theme[themeTypeContext].border_color,
                        }}
                    >
                        <Text style={style.header_text}>Menu</Text>
                    </View>
                    <View
                        style={style.menu_box}
                    >
                        <MenuButton pathname="/recent" label="Recent" icon="history"/>
                        <MenuButton pathname="/bookmark" label="Bookmark" icon="bookmark"/>
                        <MenuButton pathname="/explore" label="Explore" icon="compass"/>
                        <MenuButton pathname="/setting" label="Setting" icon="cog"/>
                    </View>
                </>
            }</>

            <TouchableRipple
                rippleColor={Theme[themeTypeContext].ripple_color_outlined}
                onPress={async () => {
                    await Storage.store("MENU_STATE", !showMenuContext)
                    setShowMenuContext(!showMenuContext)
                }}
                
                style={{
                    backgroundColor: showMenuContext ? Theme[themeTypeContext].background_color : Theme[themeTypeContext].button_color,
                    borderTopRightRadius: showMenuContext ? 0 : ((Dimensions.height+Dimensions.width)/2)*0.015,
                    borderBottomRightRadius: showMenuContext ? 0 : ((Dimensions.height+Dimensions.width)/2)*0.015,
                    padding:8,
                    height:"auto",
                    width:"auto",
                    paddingVertical: showMenuContext ? 12 : 18,
                    justifyContent:"center",
                    alignItems:"center",

                    borderRightWidth: showMenuContext ? 0 : 0.5,
                    borderBottomWidth: showMenuContext ? 0 : 0.5,
                    borderTopWidth: showMenuContext ? 0.5 : 0.5,
                    
                    borderColor: Theme[themeTypeContext].border_color,
                }}
            >

                <Icon source={showMenuContext ? "chevron-left" : "chevron-right"} size={((Dimensions.width+Dimensions.height)/2)*0.0375} color={Theme[themeTypeContext].icon_color}/>
            
            </TouchableRipple>
            
        </View>
        
        
    </>}</>);
}

export default Menu;
