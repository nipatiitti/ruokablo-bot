import axios from "axios"

import { botUrl } from "./index"

export const sendCorona = async chat_id => {
    try {
        const corona = await axios.get("https://w3qa5ydb4l.execute-api.eu-west-1.amazonaws.com/prod/finnishCoronaData")

        let CasesByPlace = {}
        let DeathsByPlace = {}

        const sickPeople = corona.data.confirmed
        const deadPeople = corona.data.deaths

        let sickCases = sickPeople.length
        let deathCases = deadPeople.length

        sickPeople.forEach(person => {
            CasesByPlace[person.healthCareDistrict] = CasesByPlace[person.healthCareDistrict]
                ? CasesByPlace[person.healthCareDistrict] + 1
                : 1
        })

        deadPeople.forEach(person => {
            DeathsByPlace[person.healthCareDistrict] = DeathsByPlace[person.healthCareDistrict]
                ? DeathsByPlace[person.healthCareDistrict] + 1
                : 1
        })

        let text = "<b>CORONA-CHAN STATS:</b>\n\n\tSick people:\n"

        for (let place in CasesByPlace) {
            if (CasesByPlace.hasOwnProperty(place)) {
                const amount = CasesByPlace[place]

                if (place === "HUS") {
                    place = "Helsinki ja Uusimaa"
                }

                text += `\t\t<i>${place}</i> : ${amount}\n`
            }
        }
        text += "\t\t<i>Etkot</i> : 1\n"
        text += `\tTotal: ${sickCases}\n\n\tDöd people:\n`

        for (let place in DeathsByPlace) {
            if (DeathsByPlace.hasOwnProperty(place)) {
                const amount = DeathsByPlace[place]

                if (place === "HUS") {
                    place = "Helsinki ja Uusimaa"
                }

                text += `\t\t<i>${place}</i> : ${amount}\n`
            }
        }
        text += "\tTotal: " + deathCases

        await axios.post(botUrl + "/sendMessage", {
            chat_id,
            text,
            parse_mode: "HTML"
        })
    } catch (e) {
        console.error(e)
    }
}
