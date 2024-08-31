import { range } from "@/module/global/main";
import copy from "fast-copy";

async function check_legal_move(board:any, side:any, position:any, piece_type:string) {
    let enemy
    let ally
    if (side[0] === "white") {
        ally = "white"
        enemy = "black"
    }else{
        ally = "black"
        enemy = "white"
    }
    const promises:any = []

    

    if (piece_type === "sdach") {
        const move_direction = [[1,0],[-1,0],[0,1],[0,-1]]
        const blocked_enemy = move_direction.some((item:any,index:any) =>{
            for (const i of range(1,8)) {
                const temp_position = copy(position)
                temp_position[0] = temp_position[0] + move_direction[index][0]*i
                temp_position[1] = temp_position[1] + move_direction[index][1]*i
                if ( temp_position[0] < 0 || temp_position[0] > 7) return false
                else if (temp_position[1] < 0 || temp_position[1] > 7) return false
                const blocked_enemy = board[enemy]["touk"].some((item:any) => item[0] === temp_position[0] && item[1] === temp_position[1])
                if (blocked_enemy) return blocked_enemy 
            }
        })
        if (blocked_enemy) return false
            

    }else{
        const sdach_pinned_piece:any = []

        // check if sdach being checked
        const sdach_position = board[ally]["sdach"][0]
        const piece_to_check = ["ses","trey","koul","neang","touk","trey_bork"]
        
        piece_to_check.map((item:any,_:number) =>{
            let move_direction:any = []
            if (piece_type === "koul"){
    
                move_direction = [[1,0],[1,1],[1,-1],[-1,1],[-1,-1]]
                
            }else if (piece_type === "ses"){
                
                move_direction = [[-1,2],[-2,1],[-1,-2],[-2,-1],[1,2],[2,1],[1,-2],[2,-1]]
                
            }else if (piece_type === "neang" || piece_type === "trey_bork"){

                move_direction = [[1,1],[1,-1],[-1,1],[-1,-1]]
                
            }else if (piece_type === "sdach"){
            
                move_direction = [[1,1],[1,0],[1,-1],[-1,1],[-1,0],[-1,-1],[0,1],[0,-1]]
                
            }else if (piece_type === "trey"){
                move_direction = [[1,1],[-1,1]]
            }

            Object.keys(move_direction).map((_,index:number) => {
                const new_position = [sdach_position[0],sdach_position[1]]
                new_position[0] = new_position[0] + move_direction[index][0]
                new_position[1] = new_position[1] + move_direction[index][1]
                board[enemy][item].map((arr:any) => {
                    if (arr[0] === new_position[0] && arr[1] === new_position[1]) {
                        sdach_pinned_piece.push(arr)
                    }
                })
            }) 
        })
        // =======================================================================
        if (sdach_pinned_piece.length === 1) {
            return sdach_pinned_piece.some((item:any) => {
                console.log(item,position)
                if (item[0] === position[0] && item[1] === position[1]) return true
                else return false
            })
        }
    }


    
    if ( position[0] < 0 || position[0] > 7) return false
    else if (position[1] < 0 || position[1] > 7) return false
    else{
        Object.keys(board[ally]).some((key:any) => {
            promises.push(new Promise(async (resolve:any,reject:any) => {
                resolve(!board[ally][key].some((item:any) => item[0] === position[0] && item[1] === position[1]))
            }))
            
        })
    }
    const result = await Promise.all(promises)

    console.log(result)
    // if result have false it return false. to tell it allow to move or not.
    return !result.includes(false)
}

