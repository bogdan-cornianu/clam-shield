import './renderer.css';

const scanResults = document.getElementById('scanResults') as HTMLDivElement;
const databaseStatus = document.getElementById('databaseStatus') as HTMLParagraphElement;
const scanButton = document.getElementById('scanButton') as HTMLButtonElement;
const directoryInput = document.getElementById('directoryPath') as HTMLInputElement;
const browseButton = document.getElementById('browseButton') as HTMLButtonElement;

// Handle the browse button click
browseButton.addEventListener('click', async () => {
  try {
    const selectedDirectory = await window.electronAPI.openDirectory();
    if (selectedDirectory) {
      directoryInput.value = selectedDirectory; // Set the input value to the selected directory
    }
  } catch (error) {
    console.error('Failed to open directory:', error);
  }
});

// Handle the scan button click
scanButton.addEventListener('click', () => {
  const directoryPath = directoryInput.value;
  if (directoryPath) {
    const maxSizeMB = 10; // Define max size in MB for scanning
    // scanButton.disabled = true;
    window.electronAPI.scanDirectory(directoryPath, maxSizeMB);
  } else {
    console.error('No directory path specified.');
  }
});

window.electronAPI.onDatabaseStatus((event, message) => {
  databaseStatus.textContent = message;
});

window.electronAPI.onScanStatus((event, message) => {
  const result = document.createElement('div');
  result.textContent = `${message}`;
  scanResults.appendChild(result);
  // scanButton.disabled = false;
});
