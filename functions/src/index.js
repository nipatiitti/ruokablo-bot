import * as functions from "firebase-functions"
import * as admin from "firebase-admin"
import express from "express"
import cors from "cors"

import axios from "axios"

import dayjs from "dayjs"

import { getMenu } from "./menu"

admin.initializeApp(functions.config().firebase)

const db = admin.database()

const botUrl = `https://api.telegram.org/bot${functions.config().telegram.token}`

const app = express()
app.use(cors({ origin: true }))

app.post("/", async (req, res) => {
    console.log(req.body)
    const isCallBackQuery = req.body && req.body.callback_query

    if (isCallBackQuery) {
        try {
            const cb = req.body.callback_query
            const id = cb.message.message_id
            const caster = cb.from.id
            const vote = cb.data

            const counterRef = db.ref(`messages/${id}`)
            let text = ""

            counterRef.transaction(
                counter => {
                    if (counter) {
                        if (counter[caster]) {
                            const oldVote = counter[caster]
                            counter[vote]++
                            counter[oldVote]--
                            counter[caster] = vote

                            text = vote === "såås" ? "Mestarin valinta ;)" : "Vastaus tunitettu :|"
                        } else {
                            counter[vote]++
                            counter[caster] = vote
                            text = vote === "såås" ? "Mestarin valinta ;)" : "Vastaus tallennettu :D"
                        }
                    }

                    return counter
                },
                (error, committed, snapshot) => {
                    if (error) {
                        console.error("Transaction failed abnormally!", error)
                        axios
                            .post(botUrl + "/answerCallbackQuery", {
                                callback_query_id: cb.id,
                                text: "Update failed contact @nipatiitti",
                                show_alert: true
                            })
                            .catch(e => console.error(e))
                    } else {
                        axios
                            .post(botUrl + "/answerCallbackQuery", {
                                callback_query_id: cb.id,
                                text,
                                show_alert: true
                            })
                            .catch(e => console.error(e))

                        const counterVal = snapshot.val()

                        axios
                            .post(botUrl + "/editMessageText", {
                                chat_id: functions.config().telegram.chat_id,
                                message_id: id,
                                text: cb.message.text,
                                parse_mode: "HTML",
                                reply_markup: {
                                    inline_keyboard: [
                                        [{ text: "Reaktori: " + counterVal.reaktor, callback_data: "reaktor" }],
                                        [{ text: "Newton: " + counterVal.newton, callback_data: "newton" }],
                                        [{ text: "Hertsi: " + counterVal.hertsi, callback_data: "hertsi" }],
                                        [{ text: "SÅÅS: " + counterVal.såås, callback_data: "såås" }]
                                    ]
                                }
                            })
                            .catch(e => console.error(e))
                    }
                }
            )
        } catch (e) {
            console.error(e)
        }
    }

    return res.status(200).send({ status: "not a telegram message" })
})

export const menu = functions.pubsub
    .schedule("30 11 * * *")
    .timeZone("EET")
    .onRun(async context => {
        const menu = (await getMenu(dayjs().format("YYYY-MM-DD"))).data

        let menuString = ""

        menu.restaurants.forEach(restaurant => {
            menuString += `<b>${restaurant.name}</b>\n`
            restaurant.menus.forEach(menu => {
                menuString += `\t<b>${menu.name}</b>\n`
                menu.meals.forEach(meal => {
                    menuString += `\t\t<b>${meal.name} - </b>`
                    meal.contents.forEach((food, index) => {
                        menuString += `<code>${food.name}${index == meal.contents.length - 1 ? "" : ", "}</code>`
                    })
                    menuString += "\n"
                })
            })
        })

        try {
            const result = await axios.post(botUrl + "/sendMessage", {
                chat_id: functions.config().telegram.chat_id,
                text: menuString,
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "Reaktori: 0", callback_data: "reaktor" }],
                        [{ text: "Newton: 0", callback_data: "newton" }],
                        [{ text: "Hertsi: 0", callback_data: "hertsi" }],
                        [{ text: "SÅÅS: 0", callback_data: "såås" }]
                    ]
                }
            })
            const id = result.data.result.message_id
            db.ref(`messages/${id}`).set({
                reaktor: 0,
                hertsi: 0,
                såås: 0,
                newton: 0
            })
        } catch (e) {
            console.error(e)
        }
    })

export const counter = functions.https.onRequest(app)
