import React from 'react';
import RoleBasedLayout from '../../RoleBasedLayout';

const BackendDeveloper = () => {
    const questions = [
        {
            title: "Common Backend Developer Question",
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
            roleTitle="Backend Developer"
            roleDescription="Master the essential technical and behavioral questions specifically curated for Backend Developer roles in top tech companies."
            questions={questions}
            accentColor="#10b981"
            skills={['APIs', 'Databases', 'System Design', 'Scalability']}
        />
    );
};

export default BackendDeveloper;
