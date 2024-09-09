import React from 'react';

interface NavigationProps {
    setActiveComponent: (component: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ setActiveComponent }) => {
    return (
        <nav>
            <ul>
                <li onClick={() => setActiveComponent('scan')}>Scan</li>
                <li onClick={() => setActiveComponent('settings')}>Settings</li>
                <li onClick={() => setActiveComponent('quarantine')}>Quarantine</li>
                <li onClick={() => setActiveComponent('about')}>About</li>
            </ul>
        </nav>
    );
};

export default Navigation;
