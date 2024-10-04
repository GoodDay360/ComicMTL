
import { Dropdown as __Dropdown } from 'react-native-element-dropdown';
import { StyleSheet } from 'react-native';
import Theme from '@/constants/theme';
import { View, Text } from 'react-native';

const __style = (Dimensions:any,theme_type:string) => StyleSheet.create({
    container: {
        display: "flex",
        flexDirection: "column",
        backgroundColor: Theme[theme_type].background_color,
        gap: 8,

    },
    label: {
        color: Theme[theme_type].text_color,
        fontSize: ((Dimensions.width+Dimensions.height)/2)*0.0220,
        height:"auto",
        fontFamily: "roboto-medium",
    },
    dropdown: {
        cursor: "pointer",
        height: 50,
        borderColor: Theme[theme_type].dropbox_container_border,
        borderWidth: 2,
        borderRadius: 8,
        paddingHorizontal: 8,
        width:"100%",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,

        elevation: 5,
    },
    placeholderStyle: {
        color: Theme[theme_type].text_color,
    },
    selectedTextStyle: {
        fontSize: ((Dimensions.width+Dimensions.height)/2)*0.0215,
        color: Theme[theme_type].text_color,
    },
    containerStyle: {
      backgroundColor: Theme[theme_type].background_color,  
      borderColor: Theme[theme_type].dropbox_container_border,
      borderRadius: 8,
      borderWidth:1,
      shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,

        elevation: 5,
    },
    inputSearchStyle:{
        borderRadius:8,
        color: Theme[theme_type].text_color,
        fontSize: ((Dimensions.width+Dimensions.height)/2)*0.0225,
    },
    itemContainerStyle: {
        borderColor: Theme[theme_type].border_color,
        borderTopWidth:1,
        borderBottomLeftRadius: 8, borderBottomRightRadius:8,
    },
    itemTextStyle:{
        color: Theme[theme_type].text_color,
        fontSize: ((Dimensions.width+Dimensions.height)/2)*0.0225,
    }
})

interface DropdownProps {
    theme_type: string;
    Dimensions?: any;
    maxHeight?: number;
    data: any[];
    label?: any;
    value?: any;
    onChange?: any;
}

const Dropdown = ({disable=false,theme_type,Dimensions,data,maxHeight=300,label,value,onChange}:any) => {
    const style = __style(Dimensions,theme_type)

    return <View style={style.container}>
        <Text style={style.label}>{label}</Text>
        <__Dropdown
            disable={disable}
            style={style.dropdown}
            placeholderStyle={style.placeholderStyle}
            selectedTextStyle={style.selectedTextStyle}
            containerStyle={style.containerStyle}
            inputSearchStyle={style.inputSearchStyle}
            itemContainerStyle={style.itemContainerStyle}
            itemTextStyle={style.itemTextStyle}
            activeColor={Theme[theme_type].background_color}
            fontFamily='roboto-medium'
            data={data}
            search
            maxHeight={maxHeight}
            labelField="label"
            valueField="value"
            placeholder={ 'Select item'}
            searchPlaceholder="Search..."
            value={value}

            onChange={item => {
                onChange(item)
            }}
            renderLeftIcon={() => (
                <></>
            )}
        />
</View>}

export default Dropdown;