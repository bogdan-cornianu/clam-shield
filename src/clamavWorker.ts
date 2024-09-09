const { parentPort } = require('worker_threads');
const clamavLib = require('./clamavlib');

let clamavEngine = null;

// Load the ClamAV database and store the engine in the worker
function loadClamAVDatabase() {
    try {
        if (!clamavLib.initializeClamAV()) {
            parentPort?.postMessage({ status: 'error', message: 'Failed to initialize ClamAV' });
            return;
        }

        // Create the ClamAV engine
        clamavEngine = clamavLib.createClamAVEngine();
        const dbPath = '/var/lib/clamav';  // Adjust this path

        // Load the virus signature database
        const sigCount = clamavLib.loadClamAVDatabase(clamavEngine, dbPath);
        parentPort?.postMessage({ status: 'success', sigCount });
    } catch (error) {
        parentPort?.postMessage({ status: 'error', message: `Error loading database: ${error.message}` });
    }
}

function performScan(filePath, maxSizeMB) {
    console.log(`Scanning directory: ${filePath}`);

    if (!clamavLib.initializeClamAV()) {
        console.error('Failed to initialize ClamAV');
        process.exit(1);
    }

    try {
        clamavLib.compileClamAVEngine(clamavEngine);

        const maxSizeMB = 10;
        clamavLib.scanDirectory(clamavEngine, filePath, maxSizeMB, (filePath, status) => {
            console.log(`${filePath}: ${status}`);
            parentPort.postMessage(`${filePath}: ${status}`);
        });

        parentPort.postMessage({ status: 'scan-completed', message: 'Scan completed.' });
        clamavLib.freeClamAVEngine(clamavEngine);
    } catch (error) {
        console.error(`An error occurred: ${error.message}`);
        parentPort.postMessage({ status: 'error', file: filePath, message: `Error scanning file: ${error.message}` });
        process.exit(1);
    }
}

// Listen for commands from the main process
parentPort?.on('message', (message) => {
    if (message.command === 'load-database') {
        loadClamAVDatabase();
    } else if (message.command === 'scan-directory') {
        performScan(message.filePath, message.maxSizeMB);
    }
});
