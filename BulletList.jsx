import React from 'react';

const BulletList = ({ bullets }) => {
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    const copyAll = () => {
        const allBullets = bullets.join('\n');
        copyToClipboard(allBullets);
    };

    return (
        <div>
            <ul>
                {bullets.map((bullet, index) => (
                    <li key={index}>
                        {bullet} 
                        <button onClick={() => copyToClipboard(bullet)}>Copy</button>
                    </li>
                ))}
            </ul>
            <button onClick={copyAll}>Copy All</button>
        </div>
    );
};

export default BulletList;
