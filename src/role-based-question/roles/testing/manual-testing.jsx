import React from 'react';
import RoleBasedLayout from '../../RoleBasedLayout';

const ManualTesting = () => {
    const questions = [
        {
            title: "Common Manual Tester Question",
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
            roleTitle="Manual Tester"
            roleDescription="Master the essential technical and behavioral questions specifically curated for Manual Tester roles in top tech companies."
            questions={questions}
            accentColor="#fbbf24"
            skills={['Test Cases', 'UAT', 'Regression', 'UI/UX']}
        />
    );
};

export default ManualTesting;
