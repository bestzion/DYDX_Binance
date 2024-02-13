// hwang_server.js
const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const { checkAndPrintPrices } = require('./DYDX_Binance_Price_Check');
const { logPriceDelta } = require('./v3_price_delta')

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/main.html');
});

app.get('/v3', (req, res) => {
    res.sendFile(__dirname + '/public/v3.html');
});

// 로그 파일에서 데이터를 읽어오는 함수
const getLoggedData = () => {
    const logFilePath = path.join(__dirname, 'price.log');
    return new Promise((resolve, reject) => {
        fs.readFile(logFilePath, 'utf8', (err, data) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    resolve([]); // 파일이 없는 경우 빈 배열 반환
                } else {
                    reject(err);
                }
            } else {
                const lines = data.trim().split('\n');
                const entries = lines.map(line => {
                    try {
                        return JSON.parse(line);
                    } catch (e) {
                        console.error('Error parsing line from log file', e);
                        return null;
                    }
                }).filter(entry => entry !== null);
                resolve(entries);
            }
        });
    });
};

// Function to read data from v3_price.log
const getV3LoggedData = () => {
    const v3LogFilePath = path.join(__dirname, 'v3_price.log');
    return new Promise((resolve, reject) => {
        fs.readFile(v3LogFilePath, 'utf8', (err, data) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    resolve([]); // If the file doesn't exist, return an empty array
                } else {
                    reject(err); // Reject the promise with the error
                }
            } else {
                const lines = data.trim().split('\n');
                const entries = lines.map(line => {
                    try {
                        return JSON.parse(line);
                    } catch (e) {
                        console.error('Error parsing line from v3 log file', e);
                        return null;
                    }
                }).filter(entry => entry !== null);
                resolve(entries); // Resolve the promise with the parsed entries
            }
        });
    });
};



// 클라이언트가 연결될 때 로그된 데이터를 전송하는 이벤트
io.on('connection', async (socket) => {
    try {
        const loggedData = await getLoggedData();
        socket.emit('loggedData', loggedData); // 로그 데이터 전송

        const v3LoggedData = await getV3LoggedData();
        socket.emit('v3LoggedData', v3LoggedData); // Send the V3 log data

    } catch (err) {
        console.error('Error sending logged data:', err);
    }
});

const broadcastPriceData = async () => {
    const priceData = await checkAndPrintPrices();
    if (priceData && priceData.length > 0) {
        io.emit('priceData', priceData);
    }
    const v3priceData = await logPriceDelta();
    if (v3priceData && v3priceData.length > 0) {
        io.emit('v3priceData', v3priceData)
    }

};

setInterval(broadcastPriceData, 60000);

http.listen(3000, () => {
    console.log('Server is running on port 3000');
});
