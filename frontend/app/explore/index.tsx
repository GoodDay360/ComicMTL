import React, { useEffect, useState, useCallback, useContext } from 'react';
import { Link } from 'expo-router';
import { Image } from 'expo-image';
import { StyleSheet, View, useWindowDimensions, ScrollView, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon, MD3Colors, Button, Text } from 'react-native-paper';
import Theme from '@/constants/theme';
import { __styles } from './stylesheet/styles';
import storage from '@/constants/module/storage';
import { CONTEXT } from '@/constants/module/context';
import { get_list } from '@/app/explore/module/content'
import ShowList from './components/show_list';


const Explore = () => {
    const [itemSelectedId, setItemSelectedId]:any = useState("")


    return (<>
        <ShowList itemSelected={itemSelectedId} setItemSelected={setItemSelectedId} />
    </>);
}

export default Explore;

{/* <Link href="/play">Go to Play</Link> */}