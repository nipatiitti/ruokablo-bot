import axios from "axios"

import { getServers } from "./functions"
import { botUrl } from "./index"

export const sendStatus = async chat_id => {
    const servers = await getServers()
    const enabled = servers.includes(chat_id.toString())

    axios
        .post(`${botUrl}/sendMessage`, {
            chat_id,
            parse_mode: "HTML",
            text: `I'm currently in <b>${servers.length}</b> group chats\nThis group chat <i>${
                enabled ? "is subscribed" : "is not subscribed"
            }</i> to my fantastic services ${enabled ? ";)" : ":("}\nMy status is: <code>ALIVEEE</code>`
        })
        .catch(e => console.error(e))
}
