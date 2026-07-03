import React from 'react';
import RoleBasedLayout from '../../RoleBasedLayout';

const FrontendDeveloper = () => {
    const questions = [
        {
            title: "Common Frontend Developer Question",
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
            roleTitle="Frontend Developer"
            roleDescription="Master the essential technical and behavioral questions specifically curated for Frontend Developer roles in top tech companies."
            questions={questions}
            accentColor="#6366f1"
            skills={['React', 'CSS', 'Performance', 'HTML', 'JS']}
        />
    );
};

export default FrontendDeveloper;
