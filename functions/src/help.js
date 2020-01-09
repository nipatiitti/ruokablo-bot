import axios from "axios"

import { botUrl } from "./index"

export const sendHelp = chat_id => {
    axios
        .post(`${botUrl}/sendMessage`, {
            chat_id,
            parse_mode: "HTML",
            text:
                "/enable - Subscribe to my services\n/disable - Unsubscribe from my services\n/status - Get my status\n/fondue - Send the menu without poll right now"
        })
        .catch(e => console.error(e))
}
