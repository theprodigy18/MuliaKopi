import axios from "axios"

const apiURL = import.meta.env.VITE_API_URL
const ordersAPI = `${apiURL}/orders`

export async function IsUserBuying(userId: string, setIsBuying: (isBuying: boolean) => void, setUniqueCode?: (uniqueCode: string) => void) {
    const buyingRes = (await axios.get(`${ordersAPI}/get/is-user-buying/${userId}`)).data

    if (buyingRes.success) {
        setIsBuying(true)
        setUniqueCode && setUniqueCode(buyingRes.uniqueCode)
        return
    }

    setIsBuying(false)
}