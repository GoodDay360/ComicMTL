import { StyleSheet } from "react-native";
import Theme from "@/constants/theme";

export const __styles:any = (theme_type:string,Dimensions:any) => {
    return StyleSheet.create({
        screen_container: {
            width: "100%",
            height: "100%",
            backgroundColor: Theme[theme_type].background_color,
        },
        header_container: {
            padding: 15,
            backgroundColor: Theme[theme_type].background_color,
            borderBottomWidth: 0.5,
            borderColor: Theme[theme_type].border_color,
        },
        header_text:{
            fontFamily: "roboto-medium",
            fontSize: Dimensions.width*0.05,
            color: Theme[theme_type].text_color,
        },
        body_container: {
            backgroundColor: Theme[theme_type].background_color,
        }
        
    })}