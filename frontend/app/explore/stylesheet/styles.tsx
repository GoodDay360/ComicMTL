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
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 15,paddingTop: 10,paddingBottom: 10,
            backgroundColor: Theme[theme_type].background_color,
            borderBottomWidth: 0.5,
            borderColor: Theme[theme_type].border_color,
        },
        header_text:{
            fontFamily: "roboto-medium",
            fontSize: Dimensions.width*0.05,
            color: Theme[theme_type].text_color,
            
        },
        header_search_button:{
            borderWidth:0,
        },
        body_container: {
            display:"flex",
            flexDirection:"row",
            flexWrap:"wrap",
            width:"100%",
            backgroundColor: Theme[theme_type].background_color,
            rowGap:25,
            columnGap:15,
            padding:15,
            justifyContent:"space-evenly",
            alignItems:"flex-start",
        },
        item_box:{
            display:"flex",
            flexDirection:"column",
            alignItems:"center",
            gap:15,
            height:"auto",
            width:Math.max(Dimensions.width*0.25,100),
        },
        item_cover:{
            width:"100%",
            height:Math.max(Dimensions.height*0.25,125),
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
            fontSize: Dimensions.width*0.025,
            width:"100%",
            textAlign:"center",
            flexShrink:1,
        }
    })}