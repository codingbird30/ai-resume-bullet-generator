import React, { useState, useEffect } from 'react';

const App = () => {
    const [darkMode, setDarkMode] = useState(false);
    const [resumeBullet, setResumeBullet] = useState('');

    useEffect(() => {
        const storedDarkMode = localStorage.getItem('darkMode');
        const storedBullet = localStorage.getItem('resumeBullet');

        if (storedDarkMode !== null) {
            setDarkMode(JSON.parse(storedDarkMode));
        }

        if (storedBullet) {
            setResumeBullet(storedBullet);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('darkMode', darkMode);
        localStorage.setItem('resumeBullet', resumeBullet);
    }, [darkMode, resumeBullet]);

    const toggleDarkMode = () => {
        setDarkMode(prev => !prev);
    };

    const handleBulletChange = (event) => {
        setResumeBullet(event.target.value);
    };

    return (
        <div style={{ background: darkMode ? '#333' : '#FFF', color: darkMode ? '#FFF' : '#000', minHeight: '100vh' }}>
            <h1>Resume Bullet Generator</h1>
            <button onClick={toggleDarkMode}>Toggle Dark Mode</button>
            <textarea
                value={resumeBullet}
                onChange={handleBulletChange}
                placeholder="Enter your resume bullet here..."
            />
            <h2>Generated Resume Bullet:</h2>
            <p>{resumeBullet}</p>
        </div>
    );
};

export default App;