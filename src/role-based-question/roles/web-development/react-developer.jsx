import React from 'react';
import RoleBasedLayout from '../../RoleBasedLayout';

const ReactDeveloper = () => {
    const questions = [
        {
            title: "Common React Developer Question",
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
            roleTitle="React Developer"
            roleDescription="Master the essential technical and behavioral questions specifically curated for React Developer roles in top tech companies."
            questions={questions}
            accentColor="#61dafb"
            skills={['Hooks', 'Context API', 'Redux', 'Virtual DOM']}
        />
    );
};

export default ReactDeveloper;
