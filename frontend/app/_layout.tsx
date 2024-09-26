
import { useFonts } from 'expo-font';
import { Stack, router, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState, useContext, createContext, memo } from 'react';
import { useWindowDimensions, View, Text, Pressable } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Menu from '@/components/menu/menu';
import Storage from '@/constants/module/storage';
import { useColorScheme } from '@/hooks/useColorScheme';
import Toast, { SuccessToast } from 'react-native-toast-message';
import type { BaseToastProps } from 'react-native-toast-message';
import { BaseToast, ErrorToast, InfoToast } from 'react-native-toast-message';
import { AnimatePresence } from 'moti';

import CloudflareTurnstile from '@/components/cloudflare_turnstile';
import Theme from '@/constants/theme';
import { CONTEXT } from '@/constants/module/context';

// Prevent the splash screen from auto-hiding before asset loading is complete.

const toastConfig = {
  success: (props: BaseToastProps) => (
    <SuccessToast  {...props} text2NumberOfLines={3} 

    />
  ),

  error: (props: BaseToastProps) => (
    <ErrorToast {...props} text2NumberOfLines={3} />
  ),

  info: (props: BaseToastProps) => (
    <InfoToast {...props} text2NumberOfLines={8} text1NumberOfLines={8}
      style={{
        maxWidth:"90%",
        width:"auto",
        height:"auto",
        
        padding:0,
        paddingTop:12, paddingBottom:12,
        borderLeftColor:"cyan"
      }}
    />
  ),
};


SplashScreen.preventAutoHideAsync();
export default function RootLayout() {
  const pathname = usePathname()
  const Dimensions = useWindowDimensions();
  const [showMenuContext,setShowMenuContext]:any = useState(true)
  const [themeTypeContext,setThemeTypeContext]:any = useState("")
  const [apiBaseContext, setApiBaseContext]:any = useState("")
  const [socketBaseContext, setSocketBaseContext]:any = useState("")
  const [widgetContext, setWidgetContext]:any = useState({state:false,component:null})
  const [showCloudflareTurnstileContext, setShowCloudflareTurnstileContext]:any = useState(false)

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
        
        const SOCKET_BASE:any = await Storage.get("CUSTOM_SOCKET_BASE") || process.env.EXPO_PUBLIC_DEFAULT_SOCKET_BASE
        await Storage.store("IN_USE_SOCKET_BASE", SOCKET_BASE)
        setSocketBaseContext(SOCKET_BASE)


        SplashScreen.hideAsync();

      })()
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (<>{loaded && themeTypeContext && apiBaseContext && socketBaseContext && <>
    <SafeAreaView style={{flex:1,backgroundColor:Theme[themeTypeContext].background_color}}>
      <CONTEXT.Provider value={{
          themeTypeContext, setThemeTypeContext, 
          showMenuContext, setShowMenuContext, 
          apiBaseContext, setApiBaseContext,
          socketBaseContext, setSocketBaseContext,
          widgetContext, setWidgetContext,
          showCloudflareTurnstileContext, setShowCloudflareTurnstileContext,
        }}>
          <View style={{width:"100%",height:"100%",backgroundColor: Theme[themeTypeContext].background_color}}>
            {showCloudflareTurnstileContext
                ? <View style={{position:"absolute",width:"100%",height:"100%",display:"flex",justifyContent:"center",alignItems:"center",backgroundColor:Theme[themeTypeContext].background_color}}>
                    <CloudflareTurnstile 
                        callback={() => {
                            setShowCloudflareTurnstileContext(false)
                            
                    }} />
                </View>
                : <>
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
                        
                      }}>
                        
                        <Stack screenOptions={{ headerShown: false}}>
                          <Stack.Screen name="index" />
                          
                          <Stack.Screen name="+not-found" />
                        </Stack>
                      
                      {showMenuContext && <MemoMenu/>}
                  </View>
                </>
            }
            
          
          </View>
          <Toast  config={toastConfig} />
      </CONTEXT.Provider>
    </SafeAreaView>
  </>}</>);
}
