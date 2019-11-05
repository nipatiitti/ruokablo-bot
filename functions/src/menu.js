import axios from "axios"

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

export const menuToString = menu => {
    let menuString = ""

    const remove = [
        // Menus
        "Street food",
        "Fusion Kitchen",

        // Meal
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

    menu.restaurants.forEach(restaurant => {
        menuString += `<b>${restaurant.name}</b>: `
        restaurant.menus.forEach(menu => {
            if (!remove.includes(menu.name)) {
                menuString += `\t<i>${menu.name}</i>\n`
                menu.meals.forEach(meal => {
                    if (!remove.includes(meal.name)) {
                        menuString += `\t\t<b>${meal.name} - </b>`
                        meal.contents.forEach((food, index) => {
                            menuString += `<code>${food.name}${index === meal.contents.length - 1 ? "" : ", "}</code>`
                        })
                        menuString += "\n"
                    }
                })
            }
        })
        menuString += "\n\n\n"
    })

    return menuString
}
