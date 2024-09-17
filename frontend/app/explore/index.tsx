import React, { useEffect, useState, useCallback, useContext, memo } from 'react';
import { Link } from 'expo-router';
import { Image } from 'expo-image';
import { StyleSheet, View, useWindowDimensions, ScrollView, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon, MD3Colors, Button, Text } from 'react-native-paper';
import Theme from '@/constants/theme';
import { __styles } from './stylesheet/styles';

import { CONTEXT } from '@/constants/module/context';
import { get_list } from '@/app/explore/module/content'
import ShowList from './components/show_list';

import Storage from '@/constants/module/storage';
import CloudflareTurnstile from '@/components/cloudflare_turnstile';


const Explore = () => {

    const [itemSelectedId, setItemSelectedId]:any = useState("")
    const [showCloudflareTurnstile, setShowCloudflareTurnstile]:any = useState(false)

    const {themeTypeContext, setThemeTypeContext}:any = useContext(CONTEXT)
    
    return (<>

        
        {showCloudflareTurnstile 
            ? <View style={{width:"100%",height:"100%",display:"flex",justifyContent:"center",alignItems:"center",backgroundColor:Theme[themeTypeContext].background_color}}>
                <CloudflareTurnstile 
                    callback={() => {
                        setShowCloudflareTurnstile(false)
                }} />
            </View>
            : <ShowList showCloudflareTurnstile={showCloudflareTurnstile} setShowCloudflareTurnstile={setShowCloudflareTurnstile} itemSelected={itemSelectedId} setItemSelected={setItemSelectedId} />
        }
    </>);
}

export default Explore;

{/* <Link href="/play">Go to Play</Link> */}