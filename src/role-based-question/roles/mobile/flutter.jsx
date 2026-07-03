import React from 'react';
import RoleBasedLayout from '../../RoleBasedLayout';

const Flutter = () => {
    const questions = [
        {
            title: "Common Flutter Developer Question",
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
            roleTitle="Flutter Developer"
            roleDescription="Master the essential technical and behavioral questions specifically curated for Flutter Developer roles in top tech companies."
            questions={questions}
            accentColor="#02569b"
            skills={['Dart', 'Widgets', 'State Management', 'Native Bridge']}
        />
    );
};

export default Flutter;
