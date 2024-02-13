const fs = require('fs');
const path = require('path');
const { getCurrentDYDX } = require('./utils/dydx_v3'); // Assume this function will be exported from dydx_v3.js
const { getCurrentBinance} = require('./utils/binance_futures'); // Assume this function will be exported from binance_futures.js

const logDataToFile = (data) => {
    const logFilePath = path.join(__dirname, 'v3_price.log');
    fs.appendFile(logFilePath, JSON.stringify(data) + '\n', (err) => {
        if (err) {
            console.error('Error writing to log file:', err);
        }
    });
};

const tickers = [
    'SUSHI-USD', 'LTC-USD',   'ALGO-USD',
    'MKR-USD',   'CELO-USD',  'ICP-USD',
    'BCH-USD',   'LINK-USD',  'DOGE-USD',
    'MATIC-USD', 'COMP-USD',  'XTZ-USD',
    'YFI-USD',   'ADA-USD',   'SOL-USD',
    'AAVE-USD',  'XLM-USD',   'AVAX-USD',
    'XMR-USD',   'ATOM-USD',  'EOS-USD',
    'ENJ-USD',   'SNX-USD',
    'NEAR-USD',  '1INCH-USD', 'ZRX-USD',
    'UNI-USD',   'TRX-USD',   'DOT-USD',
    'ETH-USD',   'CRV-USD',   'ZEC-USD',
    'UMA-USD',   'RUNE-USD',  'FIL-USD',
    'BTC-USD',   'ETC-USD'
];

async function logPriceDelta() {
    for (const ticker of tickers) { // Changed 'in' to 'of' for iterating over array elements
        try {
            const dydxPrice = await getCurrentDYDX([ticker]); // Get Price in DYDX

            const symbol = ticker.replace('-USD','USDT');
            const binancePrice = await getCurrentBinance(symbol);
            const price_delta = Number(((dydxPrice - binancePrice) / binancePrice * 100).toFixed(4));

            const logEntry = {
                time: new Date().toISOString(),
                ticker: ticker,
                dydxPrice: dydxPrice,
                binancePrice: binancePrice,
                price_delta: price_delta
            };

            logDataToFile(logEntry);
        } catch (error) {
            console.error(`Error fetching price for ${ticker}:`, error);
        }
    }
}

logPriceDelta();

module.exports = {
    logPriceDelta
}