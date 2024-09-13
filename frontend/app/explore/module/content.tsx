import axios from 'axios';


export const get_list = (setIsLoading:any,translate:any,SET_CONTENT:any,API_BASE:string) => {

    axios({
        method: 'post',
        url: `${API_BASE}/api/web_scrap/get_list/`,
        data: {
            translate:translate
        }
    }).then((response) => {(async () =>{
        const DATA = response.data.data
        SET_CONTENT(DATA)
        setIsLoading(false)
        
    })()}).catch((error) => {
        console.log(error)
    })
}