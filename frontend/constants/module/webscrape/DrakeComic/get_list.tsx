import * as cheerio from 'cheerio';
import axios from 'axios';


const __get_list = (search:string,page:number) => {
    
    axios({
        method: 'get',
        url: `https://cors-anywhere.herokuapp.com/https://drakecomic.org/?s=`,

        timeout: 60000,
    }).then((response)=>{
        const result = response;
        console.log(result);

    })


    return "HELLO";
}

export default __get_list;



