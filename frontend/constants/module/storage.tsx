import AsyncStorage from '@react-native-async-storage/async-storage';

class storage {
    async get(key:string) {
        return await AsyncStorage.getItem(key);
    };
  
    async store(key:string,value:string)  {
      return await AsyncStorage.setItem(key, value);
  };
}

export default new storage();