import React, { useEffect, useState, useCallback, useContext, useRef } from 'react';
import { Platform, useWindowDimensions } from 'react-native';

import { Icon, MD3Colors, Button, Text, TextInput, TouchableRipple, ActivityIndicator } from 'react-native-paper';
import { View, AnimatePresence } from 'moti';
import Toast from 'react-native-toast-message';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';


import Theme from '@/constants/theme';
import Dropdown from '@/components/dropdown';
import { CONTEXT } from '@/constants/module/context';
import Storage from '@/constants/module/storages/storage';
import ComicStorage from '@/constants/module/storages/comic_storage';
import ImageCacheStorage from '@/constants/module/storages/image_cache_storage';
import ChapterStorage from '@/constants/module/storages/chapter_storage';

export const PageNavigationWidget = ({setPage}:any) =>{
    const Dimensions = useWindowDimensions();

    const {themeTypeContext, setThemeTypeContext}:any = useContext(CONTEXT)
    const {widgetContext, setWidgetContext}:any = useContext(CONTEXT)

    const [goToPage, setGoToPage] = useState("");
    const [_feedBack, _setFeedBack] = useState("");

    return (<View 
        style={{
            backgroundColor:Theme[themeTypeContext].background_color,
            maxWidth:500,
            width:"100%",
            
            borderColor:Theme[themeTypeContext].border_color,
            borderWidth:2,
            borderRadius:8,
            padding:12,
            display:"flex",
            justifyContent:"center",
            
            flexDirection:"column",
            gap:12,
        }}
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
        <View style={{height:"auto"}}>
            <TextInput mode="outlined" label="Go to page"  textColor={Theme[themeTypeContext].text_color} maxLength={1000000000}
                placeholder="Go to page"
                style={{
                    
                    backgroundColor:Theme[themeTypeContext].background_color,
                    borderColor:Theme[themeTypeContext].border_color,
                    
                }}
                outlineColor={Theme[themeTypeContext].text_input_border_color}
                value={goToPage}
                onChange={(event)=>{
                    
                    const value = event.nativeEvent.text
                    
                    const isInt = /^-?\d+$/.test(value);
                    if (isInt || value === "") {
                        _setFeedBack("")
                        setGoToPage(value)
                    }
                    else _setFeedBack("Input is not a valid number.")
                    
                }}
            />
            
        </View>
        {_feedBack 
            ? <Text 
                style={{
                    color:Theme[themeTypeContext].text_color,
                    fontFamily:"roboto-medium",
                    fontSize:(Dimensions.width+Dimensions.height)/2*0.02,
                    textAlign:"center",
                }}
                
            >{_feedBack}</Text>
            : <></>
        }
        <View 
            style={{
                display:"flex",
                flexDirection:"row",
                width:"100%",
                justifyContent:"space-around",
                alignItems:"center",
            }}
        >
            <Button mode='contained' 
                labelStyle={{
                    color:Theme[themeTypeContext].text_color,
                    fontFamily:"roboto-medium",
                    fontSize:(Dimensions.width+Dimensions.height)/2*0.02
                }} 
                style={{backgroundColor:"red",borderRadius:5}} 
                onPress={(()=>{
                    
                    setWidgetContext({state:false,component:<></>})
                    
                })}
            >Cancel</Button>
            <Button mode='contained' 
            labelStyle={{
                color:Theme[themeTypeContext].text_color,
                fontFamily:"roboto-medium",
                fontSize:(Dimensions.width+Dimensions.height)/2*0.02
            }} 
            style={{backgroundColor:"green",borderRadius:5}} 
            onPress={(()=>{
                const isInt = /^-?\d+$/.test(goToPage);
                
                if (isInt) {
                    if (!parseInt(goToPage)){
                        _setFeedBack("Page is out of index.")
                    }else{
                        setPage(parseInt(goToPage))
                        setWidgetContext({state:false,component:<></>})
                    }
                    
                }else _setFeedBack("Input is not a valid number.")
            })}
        >Go</Button>
        </View>
        
    </View>)
}