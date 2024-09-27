import axios from "axios";

const translator = (from_code:string,to_code:string,text:string) => {return (async () => {
    const DATA = await axios({
        method: 'get',
        url: `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=${from_code}&tl=${to_code}&q=${encodeURIComponent(text)}`,
    }).then((response) => {return response.data})
    .catch((error) => {console.log(error)})
    if (from_code === "auto") return DATA[0][0]
    else return DATA[0]
})()}

export default translator