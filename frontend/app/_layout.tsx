import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState, useContext, createContext, memo } from 'react';
import { useWindowDimensions, View, Text, Pressable } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Menu from '@/components/menu/menu';
import Storage from '@/constants/module/storage';
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
  const [widgetContext, setWidgetContext]:any = useState({state:false,component:null})


  const MemoMenu = memo(Menu)



  const [loaded, error] = useFonts({
    SpaceMono: require('@/assets/fonts/SpaceMono-Regular.ttf'),
    "roboto-black": require('@/assets/fonts/Roboto-Black.ttf'),
    "roboto-bold": require('@/assets/fonts/Roboto-Bold.ttf'),
    "roboto-light": require('@/assets/fonts/Roboto-Light.ttf'),
    "roboto-medium": require('@/assets/fonts/Roboto-Medium.ttf'),
    "roboto-regular": require('@/assets/fonts/Roboto-Regular.ttf'),
    "roboto-thin": require('@/assets/fonts/Roboto-Thin.ttf'),

  });

  useEffect(() => {
    if (loaded) {
      (async ()=>{

        const THEME = await Storage.get("theme")
        if (!THEME) await Storage.store("theme","DARK_GREEN")
        setThemeTypeContext(`${await Storage.get("theme")}`)

        const API_BASE:any = await Storage.get("CUSTOM_API_BASE") || process.env.EXPO_PUBLIC_DEFAULT_API_BASE
        await Storage.store("IN_USE_API_BASE", API_BASE)
        
        setApiBaseContext(API_BASE)
        


        SplashScreen.hideAsync();

      })()
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (<>{loaded && themeTypeContext && apiBaseContext && <>
    <SafeAreaView style={{flex:1,backgroundColor:Theme[themeTypeContext].background_color}}>
      <CONTEXT.Provider value={{
          themeTypeContext, setThemeTypeContext, 
          showMenuContext, setShowMenuContext, 
          apiBaseContext, setApiBaseContext,
          widgetContext, setWidgetContext,
        }}>
        <View style={{width:"100%",height:"100%",backgroundColor: Theme[themeTypeContext].background_color}}>
          
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              {widgetContext.state &&
                <View style={{
                  width:"100%",
                  height:"100%",
                  position:"absolute",
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  display:"flex",
                  justifyContent:"center",
                  alignItems:"center",
                  zIndex:1,
                  padding:15,
                }}
                
                ><widgetContext.component/></View>
              }
              <View style={{
                  position:"absolute",
                  width:"100%",
                  height:"100%",
                  display: 'flex', 
                  flex: 1, 
                  flexDirection: Dimensions.width <= 720 ? 'column' : 'row-reverse',                 
                  zIndex:0,
                }}>
                  
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="+not-found" />
                  
                </Stack>
                
                {showMenuContext && <MemoMenu/>}
              </View>
          </ThemeProvider>
          
        </View>
      </CONTEXT.Provider>
    </SafeAreaView>
  </>}</>);
}
