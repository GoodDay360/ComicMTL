import { StyleSheet } from "react-native";
import {useWindowDimensions} from 'react-native';



export const styles_1 = StyleSheet.create({
    container: {
        width:"100%",
        height:"100%",
        backgroundColor: 'purple',
        display:"flex",
        zIndex:0,
    },
    board:{
        backgroundColor: 'green',
        display:"flex",
        flexDirection: 'row',
        flexWrap: 'wrap',
        aspectRatio: 1,
        margin:"auto",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
    },
    box_even:{
        width: `${100 / 8}%`,
        height: `${100 / 8}%`,
        backgroundColor: 'white',
        aspectRatio:1,
        flexShrink:0,
    },
    box_odd:{
        width: `${100 / 8}%`,
        height: `${100 / 8}%`,
        backgroundColor: 'green',
        aspectRatio:1,
        flexShrink:0,
    },
    piece_frame:{
        width:"100%",
        height:"100%",
        display:"flex",
        justifyContent:"center",
        alignContent:"center",
        position:"absolute",
        zIndex:1,
        
    },
    piece:{
        width:"100%",
        height:"100%",
        cursor:"pointer",
        alignSelf:"center",
        position:"absolute",
        zIndex:1,

        
    },
    piece_allow_position_frame:{
        width:"100%",
        height:"100%",
        display:"flex",
        justifyContent:"center",
        alignItems:"center",
        cursor:"pointer",
        top:0,

    },
    piece_allow_position:{
        width: "30%",
        height: "30%",
        backgroundColor:"grey",
        alignSelf:"center",
        borderRadius:50,
        cursor:"pointer",


    },
    overlay_attack:{
        width:"100%",
        height:"100%",
        alignSelf:"center",
        cursor:"pointer",
        borderRadius:50,
        position:"absolute",
        borderWidth:3,
        borderColor:"grey",

    }
})

export const box_style = (index:number) =>{
    let result

    if ((index/8) % 2 >= 1){
        if (index % 2 === 1) return styles_1.box_even
        else result = styles_1.box_odd
    }else{
        if (index % 2 === 0) return styles_1.box_even
        else result = styles_1.box_odd
        
    }
    return result
    
    
    
};