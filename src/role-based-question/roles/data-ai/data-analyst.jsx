import React from 'react';
import RoleBasedLayout from '../../RoleBasedLayout';

const DataAnalyst = () => {
    const questions = [
        {
            title: "Common Data Analyst Question",
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
            roleTitle="Data Analyst"
            roleDescription="Master the essential technical and behavioral questions specifically curated for Data Analyst roles in top tech companies."
            questions={questions}
            accentColor="#f37626"
            skills={['SQL', 'Pandas', 'Tableau', 'Statistics']}
        />
    );
};

export default DataAnalyst;
