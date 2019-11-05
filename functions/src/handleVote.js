import * as functions from "firebase-functions"
import axios from "axios"
import dayjs from "dayjs"

import { botUrl } from "./index"

import { getMenu, menuToString } from "./functions"

import { db } from "./database"

export const handleVote = (req, res) => {
    try {
        const cb = req.body.callback_query
        const id = cb.message.message_id
        const caster = cb.from.id
        const vote = cb.data
        const chat_id = cb.message.chat.id

        const counterRef = db.ref(`messages/${chat_id}/${id}`)
        let text = ""

        counterRef.transaction(
            counter => {
                if (counter) {
                    if (counter[caster]) {
                        const oldVote = counter[caster]
                        counter[vote]++
                        counter[oldVote]--
                        counter[caster] = vote

                        text = "Vastaus tunitettu :|"
                    } else {
                        counter[vote]++
                        counter[caster] = vote
                        text = "Vastaus tallennettu :D"
                    }
                }

                return counter
            },
            async (error, committed, snapshot) => {
                if (error) {
                    console.error("Transaction failed abnormally!", error)
                    axios
                        .post(botUrl + "/answerCallbackQuery", {
                            callback_query_id: cb.id,
                            text: "Update failed contact @nipatiitti"
                        })
                        .catch(e => console.error(e))
                } else {
                    axios
                        .post(botUrl + "/answerCallbackQuery", {
                            callback_query_id: cb.id,
                            text
                        })
                        .catch(e => console.error(e))

                    const counterVal = snapshot.val()

                    const menu = (await getMenu(dayjs().format("YYYY-MM-DD"))).data
                    let menuString = menuToString(menu)

                    axios
                        .post(botUrl + "/editMessageText", {
                            chat_id,
                            message_id: id,
                            text: menuString,
                            parse_mode: "HTML",
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: "Reaktori: " + counterVal.reaktor, callback_data: "reaktor" }],
                                    [{ text: "Newton: " + counterVal.newton, callback_data: "newton" }],
                                    [{ text: "Hertsi: " + counterVal.hertsi, callback_data: "hertsi" }],
                                    [{ text: "SÅÅS/Fusars: " + counterVal.såås, callback_data: "såås" }]
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
