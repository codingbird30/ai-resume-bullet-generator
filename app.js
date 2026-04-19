import React, { useState, useEffect } from 'react';
import './styles.css';

const App = () => {
    const [section, setSection] = useState('');
    const [accomplishments, setAccomplishments] = useState([]);
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const storedSection = localStorage.getItem('section');
        if (storedSection) {
            setSection(storedSection);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('section', section);
    }, [section]);

    const generateBullet = () => {
        if (section) {
            const bullet = `- ${section}`;
            setAccomplishments([...accomplishments, bullet]);
            setSection('');
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert('Bullet copied to clipboard!');
    };

    return (
        <div className={darkMode ? 'app dark' : 'app'}>
            <h1>AI Resume Bullet Generator</h1>
            <button onClick={() => setDarkMode(!darkMode)}>Toggle Dark Mode</button>
            <div>
                <input
                    type="text"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    placeholder="Enter a resume section..."
                />
                <button onClick={generateBullet}>Generate Bullet</button>
            </div>
            <ul>
                {accomplishments.map((bullet, index) => (
                    <li key={index} className="bullet">
                        {bullet}
                        <button onClick={() => copyToClipboard(bullet)}>Copy</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default App;
