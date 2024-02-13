import fs from 'fs';
import readline from 'readline';

// Path to your log file
const logFilePath = 'v3_backup.log';
const resultFilePath = 'analyze_result.log';

// Create a read stream and a readline interface
const readStream = fs.createReadStream(logFilePath);
const rl = readline.createInterface({
    input: readStream,
    crlfDelay: Infinity
});

const analysis = {};

rl.on('line', (line) => {
    const entry = JSON.parse(line);
    const { ticker, price_delta, time } = entry;  // Include 'time' in the destructuring

    if (!analysis[ticker]) {
        analysis[ticker] = {
            highest: price_delta,
            lowest: price_delta,
            sum: 0,
            count: 0,
            abovePointOne: 0,
            belowMinusPointOne: 0,
            deltas: []
        };
    }

    if (price_delta > analysis[ticker].highest) analysis[ticker].highest = price_delta;
    if (price_delta < analysis[ticker].lowest) analysis[ticker].lowest = price_delta;

    analysis[ticker].sum += price_delta;
    analysis[ticker].count++;

    if (price_delta > 0.1) analysis[ticker].abovePointOne++;  // Store the time when price_delta is above one
    if (price_delta < -0.1) analysis[ticker].belowMinusPointOne++;

    // Add the price_delta to the deltas array for the ticker
    analysis[ticker].deltas.push(price_delta);
});

rl.on('close', () => {
    Object.keys(analysis).forEach(ticker => {
        // Calculate the average only once
        const average = analysis[ticker].sum / analysis[ticker].count;
        analysis[ticker].average = Number(average.toFixed(4));


        const sortedDeltas = analysis[ticker].deltas.sort((a, b) => a - b);
        analysis[ticker].q1 = calculateQuartile(sortedDeltas, 0.25);
        analysis[ticker].q2 = calculateQuartile(sortedDeltas, 0.5); // Median
        analysis[ticker].q3 = calculateQuartile(sortedDeltas, 0.75);

        // Clean up by removing deltas array and computing average
        analysis[ticker].average = analysis[ticker].sum / analysis[ticker].count;
        delete analysis[ticker].sum;
        delete analysis[ticker].count;
        delete analysis[ticker].deltas; // Remove the deltas array to clean up the final object
    });

    // Write the analysis result to a file
    fs.writeFile(resultFilePath, JSON.stringify(analysis, null, 2), (err) => {
        if (err) throw err;
        console.log(`Analysis results are saved to ${resultFilePath}`);
    });
});

function calculateQuartile(data, q) {
    const pos = (data.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;

    if (data[base + 1] !== undefined) {
        return data[base] + rest * (data[base + 1] - data[base]);
    } else {
        return data[base];
    }
}
