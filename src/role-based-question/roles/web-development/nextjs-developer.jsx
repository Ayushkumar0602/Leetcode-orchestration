import React from 'react';
import RoleBasedLayout from '../../RoleBasedLayout';

const NextjsDeveloper = () => {
    const questions = [
        {
            title: "Common Next.js Developer Question",
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
            roleTitle="Next.js Developer"
            roleDescription="Master the essential technical and behavioral questions specifically curated for Next.js Developer roles in top tech companies."
            questions={questions}
            accentColor="#000000"
            skills={['SSR', 'SSG', 'App Router', 'Vercel']}
        />
    );
};

export default NextjsDeveloper;
