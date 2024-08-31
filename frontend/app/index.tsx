import React from 'react';
import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
const Index = () => {
    return (<SafeAreaView>
        <Link href="/play">Go to Play</Link>
    </SafeAreaView>);
}

export default Index;
