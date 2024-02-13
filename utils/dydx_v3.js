class APIClient {
    constructor() {
        this.baseURL = 'https://api.dydx.exchange';
    }

    async getOrderbook(market) {
        try {
            const response = await fetch(`${this.baseURL}/v3/orderbook/${market}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching orderbook for market', market, error);
            throw error;
        }
    }
}

// Usage
const client = new APIClient();

exports.getCurrentDYDX = async function(ticker) {
    try {
        const orderbook = await client.getOrderbook(ticker);
        const CurrentPrice = orderbook.asks[0].price;
        return CurrentPrice;
    } catch (error) {
        console.error(`An error occurred fetching the first ask for ${ticker}:`, error);
    }
};

