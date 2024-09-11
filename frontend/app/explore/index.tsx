import React, { useEffect, useState } from 'react';
import { Link } from 'expo-router';
import { Image } from 'expo-image';
import { StyleSheet, View, useWindowDimensions, ScrollView} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon, MD3Colors, Button, Text } from 'react-native-paper';
import Theme from '@/constants/theme';
import { __styles } from './stylesheet/styles';
import storage from '@/constants/module/storage';

import { get_list } from '@/app/explore/module/content'

const Explore = () => {
    const [style, setStyle]:any = useState("")
    const [themeType, setThemeType]:any = useState("")
    const Dimensions = useWindowDimensions();
    const [API_BASE, SET_API_BASE]:any = useState("")

    const [CONTENT, SET_CONTENT]:any = useState([])
    

    useEffect(() => { 
        (async ()=>{
            const api_base:any = await storage.get("API_BASE")
            SET_API_BASE(api_base)
            const theme_type:any = await storage.get("theme") || "DARK_GREEN"
            setThemeType(theme_type)
            setStyle(__styles(theme_type,Dimensions))
        })()
    },[])

    useEffect(() => {
        if (!(style && themeType && API_BASE)) return
        get_list(SET_CONTENT,API_BASE)
    },[style, themeType, API_BASE])

    return (<>{style && themeType && API_BASE && <View style={style.screen_container}>

        <View style={style.header_container}>
            <Text style={style.header_text}>Explore</Text>
            <Button mode={"outlined"} style={style.header_search_button}
                onPress={() => {}}
            >
                <Icon source={"magnify"} size={Dimensions.width*0.06} color={Theme[themeType].icon_color}/>
            </Button>
            
        </View>
        
        <ScrollView style={style.body_container}>

            {CONTENT.map((item:any,index:number)=>(
                <Image key={index} source={{uri:`${API_BASE}${item.cover}`}} style={{width:"100%",height:Dimensions.height*0.5}}
                    contentFit="cover" transition={1000}
                />
            ))}
            

        </ScrollView>

    </View>}</>);
}

export default Explore;

{/* <Link href="/play">Go to Play</Link> */}