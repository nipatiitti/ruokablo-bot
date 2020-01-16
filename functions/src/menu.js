import axios from "axios"
import dayjs from "dayjs"

import { botUrl } from "./index"

export const sendMenu = async (chat_id, nightMenu = false) => {
    try {
        const menu = menuToString((await getMenu(dayjs().format("YYYY-MM-DD"))).data, nightMenu)

        await axios.post(botUrl + "/sendMessage", {
            chat_id,
            text: menu,
            parse_mode: "HTML"
        })
    } catch (e) {
        console.error(e)
    }
}

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

export const menuToString = (menu, nightMenu = false) => {
    let menuString = ""

    let remove = []

    let mealsToRemove = []

    if (nightMenu) {
        remove = [
            // Restaurants
            "Hertsi",
            "Ravintola Newton"
        ]

        mealsToRemove = [
            "A´la carte (10.30 - 14.00)",
            "special (10.30 - 14.00)",
            "leipäateria",
            "salaattiaterian proteiiniosa",
            "lounas",
            "vegaaninen kasviskeitto",
            "vegaaninen kasvislounas",
            "jälkiruoka"
        ]
    } else {
        remove = [
            // Menus
            "Fusion Kitchen"
        ]

        mealsToRemove = [
            "Lämmin salaatti",
            "Wok / Pasta / Burger / Grill",
            "Erikoislounas",
            "Iltaruoka (16.00 - 18.00)",
            "A´la carte (10.30 - 14.00)",
            "special (10.30 - 14.00)",
            "leipäateria",
            "salaattiaterian proteiiniosa",
            "Warm Salad",
            "Grill",
            "Pasta",
            "Kasviskeitto",
            "kasviskeitto"
        ]
    }

    menu.restaurants.forEach(restaurant => {
        if (!remove.includes(restaurant.name)) {
            menuString += `<b>${restaurant.name}</b>: `
            restaurant.menus.forEach(menu => {
                if (!remove.includes(menu.name)) {
                    menuString += menu.name === "Street food" ? `\n\t<i>${menu.name}</i>\n` : `\t<i>${menu.name}</i>\n`
                    menu.meals.forEach(meal => {
                        if (!mealsToRemove.includes(meal.name)) {
                            menuString += `\t\t<b>${meal.name} - </b>`
                            meal.contents.forEach((food, index) => {
                                menuString += `<code>${food.name}${
                                    index === meal.contents.length - 1 ? "" : ", "
                                }</code>`
                            })
                            menuString += "\n"
                        }
                    })
                }
            })
            menuString += "\n\n\n"
        }
    })

    return menuString
}
