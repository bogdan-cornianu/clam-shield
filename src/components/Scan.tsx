import React, { useState, useEffect } from 'react';

interface ScanProps {
    setStatusMessage: (message: string) => void;
}

interface ScanResult {
    file: string;
    status: string;
    virus?: string; // Only for infected files
}

const Scan: React.FC<ScanProps> = ({ setStatusMessage }) => {
    const [directory, setDirectory] = useState('');
    const [scanResults, setScanResults] = useState<ScanResult[]>([]);

    const handleBrowse = async () => {
        const directory = await window.electronAPI.openDirectory();
        if (directory) {
            setDirectory(directory);
        }
    };

    const handleScan = () => {
        if (directory) {
            // setStatusMessage('Starting scan...');
            setScanResults([]); // Clear previous results before starting a new scan
            window.electronAPI.scanDirectory(directory, 10); // Start scan
        }
    };

    // Update scan results as they come in
    useEffect(() => {
        const onScanStatus = (event: any, message: { file: string; status: string; virus?: string }) => {
            setScanResults((prevResults) => [
                ...prevResults,
                { file: message.file, status: message.status, virus: message.virus },
            ]);
        };

        window.electronAPI.onScanStatus(onScanStatus);

        // Cleanup the event listener when the component is unmounted
        return () => {
            window.electronAPI.removeScanStatusListener(onScanStatus);
        };
    }, []);

    return (
        <div className="scan">
            <h2>Scan a Directory</h2>
            <input type="text" value={directory} readOnly placeholder="Select a directory"/>
            <button onClick={handleBrowse}>Browse</button>
            <button onClick={handleScan} disabled={!directory}>Start Scan</button>

            <h3>Scanned Files</h3>
            <div className="scan-results-container">
                <ul className="scan-results">
                    {scanResults.length === 0 ? (
                        <p>No files scanned yet</p>
                    ) : (
                        scanResults.map((result, index) => (
                            <li key={index}>
                                {result.file}: {result.status}
                                {result.status === 'infected' && result.virus && ` (Virus: ${result.virus})`}
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
};

export default Scan;
