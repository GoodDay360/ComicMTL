import { StyleSheet } from "react-native";
import Theme from "@/constants/theme";

export const __styles:any = (theme_type:string,Dimensions:any) => {
    return StyleSheet.create({
        menu_container: {
            position: "absolute",
            bottom: 0,
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
            width: "100%",
            backgroundColor: Theme[theme_type].background_color,
            padding: 8,
            borderTopWidth: 0.5,
            borderColor: Theme[theme_type].border_color,
        },
        menu_button_box:{
            display:"flex",
            alignItems:"center",
        },
        selected_menu_button: {
            backgroundColor: Theme[theme_type].button_color,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 12,
            
        },
        menu_button: {
            borderWidth: 0,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 12,
        },
        
        menu_button_text: {
            color: Theme[theme_type].text_color,
            fontSize: ((Dimensions.width+Dimensions.height)/2)*0.028,
            height:"auto",
        }
    })}