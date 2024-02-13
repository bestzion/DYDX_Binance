// Use dynamic import to load node-fetch
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Function to get market data
async function getMarketData() {
    const headers = {
        'Accept': 'application/json'
    };

    const url = 'https://indexer.v4testnet.dydx.exchange/v4/perpetualMarkets?';

    try {
        const response = await fetch(url, { method: 'GET', headers: headers });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data);
        return data; // Returning the data for further processing if needed
    } catch (error) {
        console.error('Error fetching market data from dYdX:', error);
        // Handle the error appropriately in your application
    }
}

// Example usage
getMarketData();