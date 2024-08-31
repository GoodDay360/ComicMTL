import React, { useEffect, useState } from 'react';
import { View, ScrollView, Image, Button, Pressable } from 'react-native';
import { styles_1, box_style } from './stylesheet/styles_1';
import {useWindowDimensions} from 'react-native';

import { check_piece_allow_position, move_piece } from './module/main';

import {default_top, default_bottom} from './module/default_position'

const HomeLayout = () => {
    const {height, width} = useWindowDimensions();
    
    const [team,setTeam] = useState("black")

    const [mainSide,setMainSide] = useState(team === "white" ? ["black","white"] : ["white","black"])


    const [black, setBlack] = useState(mainSide[0]==="black" ? default_top : default_bottom)

    const [white,setWhite] = useState(mainSide[0]==="white" ? default_top : default_bottom)

    const [selected,setSelected] = useState({team:"",piece_type:"",position:[]})
    
    
    useEffect(() => {
        // console.log(white)
    },[white])

    return (
        <View style={styles_1.container}>
            <View style={Object.assign({},styles_1.board,{width: width > height ? height : width})}>
                {Array.from({ length: 64 }, (_, index) => (

                    <View key={index} style={box_style(index)}>
                        {Object.keys(black).map((key,i1)=>(<React.Fragment key={i1}>
                            {(black as any)[key].map((piece:any)=>(<React.Fragment key={parseInt(`${piece[0]}`+`${piece[1]}`)}>
                                {(piece[0] <= index/8 && (piece[1]+(8*piece[0])) === index) && 

                                    <Pressable style={styles_1.piece_frame} key={parseInt(piece[1]+(8*piece[0]))} pointerEvents={white.piece_allow_position.some((pre:any) => pre[0] === piece[0] && pre[1] === piece[1]) ? 'none' : 'auto'} disabled={team === "black" ? false : true}
                                        onPress={() => {
                                            if (selected.position[0] === piece[0] && selected.position[1]===piece[1]){
                                                setSelected({team:"",piece_type:"",position:[]})
                                                setBlack({...black,piece_allow_position:[]})
                                                setWhite({...white,piece_allow_position:[]})
                                            }else{
                                                setSelected({team:"black",piece_type:key,position:piece})
                                                check_piece_allow_position(setBlack,setWhite,{black:black,white:white},mainSide,"black",key,piece)
                                            }
                                            
                                        }}
                                    >
                                        {key === "koul" && <Image style={styles_1.piece}  source={require("@/assets/images/black/koul.png")}/>}
                                        {key === "neang" && <Image style={styles_1.piece} source={require("@/assets/images/black/neang.png")}/>}
                                        {key === "sdach" && <Image style={styles_1.piece} source={require("@/assets/images/black/sdach.png")}/>}
                                        {key === "ses" && <Image style={styles_1.piece} source={require("@/assets/images/black/ses.png")}/>}
                                        {key === "touk" && <Image style={styles_1.piece} source={require("@/assets/images/black/touk.png")}/>}
                                        {key === "trey" && <Image style={styles_1.piece} source={require("@/assets/images/black/trey.png")}/>}
                                        {key === "trey_bork" && <Image style={styles_1.piece} source={require("@/assets/images/black/trey_bork.png")}/>}
                                        <Pressable style={styles_1.piece_allow_position_frame} pointerEvents='auto'
                                             onPress={()=>{ move_piece(setBlack,setWhite,{black:black,white:white},selected,piece)}}
                                        >
                                            {white.piece_allow_position.some((pre:any) => pre[0] === piece[0] && pre[1] === piece[1])
                                                ? <View style={styles_1.overlay_attack} ></View>
                                                : <>{key === "piece_allow_position" && <View style={styles_1.piece_allow_position}/>}</>
                                            }
                                        </Pressable>
                                        
                                    
                                    </Pressable>
                                    
                                }
                            </React.Fragment>))}
                        </React.Fragment>))}

                        {Object.keys(white).map((key,i1)=>(<React.Fragment key={i1}>
                            {(white as any)[key].map((piece:any)=>(<React.Fragment key={parseInt(`${piece[0]}`+`${piece[1]}`)}>
                                {(piece[0] <= index/8 && (piece[1]+(8*piece[0])) === index) && 
                                    <Pressable style={styles_1.piece_frame} key={parseInt(piece[1]+(8*piece[0])+64)} pointerEvents={black.piece_allow_position.some((pre:any) => pre[0] === piece[0] && pre[1] === piece[1]) ? 'none' : 'auto'} disabled={team === "white" ? false : true}
                                        onPress={() => {
                                            if (selected.position[0] === piece[0] && selected.position[1]===piece[1]){
                                                setSelected({team:"",piece_type:"",position:[]})
                                                setBlack({...black,piece_allow_position:[]})
                                                setWhite({...white,piece_allow_position:[]})
                                            }else{
                                                setSelected({team:"white",piece_type:key,position:piece})
                                                check_piece_allow_position(setBlack,setWhite,{black:black,white:white},mainSide,"white",key,piece)
                                            }
                                        }}
                                    >  
                                        {key === "koul" && <Image style={styles_1.piece} source={require("@/assets/images/white/koul.png")}/>}
                                        {key === "neang" && <Image style={styles_1.piece} source={require("@/assets/images/white/neang.png")}/>}
                                        {key === "sdach" && <Image style={styles_1.piece} source={require("@/assets/images/white/sdach.png")}/>}
                                        {key === "ses" && <Image style={styles_1.piece} source={require("@/assets/images/white/ses.png")}/>}
                                        {key === "touk" && <Image style={styles_1.piece} source={require("@/assets/images/white/touk.png")}/>}
                                        {key === "trey" && <Image style={styles_1.piece} source={require("@/assets/images/white/trey.png")}/>}
                                        {key === "trey_bork" && <Image style={styles_1.piece} source={require("@/assets/images/white/trey_bork.png")}/>}
                                        <Pressable style={styles_1.piece_allow_position_frame} pointerEvents='auto'
                                            onPress={()=>{ move_piece(setBlack,setWhite,{black:black,white:white},selected,piece)}}
                                        >
                                            {black.piece_allow_position.some((pre:any) => pre[0] === piece[0] && pre[1] === piece[1])
                                                ? <View style={styles_1.overlay_attack}></View>
                                                : <>{key === "piece_allow_position" && <View style={styles_1.piece_allow_position} pointerEvents='auto'/>}</>
                                            }
                                        </Pressable>
                                    </Pressable>
                                }
                            </React.Fragment>))}
                        </React.Fragment>))}
                    </View>


                ))}
            </View>
        </View>
    );
}



export default HomeLayout;
