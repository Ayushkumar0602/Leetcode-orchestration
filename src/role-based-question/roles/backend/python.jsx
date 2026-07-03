import React from 'react';
import RoleBasedLayout from '../../RoleBasedLayout';

const Python = () => {
    const questions = [
        {
            title: "Common Python Developer Question",
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
            roleTitle="Python Developer"
            roleDescription="Master the essential technical and behavioral questions specifically curated for Python Developer roles in top tech companies."
            questions={questions}
            accentColor="#3776ab"
            skills={['Flask', 'FastAPI', 'AsyncIO', 'OOP']}
        />
    );
};

export default Python;
