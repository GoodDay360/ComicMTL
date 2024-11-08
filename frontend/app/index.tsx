import React, { useEffect } from 'react';
import { Link, router, usePathname, Router, Redirect } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Platform } from 'react-native';


const Index = () => {
    const pathname = usePathname()

    if (pathname === "/" || pathname === "") return (
        <Redirect href="/read/colamanga/manga-kp086237/1313/" />
    )

}

export default Index;
