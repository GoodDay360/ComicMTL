import { Platform } from "react-native"

const Theme:any = {
    DARK_GREEN: {
        text_color: "#E6E6E6",
        background_color: "#04191A",
        icon_color: "#D9D9D9",
        button_color: "#1B9481",
        border_color: "#00292a",
        text_input_border_color: "white",
        dropbox_container_border: "white",
        button_selected_color: "#23272E",

        ripple_color_outlined: `rgba(22, 35, 50, ${Platform.OS === "web" ? 0.5 : 1})`
    }
}

export default Theme