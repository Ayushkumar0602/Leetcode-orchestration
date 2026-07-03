import React from 'react';
import RoleBasedLayout from '../../RoleBasedLayout';

const AutomationTesting = () => {
    const questions = [
        {
            title: "Common Automation Tester Question",
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
            roleTitle="Automation Tester"
            roleDescription="Master the essential technical and behavioral questions specifically curated for Automation Tester roles in top tech companies."
            questions={questions}
            accentColor="#4f46e5"
            skills={['Cypress', 'Selenium', 'Playwright', 'CI/CD']}
        />
    );
};

export default AutomationTesting;
