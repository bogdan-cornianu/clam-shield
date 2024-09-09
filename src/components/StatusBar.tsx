import React from 'react';

interface StatusBarProps {
    statusMessage: string;
}

const StatusBar: React.FC<StatusBarProps> = ({ statusMessage }) => {
    return <div className="status-bar">{statusMessage}</div>;
};

export default StatusBar;

