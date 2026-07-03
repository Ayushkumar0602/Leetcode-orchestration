import React from 'react';
import RoleBasedLayout from '../../RoleBasedLayout';

const Qa = () => {
    const questions = [
        {
            title: "Common QA Engineer Question",
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
            roleTitle="QA Engineer"
            roleDescription="Master the essential technical and behavioral questions specifically curated for QA Engineer roles in top tech companies."
            questions={questions}
            accentColor="#facc15"
            skills={['Test Planning', 'Manual Testing', 'Bugs', 'Agile']}
        />
    );
};

export default Qa;
