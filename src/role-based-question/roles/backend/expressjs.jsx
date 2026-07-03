import React from 'react';
import RoleBasedLayout from '../../RoleBasedLayout';

const Expressjs = () => {
    const questions = [
        {
            title: "Common Express.js Specialist Question",
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
            roleTitle="Express.js Specialist"
            roleDescription="Master the essential technical and behavioral questions specifically curated for Express.js Specialist roles in top tech companies."
            questions={questions}
            accentColor="#000000"
            skills={['Routing', 'Error Handling', 'REST', 'Security']}
        />
    );
};

export default Expressjs;
