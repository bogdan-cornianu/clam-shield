import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import Scan from '../components/Scan';
import Settings from '../components/Settings';
import Quarantine from '../components/Quarantine';
import About from '../components/About';
import StatusBar from '../components/StatusBar';

const App: React.FC = () => {
    const [activeComponent, setActiveComponent] = useState('scan');
    const [statusMessage, setStatusMessage] = useState('Loading database...');

    useEffect(() => {
        const handleDatabaseStatus = (event: any, message: string) => {
            setStatusMessage(message);  // Update the status message in the StatusBar
        };

        window.electronAPI.onDatabaseStatus(handleDatabaseStatus);

        return () => {
            // Cleanup: Remove the listener when the component unmounts
            window.electronAPI.onDatabaseStatus(handleDatabaseStatus);
        };
    }, []);

    return (
        <div className="app">
            <div className="nav">
                <Navigation setActiveComponent={setActiveComponent}/>
            </div>
            <div className="content">
                {activeComponent === 'scan' && <Scan setStatusMessage={setStatusMessage}/>}
                {activeComponent === 'settings' && <Settings/>}
                {activeComponent === 'quarantine' && <Quarantine/>}
                {activeComponent === 'about' && <About/>}
            </div>
            <StatusBar statusMessage={statusMessage}/>
        </div>
    );
};

export default App;
