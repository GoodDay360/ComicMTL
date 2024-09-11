import axios from 'axios';

export const get_list = (SET_CONTENT:any,API_BASE:string) => {
    console.log(`${API_BASE}/api/web_scrap/get_list/`)
    axios({
        method: 'get',
        url: `${API_BASE}/api/web_scrap/get_list/`,
        // data: {
        //     source:"colamanga",
        // },
    }).then((response) => {
        console.log(response.data.data)
        SET_CONTENT(response.data.data)
    }).catch((error) => {
        console.log(error)
    })
}