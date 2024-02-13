const axios = require('axios');
const fs = require('fs');
const path = require('path');

const logDataToFile = (data) => {
    const logFilePath = path.join(__dirname, 'price.log');
    fs.appendFile(logFilePath, JSON.stringify(data) + '\n', (err) => {
        if (err) {
            console.error('Error writing to log file:', err);
        }
    });
};

const fetchDYDXData = async () => {
    try {
        const response = await axios.get('https://indexer.dydx.trade/v4/perpetualMarkets?');
        return response.data.markets;
    } catch (error) {
        console.error('Error fetching DYDX data:', error);
    }
};

const fetchDYDXPrice = async (ticker) => {
    try {
        const response = await axios.get(`https://indexer.dydx.trade/v4/candles/perpetualMarkets/${ticker}`, {
            params: {
                resolution: '1MIN',
                limit: '1' // 최근 캔들 데이터만 가져옵니다.
            }
        });

        const candles = response.data.candles;
        if (candles && candles.length > 0) {
            const lastCandle = candles[0];
            return lastCandle.close; // 마지막 캔들의 종가를 반환합니다.
        } else {
            console.error(`No candle data found for ticker ${ticker}`);
            return null;
        }
    } catch (error) {
        console.error(`Error fetching DYDX candle data for ticker ${ticker}:`, error);
        return null;
    }
};


const fetchBinancePrice = async (symbol) => {
    try {
        const response = await axios.get(`https://fapi.binance.com/fapi/v1/ticker/price?symbol=${symbol}`);
        return response.data.price;
    } catch (error) {
        console.error('Error fetching Binance data:', error);
    }
};

const checkAndPrintPrices = async () => {
    const dydxData = await fetchDYDXData();
    let priceData = [];

    if (!dydxData) {
        console.error('Failed to fetch data from DYDX');
        return [];
    }

    for (let market in dydxData) {
        if (dydxData[market].ticker) {
            let dydxTicker = dydxData[market].ticker;
            let binanceTicker = dydxData[market].ticker.replace('-USD', 'USDT');

            if (binanceTicker === 'SHIBUSDT' || binanceTicker === 'PEPEUSDT') {
                binanceTicker = '1000' + binanceTicker;
            }

            try {
                let binancePrice = await fetchBinancePrice(binanceTicker);
                let dydxPrice = await fetchDYDXPrice(dydxTicker);

                if (binanceTicker === '1000SHIBUSDT' || binanceTicker === '1000PEPEUSDT') {
                    dydxPrice *= 1000;
                }

                if (binancePrice) {
                    const price_delta = Number(((dydxPrice - binancePrice) / binancePrice * 100).toFixed(4));
                    const logEntry = {
                        time: new Date().toISOString(),
                        ticker: dydxTicker,
                        dydxPrice: dydxPrice,
                        binancePrice: binancePrice,
                        price_delta: price_delta
                    };
                    logDataToFile(logEntry);
                    priceData.push(logEntry);
                }
            } catch (error) {
                console.log(`Error fetching price for ${binanceTicker}:`, error.message);
            }
        } else {
            console.log(`No ticker found for market: ${market}`);
        }
    }

    return priceData;
};


checkAndPrintPrices();

// 다른 파일에서 이 함수들을 사용할 수 있도록 모듈로 내보냅니다.
module.exports = {
    fetchDYDXData,
    fetchDYDXPrice,
    fetchBinancePrice,
    checkAndPrintPrices
};

