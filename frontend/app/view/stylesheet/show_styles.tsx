import { StyleSheet } from "react-native";
import Theme from "@/constants/theme";

export const __styles:any = (theme_type:string,Dimensions:any) => {
    return StyleSheet.create({
        default_button: {
            borderWidth:0,
            borderRadius:5,
        },
        default_button_label: {
            margin:0,
            marginHorizontal: 0,
            marginVertical: 0,
            
            padding:5,
            paddingVertical: 5,
            paddingHorizontal: 5,
        },
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
            fontSize: ((Dimensions.width+Dimensions.height)/2)*0.04,
            color: Theme[theme_type].text_color,
            
        },
        header_button_box:{
            display:"flex",
            flexDirection:"row",
            width:"auto",
            justifyContent:"center",
            alignItems:"center",
        },
        option_container:{
            width:"100%",
            padding:15,
            borderBottomWidth: 0.5,
            borderColor: Theme[theme_type].border_color,
            display:"flex",
            flexDirection:"column",
            gap:25,
        },
        dropbox_label:{
            display:"flex",
            flexDirection:"row",
            alignItems:"center",
            color: Theme[theme_type].text_color,
            fontSize: ((Dimensions.width+Dimensions.height)/2)*0.0225,
            height:"auto",
            fontFamily: "roboto-medium",
        },
        body_container: {
            width: "100%",
            height: "auto",
            backgroundColor: Theme[theme_type].background_color,
            display: "flex",
            flexDirection: "column",
            padding:20,
            gap: 20,
        },
        body_box_1:{
            display: "flex",
            flexDirection: "row",
            gap: 18,
            width:"100%",
            
        },
        item_cover:{
            width:Math.max(((Dimensions.width+Dimensions.height)/2)*0.2,100),
            height:Math.max(((Dimensions.width+Dimensions.height)/2)*0.3,125),
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
        item_info:{
            color: Theme[theme_type].text_color,
            fontFamily: "roboto-medium",
            width:"100%",
            height:"auto",
            textAlign:"left",
            flexShrink:1,
            flexWrap: 'wrap',
        },
        body_box_2:{
            display: "flex",
            flexDirection: "column",
            width:'100%',
        },
        body_box_3:{
            display: "flex",
            flexDirection: "column",
            width:'100%',
        },
        body_box_4:{
            display: "flex",
            flexDirection: "column",
            width:'100%',
            paddingTop:10,
            gap:12,
        },
        chapter_box:{
            width:"100%",
            height:"auto",
            borderColor: Theme[theme_type].border_color,
            borderTopWidth:4,
            borderBottomWidth:4,
            borderRadius:8,
            display:"flex",
            flexDirection: "column",
            // flexWrap:"wrap",
            justifyContent:"space-around",
            gap:16,
            padding:12,
        },
        chapter_button:{
            borderWidth:2,
            borderRadius:5,
            borderColor: Theme[theme_type].border_color,
            flex:1
        }
    })}