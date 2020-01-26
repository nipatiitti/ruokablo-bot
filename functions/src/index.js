import * as functions from "firebase-functions"
import express from "express"
import cors from "cors"

import axios from "axios"

import dayjs from "dayjs"

import {
    getMenu,
    handleVote,
    menuToString,
    addServer,
    removeServer,
    getServers,
    sendHelp,
    sendStatus,
    sendMenu
} from "./functions"
import { db } from "./database"

// Telegram api url for the bot
export const botUrl = `https://api.telegram.org/bot${functions.config().telegram.token}`

// Initialize web server
const app = express()
app.use(cors({ origin: true }))

// Handle post events (messages, etc.)
app.post(`/${functions.config().telegram.token.split(":")[1]}`, async (req, res) => {
    const isCallBackQuery = req.body && req.body.callback_query
    const isMessage = req.body && req.body.message

    if (isCallBackQuery) {
        handleVote(req, res)
    } else if (isMessage) {
        const message = isMessage
        if (message.from.is_bot) {
            res.status(200).send("No bots allowed")
            return
        }
        const commands =
            message.entities &&
            message.entities.map(entity => {
                if (entity.type === "bot_command") {
                    return message.text.substring(entity.offset, entity.length)
                }
                return ""
            })

        if (commands) {
            commands.forEach(command => {
                switch (command) {
                    case "/enable":
                    case "/enable@ruokablo_bot":
                        addServer(message.chat.id)
                        break

                    case "/disable":
                    case "/disable@ruokablo_bot":
                        removeServer(message.chat.id)
                        break

                    case "/status":
                    case "/status@ruokablo_bot":
                        sendStatus(message.chat.id)
                        break

                    case "/yfondue":
                    case "/yfondue@ruokablo_bot":
                        sendMenu(message.chat.id, true)
                        break

                    case "/fondue":
                    case "/fondue@ruokablo_bot":
                        sendMenu(message.chat.id)
                        break

                    case "/help":
                    case "/help@ruokablo_bot":
                        sendHelp(message.chat.id)
                        break

                    default:
                        break
                }
            })
        }
    }

    res.status(200).send({ status: "not a telegram message" })
})

export const nightPoll = functions.pubsub
    .schedule("00 15 * * 1,2,3,4,5,6")
    .timeZone("EET")
    .onRun(async () => {
        try {
            const menu = (await getMenu(dayjs().format("YYYY-MM-DD"))).data
            let menuString = menuToString(menu, true)
            const ids = await getServers()

            ids.forEach(async chat_id => {
                try {
                    const result = await axios.post(botUrl + "/sendMessage", {
                        chat_id,
                        text: menuString,
                        parse_mode: "HTML",
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: "SÅÅS/Fusars: 0", callback_data: "såås" }],
                                [{ text: "Reaktori: 0", callback_data: "reaktor" }]
                            ]
                        }
                    })
                    const id = result.data.result.message_id
                    db.ref(`messages/${chat_id}/${id}`).set({
                        reaktor: 0,
                        hertsi: 0,
                        såås: 0,
                        newton: 0,
                        nightPoll: true
                    })
                } catch (e) {
                    console.error(e)
                }
            })
        } catch (error) {
            console.error(error)
        }
    })

// Timed event that posts the menu for today
export const menu = functions.pubsub
    .schedule("30 10 * * 1,2,3,4,5,6")
    .timeZone("EET")
    .onRun(async context => {
        try {
            const menu = (await getMenu(dayjs().format("YYYY-MM-DD"))).data
            let menuString = menuToString(menu)
            const ids = await getServers()

            ids.forEach(async chat_id => {
                try {
                    const result = await axios.post(botUrl + "/sendMessage", {
                        chat_id,
                        text: menuString,
                        parse_mode: "HTML",
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: "SÅÅS/Fusars: 0", callback_data: "såås" }],
                                [{ text: "Hertsi: 0", callback_data: "hertsi" }],
                                [{ text: "Newton: 0", callback_data: "newton" }],
                                [{ text: "Reaktori: 0", callback_data: "reaktor" }]
                            ]
                        }
                    })
                    const id = result.data.result.message_id
                    db.ref(`messages/${chat_id}/${id}`).set({
                        reaktor: 0,
                        hertsi: 0,
                        såås: 0,
                        newton: 0
                    })
                } catch (e) {
                    console.error(e)
                }
            })
        } catch (error) {
            console.error(error)
        }
    })

// Send the http request forward to the express server
export const apiEndPoint = functions.https.onRequest(app)
