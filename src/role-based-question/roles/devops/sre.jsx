import React from 'react';
import RoleBasedLayout from '../../RoleBasedLayout';

const Sre = () => {
    const questions = [
        {
            title: "Common Site Reliability Engineer Question",
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
            roleTitle="Site Reliability Engineer"
            roleDescription="Master the essential technical and behavioral questions specifically curated for Site Reliability Engineer roles in top tech companies."
            questions={questions}
            accentColor="#f04e23"
            skills={['Monitoring', 'SLA/SLO', 'On-call', 'Automation']}
        />
    );
};

export default Sre;
