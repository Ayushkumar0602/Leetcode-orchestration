import React from 'react';
import RoleBasedLayout from '../../RoleBasedLayout';

const DataScientist = () => {
    const questions = [
        {
            title: "Common Data Scientist Question",
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
            roleTitle="Data Scientist"
            roleDescription="Master the essential technical and behavioral questions specifically curated for Data Scientist roles in top tech companies."
            questions={questions}
            accentColor="#3776ab"
            skills={['Machine Learning', 'R', 'Deep Learning', 'NumPy']}
        />
    );
};

export default DataScientist;
