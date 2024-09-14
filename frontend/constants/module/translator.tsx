import axios from "axios";

const translator = (from_code:string,to_code:string,text:string) => {return (async () => {
    const DATA = await axios({
        method: 'get',
        url: `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=${from_code}&tl=${to_code}&q=${text.replace(/ /g, '%20')}`,
    })
    if (from_code === "auto") return DATA.data[0][0]
    else return DATA.data[0]
})()}

export default translator