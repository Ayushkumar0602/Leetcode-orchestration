import React from 'react';
import RoleBasedLayout from '../../RoleBasedLayout';

const Selenium = () => {
    const questions = [
        {
            title: "Common Selenium Specialist Question",
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
            roleTitle="Selenium Specialist"
            roleDescription="Master the essential technical and behavioral questions specifically curated for Selenium Specialist roles in top tech companies."
            questions={questions}
            accentColor="#43b02a"
            skills={['Webdriver', 'Java', 'Python', 'Page Object Model']}
        />
    );
};

export default Selenium;
