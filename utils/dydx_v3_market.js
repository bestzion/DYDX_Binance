class APIClient {
    constructor() {
        this.baseURL = 'https://api.dydx.exchange';
    }

    async getMarkets() {
        try {
            const response = await fetch(`${this.baseURL}/v3/markets`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching markets:', error);
            throw error;
        }
    }
}

// Usage
const client = new APIClient();

client.getMarkets()
    .then(data => {
        const markets = data.markets;
        const tickers = Object.keys(markets);
        console.log('Available tickers in the dYdX market:', tickers);
    })
    .catch(error => {
        console.error('An error occurred:', error);
    });
