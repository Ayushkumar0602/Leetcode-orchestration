import React from 'react';
import RoleBasedLayout from '../../RoleBasedLayout';

const Java = () => {
    const questions = [
        {
            title: "Common Java Developer Question",
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
            roleTitle="Java Developer"
            roleDescription="Master the essential technical and behavioral questions specifically curated for Java Developer roles in top tech companies."
            questions={questions}
            accentColor="#b07219"
            skills={['Spring', 'JVM', 'Multithreading', 'Hibernate']}
        />
    );
};

export default Java;
