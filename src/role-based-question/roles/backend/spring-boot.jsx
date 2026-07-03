import React from 'react';
import RoleBasedLayout from '../../RoleBasedLayout';

const SpringBoot = () => {
    const questions = [
        {
            title: "Common Spring Boot Developer Question",
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
            roleTitle="Spring Boot Developer"
            roleDescription="Master the essential technical and behavioral questions specifically curated for Spring Boot Developer roles in top tech companies."
            questions={questions}
            accentColor="#6db33f"
            skills={['Microservices', 'RESTful', 'Security', 'JPA']}
        />
    );
};

export default SpringBoot;