export const check_piece_allow_position = (setBlack:any,setWhite:any,_board:any,mainSide:any,currentSide:string,piece_type:string,_current_position:any) => {
    const current_position = copy(_current_position)
    const board = copy(_board)
    const allow_position:any = []
    const promises:any = []
    
    const enemy = mainSide[0]
    const ally = mainSide[1]
    board.white.piece_allow_position = []
    board.black.piece_allow_position = []
    if (!["touk","trey"].includes(piece_type)){
        let move_direction:any = []
        if (piece_type === "koul"){
            if (mainSide[0] === currentSide){
                move_direction = [[1,0],[1,1],[1,-1],[-1,1],[-1,-1]]
            }else{
                move_direction = [[-1,0],[-1,1],[-1,-1],[1,1],[1,-1]]
            }
        }else if (piece_type === "ses"){
            if (mainSide[0] === currentSide){
                move_direction = []
            }else{
                move_direction = [[-1,2],[-2,1],[-1,-2],[-2,-1],[1,2],[2,1],[1,-2],[2,-1]]
            }
        }else if (piece_type === "neang"){
            if (mainSide[0] === currentSide){
                move_direction = []
            }else{
                move_direction = [[1,1],[1,-1],[-1,1],[-1,-1]]
            }
        }else if (piece_type === "sdach"){
            if (mainSide[0] === currentSide){
                move_direction = []
            }else{
                move_direction = [[1,1],[1,0],[1,-1],[-1,1],[-1,0],[-1,-1],[0,1],[0,-1]]
            }
        }
        
        Object.keys(move_direction).map((key,index) => {
            promises.push(new Promise(async (resolve,reject) => {
                const new_position = [current_position[0],current_position[1]]
                new_position[0] = new_position[0] + move_direction[index][0]
                new_position[1] = new_position[1] + move_direction[index][1]
                if (await check_legal_move(board,[currentSide,0],new_position,piece_type)) {
                    allow_position.push(new_position)
                }
                resolve(true)
            }))
        })
    }else if (piece_type === "trey"){
        let move_direction:any = []
        if (mainSide[0] === currentSide){
            move_direction = [[1,0]]
        }else{
            move_direction = [[-1,1],[-1,0],[-1,-1]]
        }
        
        Object.keys(move_direction).map((key,index) => {
            promises.push(new Promise(async (resolve,reject) => {
                let new_position = [current_position[0],current_position[1]]
                new_position[0] = new_position[0] + move_direction[index][0]
                new_position[1] = new_position[1] + move_direction[index][1]
                let allow_move
                if ([0,2].includes(parseInt(key))) {
                    allow_move = Object.keys(board[enemy]).some((key:any) => {
                        return board[enemy][key].some((item:any) => item[0] === new_position[0] && item[1] === new_position[1])
                    })
                }else{
                    allow_move = !Object.keys(board[enemy]).some((key:any) => {
                        return board[enemy][key].some((item:any) => item[0] === new_position[0] && item[1] === new_position[1])
                    })
                }
                if (allow_move) {
                    if (await check_legal_move(board,[currentSide,0],new_position,piece_type)) {
                        allow_position.push(new_position)
                    }
                }
                
                
                resolve(true)
            }))
        })
    }else if (piece_type === "touk"){
        const move_direction = [[1,0],[-1,0],[0,1],[0,-1]]
        
        Object.keys(move_direction).map((key,index) => {
            promises.push(new Promise(async (resolve,reject) => {

                for (const i of range(1,8)){
                    const new_position = [current_position[0],current_position[1]]
                    new_position[0] = new_position[0] + move_direction[index][0]*i
                    new_position[1] = new_position[1] + move_direction[index][1]*i
                    
                    const blocked_ally = Object.keys(board[ally]).some((key:any) => {
                        return board[ally][key].some((item:any) => item[0] === new_position[0] && item[1] === new_position[1])
                    })
                    if (blocked_ally) break

                    const blocked_enemy = Object.keys(board[enemy]).some((key:any) => {
                        return board[enemy][key].some((item:any) => item[0] === new_position[0] && item[1] === new_position[1])
                    })
                    if (blocked_enemy) {
                        if (await check_legal_move(board,[currentSide,0],new_position,piece_type)) {
                            allow_position.push(new_position)
                        }
                        break
                    }else if (await check_legal_move(board,[currentSide,0],new_position,piece_type)) {
                        allow_position.push(new_position)
                    }
                }
                resolve(true)
            }))
        })
    }

    Promise.all(promises).then(() => {
        if (ally === "white"){
            setWhite({...board.white,piece_allow_position:allow_position})
        }else{
            setBlack({...board.black,piece_allow_position:allow_position})
        }
    })
}

export const move_piece = (setBlack:any,setWhite:any,_board:any, selected:any, to_position:any) => {
    const board:any = copy(_board)
    let enemy;let ally
    if (selected.team === "white") {
        ally = "white"
        enemy = "black"
    }else{
        ally = "black"
        enemy = "white"
    }
    const current_position = selected.position;
    const current_piece_type = selected.piece_type
    
    let enemy_piece_type:string = ""
    const exist = Object.keys(board[enemy]).some((key:any) => {
        enemy_piece_type = key
        const obj = board[enemy][key]
        return obj.some((arr:any) => arr[0] === to_position[0] && arr[1] === to_position[1])
    });
    
    if (exist) board[enemy][enemy_piece_type] = board[enemy][enemy_piece_type].filter((arr:any) => !(arr[0] === to_position[0] && arr[1] === to_position[1]));
    board[ally][current_piece_type] = board[ally][current_piece_type].filter((arr:any) => !(arr[0] === current_position[0] && arr[1] === current_position[1]));
    board[ally][current_piece_type].push(to_position)
    board[ally]["piece_allow_position"] = []
    board[enemy]["piece_allow_position"] = []
    
    setBlack(board.black)
    setWhite(board.white)
    
    // console.log("asdasd",enemy_piece_type ,board[enemy][enemy_piece_type])
}