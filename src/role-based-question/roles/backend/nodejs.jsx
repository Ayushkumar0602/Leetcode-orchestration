import React from 'react';
import RoleBasedLayout from '../../RoleBasedLayout';

const Nodejs = () => {
    const questions = [
        {
            title: "Common Node.js Developer Question",
            summary: "Explain the core concepts and importance of your role in a modern development team.",
            difficulty: "Medium",
            answersCount: 12
        },
        {
            title: "Advanced Technical Challenge",
            summary: "How do you handle complex architectural decisions in high-scale environments?",
            difficulty: "Hard",
            answersCount: 8
        }
    ];

    return (
        <RoleBasedLayout 
            roleTitle="Node.js Developer"
            roleDescription="Master the essential technical and behavioral questions specifically curated for Node.js Developer roles in top tech companies."
            questions={questions}
            accentColor="#339933"
            skills={['Event Loop', 'Streams', 'Middleware', 'NPM']}
        />
    );
};

export default Nodejs;
