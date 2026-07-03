import React from 'react';
import RoleBasedLayout from '../../RoleBasedLayout';

const Docker = () => {
    const questions = [
        {
            title: "Common Docker Specialist Question",
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
            roleTitle="Docker Specialist"
            roleDescription="Master the essential technical and behavioral questions specifically curated for Docker Specialist roles in top tech companies."
            questions={questions}
            accentColor="#2496ed"
            skills={['Containers', 'Images', 'Registry', 'Networking']}
        />
    );
};

export default Docker;
