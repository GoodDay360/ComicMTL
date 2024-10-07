import React, { useEffect } from 'react';
import { Link, router, usePathname, useRouter, Redirect } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Menu from '@/components/menu/menu';



const Index = () => {
    const router = useRouter()
    const pathname = usePathname()
    
    if (pathname === "/" || pathname === "") return (
        <Redirect href="/explore" />
    )

}

export default Index;
