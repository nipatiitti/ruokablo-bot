import axios from "axios"

import { botUrl } from "./index"
import { db } from "./database"

export const addServer = chat_id => {
    const ref = db.ref(`/servers/${chat_id}`)

    ref.transaction(
        server => {
            server = { enabled: true }
            return server
        },
        () => {
            axios
                .post(botUrl + "/sendMessage", {
                    chat_id,
                    text: "I'm enabled now!"
                })
                .catch(e => console.error(e))
        }
    )
}

export const removeServer = chat_id => {
    const ref = db.ref(`/servers/${chat_id}`)

    ref.transaction(
        server => {
            server = { enabled: false }
            return server
        },
        () => {
            axios
                .post(botUrl + "/sendMessage", {
                    chat_id,
                    text: "I'm disabled now :("
                })
                .catch(e => console.error(e))
        }
    )
}

export const getServers = () =>
    new Promise((res, rej) => {
        const ref = db.ref("/servers")

        ref.once("value", snapshot => {
            const servers = snapshot.val()
            const serverList = []

            for (const chat_id in servers) {
                if (servers.hasOwnProperty(chat_id)) {
                    const server = servers[chat_id]
                    if (server.enabled) {
                        serverList.push(chat_id)
                    }
                }
            }

            res(serverList)
        })
    })
