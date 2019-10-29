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
