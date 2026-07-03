import React from 'react';
import RoleBasedLayout from '../../RoleBasedLayout';

const PromptEngineer = () => {
    const questions = [
        {
            title: "Common Prompt Engineer Question",
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
            roleTitle="Prompt Engineer"
            roleDescription="Master the essential technical and behavioral questions specifically curated for Prompt Engineer roles in top tech companies."
            questions={questions}
            accentColor="#ec4899"
            skills={['LLMs', 'Context Window', 'Chain of Thought', 'Zero-shot']}
        />
    );
};

export default PromptEngineer;
