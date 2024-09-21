import React, { useEffect, useState, useCallback, useContext } from 'react';
import { Link } from 'expo-router';
import { Image } from 'expo-image';
import { StyleSheet, View, useWindowDimensions, ScrollView, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon, MD3Colors, Button, Text } from 'react-native-paper';
import Theme from '@/constants/theme';
import { __styles } from '../stylesheet/show_styles';

import { CONTEXT } from '@/constants/module/context';
import { get_list } from '@/app/explore/module/content'

import Storage from '@/constants/module/storage';
import CloudflareTurnstile from '@/components/cloudflare_turnstile';


const Show = () => {
    const {showMenuContext, setShowMenuContext}:any = useContext(CONTEXT)
    const {themeTypeContext, setThemeTypeContext}:any = useContext(CONTEXT)
    const {apiBaseContext, setApiBaseContext}:any = useContext(CONTEXT)
    const {widgetContext, setWidgetContext}:any = useContext(CONTEXT)
    
    
    return (<>
        
    </>);
}

export default Show;

{/* <Link href="/play">Go to Play</Link> */}