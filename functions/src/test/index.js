import axios from "axios"

//import { getMenu } from "../menu"

require("dotenv").config()

const botUrl = `https://api.telegram.org/bot${process.env.TOKEN}`

export const getMenu = async date => {
    const url = `https://api.ruoka.xyz/${date}`

    try {
        const results = await axios.get(url)
        return results
    } catch (e) {
        console.error(e)
    }

    return {}
}

const sendMenu = async () => {
    const menu = (await getMenu("2019-10-29")).data

    const hertsi = menu.restaurants[1].menus[0].meals
    const reaktori = menu.restaurants[3].menus[0].meals
    const newton = menu.restaurants[2].menus[0].meals
    const menuString = `
<b>Reaktor:</b>
\t\t-<code>${reaktori[2].contents[0].name}</code>
\t\t-<code>${reaktori[3].contents[0].name}</code>

<b>Newton:</b>
\t\t-<code>${newton[0].contents[0].name}</code>
\t\t-<code>${newton[1].contents[0].name}</code>

<b>Hertsi:</b>
\t\t-<code>${hertsi[0].contents[0].name}</code>
\t\t-<code>${hertsi[1].contents[0].name}</code>
    `

    try {
        const result = await axios.post(botUrl + "/sendMessage", {
            chat_id: process.env.CHAT_ID,
            text: menuString,
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: [
                    [{ text: "Reaktori", callback_data: "reaktor" }],
                    [{ text: "Newton", callback_data: "newton" }],
                    [{ text: "Hertsi", callback_data: "Hertsi" }],
                    [{ text: "SÅÅS", callback_data: "såås" }]
                ]
            }
        })
        console.log(result.data.result.message_id)
    } catch (e) {
        console.error(e)
    }
}

// sendMenu()
