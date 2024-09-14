
// in react native I use async storage here my code ```import AsyncStorage from '@react-native-async-storage/async-storage'; class storage { async get(key:string) { return await AsyncStorage.getItem(key); }; async store(key:string,value:string) { return await AsyncStorage.setItem(key, value); }; async remove(key:string,value:string) { return await AsyncStorage.removeItem(key); }; } export default new storage();``` convert it to use expo sqlite instead. I want to have same access style key - value. make sure it also check platform if it running in react native web and use indexeddb instead and have same access style. make sure to use raw indexeddb instead of any other library. make sure I can call it like this for example `await storage.get("mykey")`. make a variable at the top for sepcify database name. The code have to write in typescript.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

