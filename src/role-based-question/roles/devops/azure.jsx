import React from 'react';
import RoleBasedLayout from '../../RoleBasedLayout';

const Azure = () => {
    const questions = [
        {
            title: "Common Azure Engineer Question",
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
            roleTitle="Azure Engineer"
            roleDescription="Master the essential technical and behavioral questions specifically curated for Azure Engineer roles in top tech companies."
            questions={questions}
            accentColor="#0078d4"
            skills={['AKS', 'Functions', 'DevOps', 'Active Directory']}
        />
    );
};

export default Azure;
