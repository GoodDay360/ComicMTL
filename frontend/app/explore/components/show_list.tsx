import React, { useEffect, useState, useCallback, useContext, useRef } from 'react';
import { Link } from 'expo-router';
import { Image } from 'expo-image';
import { StyleSheet, View, useWindowDimensions, ScrollView, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon, MD3Colors, Button, Text } from 'react-native-paper';
import Theme from '@/constants/theme';
import { __styles } from '../stylesheet/styles';
import storage from '@/constants/module/storage';
import { CONTEXT } from '@/constants/module/context';
import { get_list } from '@/app/explore/module/content'

const ShowList = ({itemSelected,setItemSelected}:any) => {
    const {showMenuContext, setShowMenuContext}:any = useContext(CONTEXT)
    const {themeTypeContext, setThemeTypeContext}:any = useContext(CONTEXT)
    const {apiBaseContext, setApiBaseContext}:any = useContext(CONTEXT)
    
    const [style, setStyle]:any = useState("")
    const Dimensions = useWindowDimensions();

    const [CONTENT, SET_CONTENT]:any = useState([])
    const [refreshing, setRefreshing] = useState(false);
    const scrollOffset = useRef(0);

    useEffect(() => { 
        (async ()=>{
            setStyle(__styles(themeTypeContext,Dimensions))
            // setShowMenuContext(false)
        })()
    },[])

    useEffect(() => {
        if (!(style && themeTypeContext && apiBaseContext)) return
        get_list(SET_CONTENT,apiBaseContext)
    },[style])

    const onRefresh = useCallback(() => {
        
    },[])
    const onScroll = useCallback((event:any) => {
        const nativeEvent = event.nativeEvent
        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
        var currentOffset = event.nativeEvent.contentOffset.y;
        var direction = currentOffset > scrollOffset.current ? 'down' : 'up';
        scrollOffset.current = currentOffset;
        if (direction === 'down') {
            if (contentOffset.y <= contentSize.height*0.025) {
                setShowMenuContext(true)
            }else{
                setShowMenuContext(false)
            }
        }
        else {
            
            if (layoutMeasurement.height + contentOffset.y >= (contentSize.height - contentSize.height*0.025)) {
                setShowMenuContext(false)
            }else{
                setShowMenuContext(true)
            }
        }
        
    },[])


    return (<>{style && 
    <ScrollView style={style.screen_container}
        refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onScroll={(event) => {onScroll(event)}}
        scrollEventThrottle={16}
    >

        <View style={style.header_container}>
            <Text style={style.header_text}>Explore</Text>
            <Button mode={"outlined"} style={style.header_search_button}
                onPress={() => {}}
            >
                <Icon source={"magnify"} size={Dimensions.width*0.06} color={Theme[themeTypeContext].icon_color}/>
            </Button>
            
        </View>
        
        <View style={style.body_container}>

            {CONTENT.map((item:any,index:number)=>(
                <Pressable key={index}
                    onPress={() => {setItemSelected(item.id)}}
                >
                    <View style={style.item_box}>
                        <Image source={{uri:`${apiBaseContext}${item.cover}`}} style={style.item_cover}
                            contentFit="cover" transition={1000}
                        />
                        <Text style={style.item_title}>{item.title}</Text>
                    </View>
                </Pressable>
            ))}

        </View>

    </ScrollView>}</>);
}

export default ShowList;

{/* <Link href="/play">Go to Play</Link> */}