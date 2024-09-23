import React, { useEffect, useState, useCallback, useContext, memo } from 'react';
import { Link, useFocusEffect } from 'expo-router';
import { Image } from 'expo-image';
import { StyleSheet, View, useWindowDimensions, ScrollView, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon, MD3Colors, Button, Text } from 'react-native-paper';
import Theme from '@/constants/theme';

import { CONTEXT } from '@/constants/module/context';
import { get_list } from '@/app/explore/module/content'
import ShowList from './components/show_list';

import Storage from '@/constants/module/storage';



const Explore = () => {

    
    
    const [isFocus,setIsFocus]:any = useState(false)
    const {themeTypeContext, setThemeTypeContext}:any = useContext(CONTEXT)
    
    
    useFocusEffect(useCallback(() => {
        setIsFocus(true)
        return () => {
            setIsFocus(false)
        }
    },[]))

    return (<>{isFocus
        ? <ShowList/>
        
        : <></>}</>
    )
}

export default Explore;

