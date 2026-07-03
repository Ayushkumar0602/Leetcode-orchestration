import React from 'react';
import RoleBasedLayout from '../../RoleBasedLayout';

const Ios = () => {
    const questions = [
        {
            title: "Common iOS Developer Question",
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
            roleTitle="iOS Developer"
            roleDescription="Master the essential technical and behavioral questions specifically curated for iOS Developer roles in top tech companies."
            questions={questions}
            accentColor="#000000"
            skills={['Swift', 'SwiftUI', 'Combine', 'Core Data']}
        />
    );
};

export default Ios;
