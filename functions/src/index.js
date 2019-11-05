import * as functions from "firebase-functions"
import * as admin from "firebase-admin"
import express from "express"
import cors from "cors"

import axios from "axios"

import dayjs from "dayjs"

import { getMenu, handleVote, menuToString } from "./functions"

// Initialize firebase admin sdk
admin.initializeApp(functions.config().firebase)
const db = admin.database()

// Telegram api url for the bot
const botUrl = `https://api.telegram.org/bot${functions.config().telegram.token}`

// Initialize web server
const app = express()
app.use(cors({ origin: true }))

// Handle post events (messages, etc.)
app.post("/", async (req, res) => {
    const isCallBackQuery = req.body && req.body.callback_query

    if (isCallBackQuery) {
        handleVote(req, res, db)
    }

    return res.status(200).send({ status: "not a telegram message" })
})

// Timed event that posts the menu for today
export const menu = functions.pubsub
    .schedule("30 11 * * *")
    .timeZone("EET")
    .onRun(async context => {
        const menu = (await getMenu(dayjs().format("YYYY-MM-DD"))).data
        let menuString = menuToString(menu)
        const chat_id = functions.config().telegram.chat_id
        try {
            const result = await axios.post(botUrl + "/sendMessage", {
                chat_id,
                text: menuString,
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "Reaktori: 0", callback_data: "reaktor" }],
                        [{ text: "Newton: 0", callback_data: "newton" }],
                        [{ text: "Hertsi: 0", callback_data: "hertsi" }],
                        [{ text: "SÅÅS/Fusars: 0", callback_data: "såås" }]
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

// Send the http request forward to the express server
export const counter = functions.https.onRequest(app)
