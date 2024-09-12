import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState, useContext, createContext, memo } from 'react';
import { useWindowDimensions, View } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Menu from '@/components/menu/menu';
import storage from '@/constants/module/storage';
import { useColorScheme } from '@/hooks/useColorScheme';
import Theme from '@/constants/theme';
import { CONTEXT } from '@/constants/module/context';
import { AnimatePresence } from 'moti';




// Prevent the splash screen from auto-hiding before asset loading is complete.


SplashScreen.preventAutoHideAsync();
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const Dimensions = useWindowDimensions();
  const [showMenuContext,setShowMenuContext]:any = useState(true)
  const [themeTypeContext,setThemeTypeContext]:any = useState("")
  const [apiBaseContext, setApiBaseContext]:any = useState("")

  const MemoMenu = memo(Menu)

  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    "roboto-black": require('../assets/fonts/Roboto-Black.ttf'),
    "roboto-bold": require('../assets/fonts/Roboto-Bold.ttf'),
    "roboto-light": require('../assets/fonts/Roboto-Light.ttf'),
    "roboto-medium": require('../assets/fonts/Roboto-Medium.ttf'),
    "roboto-regular": require('../assets/fonts/Roboto-Regular.ttf'),
    "roboto-thin": require('../assets/fonts/Roboto-Thin.ttf'),

  });

  useEffect(() => {
    if (loaded) {
      (async ()=>{
        const THEME:any = await storage.get("theme")
        const API_BASE:any = await storage.get("API_BASE")
        if (!THEME) await storage.store("theme","DARK_GREEN")
        if (!API_BASE) await storage.store("API_BASE","http://192.168.1.102:8000")
        setThemeTypeContext(`${await storage.get("theme")}`)
        setApiBaseContext(`${await storage.get("API_BASE")}`)
        SplashScreen.hideAsync();
      })()
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (<>{loaded && themeTypeContext && apiBaseContext && <>
    <SafeAreaView style={{flex:1,backgroundColor:Theme[themeTypeContext].background_color}}>
      <CONTEXT.Provider value={{themeTypeContext, setThemeTypeContext, showMenuContext, setShowMenuContext, apiBaseContext, setApiBaseContext}}>
        <AnimatePresence>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <View style={{
                  display: 'flex', 
                  flex: 1, 
                  flexDirection: Dimensions.width <= 720 ? 'column' : 'row-reverse',
                }}>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="+not-found" />
                </Stack>
                {showMenuContext && <MemoMenu/>}
              </View>
          </ThemeProvider>
        </AnimatePresence>
      </CONTEXT.Provider>
    </SafeAreaView>
  </>}</>);
}
