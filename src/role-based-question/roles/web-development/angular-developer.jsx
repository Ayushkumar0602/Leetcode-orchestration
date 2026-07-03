import React from 'react';
import RoleBasedLayout from '../../RoleBasedLayout';

const AngularDeveloper = () => {
    const questions = [
        {
            title: "Common Angular Developer Question",
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
            roleTitle="Angular Developer"
            roleDescription="Master the essential technical and behavioral questions specifically curated for Angular Developer roles in top tech companies."
            questions={questions}
            accentColor="#dd0031"
            skills={['TypeScript', 'RxJS', 'Directives', 'Dependency Injection']}
        />
    );
};

export default AngularDeveloper;
