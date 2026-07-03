import React from 'react';
import RoleBasedLayout from '../../RoleBasedLayout';

const Django = () => {
    const questions = [
        {
            title: "Common Django Developer Question",
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
            roleTitle="Django Developer"
            roleDescription="Master the essential technical and behavioral questions specifically curated for Django Developer roles in top tech companies."
            questions={questions}
            accentColor="#092e20"
            skills={['ORM', 'Admin', 'DRF', 'MTV']}
        />
    );
};

export default Django;
