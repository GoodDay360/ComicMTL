import React, { useEffect, useState, useCallback, useContext, useRef, useMemo } from 'react';
import { Link, router, useLocalSearchParams, useNavigation, useFocusEffect } from 'expo-router';
import { Image as RNImage, StyleSheet, useWindowDimensions, ScrollView, Pressable, RefreshControl, Platform, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon, MD3Colors, Button, Text, TextInput, TouchableRipple } from 'react-native-paper';
import CircularProgress from 'react-native-circular-progress-indicator';
import { ActivityIndicator } from 'react-native-paper';
import { FlashList } from "@shopify/flash-list";
import { DiscussionEmbed } from 'disqus-react';
import { WebView } from 'react-native-webview';
import { View } from 'moti';

import { CONTEXT } from '@/constants/module/context';
import Theme from '@/constants/theme';

const Disqus = ({url,identifier,title, paddingVertical=0, paddingHorizontal=0}:any) => {
    const Dimensions = useWindowDimensions();
    const shortname = 'comicmtl';
    

    const {showMenuContext, setShowMenuContext}:any = useContext(CONTEXT)
    const {themeTypeContext, setThemeTypeContext}:any = useContext(CONTEXT)
    const {showCloudflareTurnstileContext, setShowCloudflareTurnstileContext}:any = useContext(CONTEXT)
    const {apiBaseContext, setApiBaseContext}:any = useContext(CONTEXT)

    if (Platform.OS === "web") {
        
    
        return (
            <ScrollView 
                style={{
                    flex:1,
                    paddingVertical:paddingVertical,
                    paddingHorizontal:paddingHorizontal,
                }}
            >
                <DiscussionEmbed
                    shortname={shortname}
                    config={
                        {
                            url: url,
                            identifier: identifier,
                            title: title,
                            language: 'en' //e.g. for Traditional Chinese (Taiwan)
                        }
                    }
                />
            </ScrollView>
        )
    }else{
        const [navigate_state, set_navigate_state] = useState(false);
        const [show_navigation, set_show_navigation] = useState(false);
        useEffect(() => {
            if (navigate_state) {
                set_navigate_state(false)
                set_show_navigation(false)
            }
        }, [navigate_state])

        const disqusHTML:string = `
            <!DOCTYPE html>
            <head>
                
            </head>
            <body>
                <div id="disqus_thread"></div>
                <script>
                    /**
                    *  RECOMMENDED CONFIGURATION VARIABLES: EDIT AND UNCOMMENT THE SECTION BELOW TO INSERT DYNAMIC VALUES FROM YOUR PLATFORM OR CMS.
                    *  LEARN WHY DEFINING THESE VARIABLES IS IMPORTANT: https://disqus.com/admin/universalcode/#configuration-variables    */
                    
                    var disqus_config = function () {
                        this.page.url = "${url}"; 
                        this.page.identifier = "${identifier}"; // Replace PAGE_IDENTIFIER with your page's unique identifier variable
                    };
                    
                    (function() { // DON'T EDIT BELOW THIS LINE
                        var d = document, s = d.createElement('script');
                        s.src = 'https://${shortname}.disqus.com/embed.js';
                        s.setAttribute('data-timestamp', +new Date());
                        (d.head || d.body).appendChild(s);
                    })();
                </script>
                <noscript>Please enable JavaScript to view the <a href="https://disqus.com/?ref_noscript">comments powered by Disqus.</a></noscript>
                <script id="dsq-count-scr" src="//${shortname}.disqus.com/count.js" async></script>
            </body>
        `;

        const handleNavigation = (event:any) => {
            const { url } = event;
            console.log('Request URL:', url);

            if (url.includes('disqus.com/next/login-success/#!auth%3Asuccess')){
                set_navigate_state(true)
            }else if (url !== "about:blank"){
                set_show_navigation(true)
            }
            return false; 
        };

        return (<>{!navigate_state
            ?<>
                <>{show_navigation && 
                    <View
                        style={{
                            width:"100%",
                            justifyContent:"center",
                            alignItems:"flex-start",
                            paddingVertical:8,
                            paddingHorizontal:12,
                            borderBottomWidth:2,
                            borderColor:Theme[themeTypeContext].border_color,
                        }}
                    >
                        <TouchableRipple
                            rippleColor={Theme[themeTypeContext].ripple_color_outlined}
                            style={{
                                borderRadius:5,
                                borderWidth:0,
                                backgroundColor: "transparent",
                                padding:5,
                            }}
                            
                            onPress={()=>{
                                set_navigate_state(true)
                                set_show_navigation(false)
                            }}
                        >
                            <Icon source={"arrow-left-thin"} size={((Dimensions.width+Dimensions.height)/2)*0.05} color={Theme[themeTypeContext].icon_color}/>
                        </TouchableRipple>
                    </View>
                }</>
                <View 
                    style={{
                        flex:1,
                        paddingVertical:paddingVertical,
                        paddingHorizontal:paddingHorizontal,
                    }}
                >
                    <WebView
                        style={{ 
                            flex:1,
                            backgroundColor:"transparent",
                        }}
                        originWhitelist={['*']}
                        source={{ html: disqusHTML }}
                        sharedCookiesEnabled={true}
                        setSupportMultipleWindows={false} 
                        
                        onNavigationStateChange={handleNavigation}
                        userAgent="Mozilla/5.0 (Linux; Android 4.1.1; Galaxy Nexus Build/JRO03C) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Mobile Safari/535.19"
                    />
                </View>
            </>
            :<></>
        }</>)
    }
}

export default Disqus;