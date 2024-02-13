async function getFirstAskPriceForSymbol(symbol) {
    const url = `https://fapi.binance.com/fapi/v1/depth?symbol=${symbol}&limit=5`; // limit set to 5 for minimal weight

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return parseFloat(data.asks[0][0]); // First ask price converted to number
    } catch (error) {
        console.error(`Error fetching first ask price for symbol ${symbol}:`, error);
    }
}

// Function to get the first ask for each symbol
exports.getCurrentBinance = async function (symbol) {
    try {
        const CurrentBinance = await getFirstAskPriceForSymbol(symbol);
        return CurrentBinance
    } catch (error) {
        console.error(`An error occurred fetching the first ask for ${symbol}:`, error);
    }
};
