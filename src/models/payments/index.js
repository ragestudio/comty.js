import request from "../../request"

export default class PaymentsModel {
    /**
     * Fetches the current balance from the server.
     *
     * @return {object} The balance data received from the server.
     */
    static async fetchBalance() {
        const response = await request({
            method: "GET",
            url: "/payments/balance",
        })

        return response.data.balance
    }
}