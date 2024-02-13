import fs from 'fs';
import readline from 'readline';
import ProgressBar from 'progress';

async function correctPriceDelta(inputFilePath, outputFilePath) {
    // First, count the total number of lines in the file
    const totalLines = await countFileLines(inputFilePath);
    const bar = new ProgressBar('Correcting Price Delta [:bar] :percent :etas remaining', {
        total: totalLines,
        width: 30,
        complete: '=',
        incomplete: ' ',
    });

    const fileStream = fs.createReadStream(inputFilePath);

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    const correctedLines = [];

    for await (const line of rl) {
        if (!line.trim()) continue;  // Skip empty lines

        let data;
        try {
            data = JSON.parse(line);
        } catch (error) {
            console.error(`Error parsing JSON from line: ${line}`, error);
            continue;  // Skip lines that cannot be parsed as JSON
        }

        const dydxPrice = parseFloat(data.dydxPrice);
        const binancePrice = parseFloat(data.binancePrice);

        const calculatedDelta = Number((Number(((dydxPrice - binancePrice) / binancePrice) * 100).toFixed(4)));

        data.price_delta = calculatedDelta;

        correctedLines.push(JSON.stringify(data));

        // Update the progress bar
        bar.tick();
    }

    fs.writeFileSync(outputFilePath, correctedLines.join('\n'));
    console.log('Price delta corrections are complete and saved to', outputFilePath);
}

async function countFileLines(filePath) {
    let lineCount = 0;
    const fileStream = fs.createReadStream(filePath);

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    for await (const line of rl) {
        lineCount++;
    }

    return lineCount;
}

// Use the function with your file paths
correctPriceDelta('backup.log', 'correct.log');
