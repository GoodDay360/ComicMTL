import { StyleSheet } from "react-native";
import Theme from "@/constants/theme";

export const __styles:any = (theme_type:string,Dimensions:any) => {
    return StyleSheet.create({
        screen_container: {
            display: "flex",
            width: "100%",
            height: "100%",
            backgroundColor: Theme[theme_type].background_color,
        },
        header_container: {
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 15,
            paddingVertical:10,
            backgroundColor: Theme[theme_type].background_color,
            borderBottomWidth: 0.5,
            borderColor: Theme[theme_type].border_color,
        },
        header_text:{
            fontFamily: "roboto-medium",
            fontSize: ((Dimensions.width+Dimensions.height)/2)*0.04,
            color: Theme[theme_type].text_color,
            
        },

        item_box:{
            display:"flex",
            flexDirection:"column",
            alignItems:"center",
            gap:15,
            height:"auto",
            width:Math.max(((Dimensions.width+Dimensions.height)/2)*0.225,100),
            borderRadius:8,
            
        },
        item_cover:{
            width:"100%",
            height:Math.max(((Dimensions.width+Dimensions.height)/2)*0.325,125),
            borderRadius:8,
            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 1,
            },
            shadowOpacity: 0.22,
            shadowRadius: 2.22,

            elevation: 3,
        },
        item_title:{
            color: Theme[theme_type].text_color,
            fontFamily: "roboto-medium",
            fontSize: ((Dimensions.width+Dimensions.height)/2)*0.025,
            width:"100%",
            height:"auto",
            textAlign:"center",
            flexShrink:1,
        }
    })}