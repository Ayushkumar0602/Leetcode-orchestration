import React from 'react';
import RoleBasedLayout from '../../RoleBasedLayout';

const AiEngineer = () => {
    const questions = [
        {
            title: "Common AI Engineer Question",
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
            roleTitle="AI Engineer"
            roleDescription="Master the essential technical and behavioral questions specifically curated for AI Engineer roles in top tech companies."
            questions={questions}
            accentColor="#6d28d9"
            skills={['LLMs', 'LangChain', 'Prompt Engineering', 'Vectors']}
        />
    );
};

export default AiEngineer;
