import { StyleSheet } from "react-native";
import Theme from "@/constants/theme";

export const __styles:any = (theme_type:string,Dimensions:any) => {
    return StyleSheet.create({
        screen_container: {
            width: "100%",
            height: "100%",
            backgroundColor: Theme[theme_type].background_color,
        },
    })}