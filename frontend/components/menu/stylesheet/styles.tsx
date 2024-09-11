import { StyleSheet } from "react-native";
import Theme from "@/constants/theme";

export const __styles:any = (theme_type:string,Dimensions:any) => {
    return StyleSheet.create({
        menu_container: {
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
            width: "100%",
            height: "auto",
            backgroundColor: Theme[theme_type].background_color,
            paddingLeft: 8,paddingRight:8,
        },
        
        current_menu_button: {
            backgroundColor: Theme[theme_type].button_color
        },
        menu_button: {
            borderRadius: 0,
            borderWidth: 0,
        },
        menu_button_box:{
            display:"flex",
            alignItems:"center",
            gap:4,
        },
        menu_button_text: {
            color: Theme[theme_type].text_color,
            fontSize: Dimensions.width*0.025,
            height:Dimensions.width*0.03,
        }
    })}