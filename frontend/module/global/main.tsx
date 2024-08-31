import { black } from "colorette";

export function range(start:number, end:number, step = 1) {
    const numbers = [];
    for (let i = start; i <= end; i += step) {
      numbers.push(i);
    }
    return numbers;
}

export function splitObject(obj:any) {
  console.log(obj)
  const result_obj = []
  
  for (const i of range(0,6)){
    let new_obj:any = {}
    Object.keys(obj).map((key:any) => {
      new_obj[key] = {}
      new_obj[key][Object.keys(obj[key])[i]] = obj[key][Object.keys(obj[key])[i]]
    })
    result_obj.push(new_obj)
  }
  return result_obj
}