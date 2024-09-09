import koffi from 'koffi';
import fs from 'fs';
import path from 'path';

// Load the libclamav shared library
const clamavLib = koffi.load('libclamav.so');

// Define ClamAV function prototypes using koffi
const cl_init = clamavLib.func('int cl_init(uint32_t flags)');
const cl_engine_new = clamavLib.func('void* cl_engine_new()');
const cl_load = clamavLib.func('int cl_load(const char *path, void *engine, uint32_t *sigs, uint32_t options)');
const cl_engine_compile = clamavLib.func('int cl_engine_compile(void *engine)');
const cl_scanfile = clamavLib.func('int cl_scanfile(const char *filename, char **virus_name, uint64_t *size, void *engine, uint32_t options)');
const cl_engine_free = clamavLib.func('void cl_engine_free(void *engine)');

// Initialize ClamAV
export function initializeClamAV(): boolean {
    return cl_init(0x0) === 0;
}

// Create a new ClamAV engine
export function createClamAVEngine(): Buffer {
    const enginePtr = cl_engine_new();
    if (enginePtr === null) {
        throw new Error('Failed to create new ClamAV engine');
    }
    return enginePtr;
}

// Load ClamAV virus definitions
export function loadClamAVDatabase(enginePtr: Buffer, dbPath: string): number {
    const sigsPtr = Buffer.alloc(4); // Allocate buffer for the signature count
    const loadResult = cl_load(dbPath, enginePtr, sigsPtr, 0x0);
    if (loadResult !== 0) {
        throw new Error(`Failed to load virus database from ${dbPath}`);
    }
    return sigsPtr.readUInt32LE(0);
}

// Compile the ClamAV engine
export function compileClamAVEngine(enginePtr: Buffer): void {
    const compileResult = cl_engine_compile(enginePtr);
    if (compileResult !== 0) {
        throw new Error('Failed to compile ClamAV engine');
    }
}

// Scan a file using ClamAV
export function scanFile(enginePtr: Buffer, filePath: string, maxSizeMB: number): string | null {
    const stats = fs.statSync(filePath); // Get file stats
    const fileSizeMB = stats.size / (1024 * 1024); // Convert file size to MB

    // Check if the file size exceeds the maximum allowed size
    if (fileSizeMB > maxSizeMB) {
        console.log(`Skipping ${filePath}: File size ${fileSizeMB.toFixed(2)} MB exceeds maximum allowed size of ${maxSizeMB} MB.`);
        return null;
    }

    console.log(`Scanning file: ${filePath}`);
    const sizePtr = Buffer.alloc(8); // Allocate buffer for the file size
    const virusNamePtr = Buffer.alloc(256); // Allocate buffer for a pointer to the virus name

    const scanResult = cl_scanfile(filePath, virusNamePtr, sizePtr, enginePtr, 0x0);

    if (scanResult === 0) {
        return null; // File is clean
    } else if (scanResult > 0) {
        return virusNamePtr.toString('utf-8').replace(/\0/g, ''); // Return virus name
    } else {
        throw new Error('Error occurred during scanning');
    }
}

// Scan a directory recursively with a callback
export function scanDirectory(enginePtr: Buffer, dirPath: string, maxSizeMB: number, callback: (filePath: string, status: string) => void): void {
    // Read the directory contents
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
            // Recursively scan the subdirectory
            scanDirectory(enginePtr, fullPath, maxSizeMB, callback);
        } else if (entry.isFile()) {
            try {
                const virusName = scanFile(enginePtr, fullPath, maxSizeMB);
                if (virusName) {
                    callback(fullPath, `Infected with ${virusName}`);
                } else {
                    callback(fullPath, 'OK');
                }
            } catch (error) {
                callback(fullPath, `Error: ${error.message}`);
            }
        }
    }
}

// Free the ClamAV engine
export function freeClamAVEngine(enginePtr: Buffer): void {
    cl_engine_free(enginePtr);
}
