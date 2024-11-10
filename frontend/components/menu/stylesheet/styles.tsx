import { StyleSheet } from "react-native";
import Theme from "@/constants/theme";

export const __styles:any = (theme_type:string,Dimensions:any) => {
    return StyleSheet.create({
        menu_container: {
            bottom: 0,
            left:0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height:"auto",
            
            borderColor: Theme[theme_type].border_color,
        },
        menu_box:{
            flex:1,
            display:"flex",
            flexDirection:"column",
            gap: 18,
            alignItems:"center",
            paddingHorizontal: Dimensions.width*0.005,
            paddingVertical: 12,
        },
        header_text:{
            color: Theme[theme_type].text_color,
            fontSize: ((Dimensions.width+Dimensions.height)/2)*0.0275,
            fontFamily: "roboto-bold",
            height:"auto",  
            textDecorationLine: "underline",
            
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
            fontSize: ((Dimensions.width+Dimensions.height)/2)*0.02,
            fontFamily: "roboto-light",
            height:"auto",
        }
    })}