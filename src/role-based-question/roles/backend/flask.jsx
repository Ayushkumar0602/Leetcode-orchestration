import React from 'react';
import RoleBasedLayout from '../../RoleBasedLayout';

const Flask = () => {
    const questions = [
        {
            title: "Common Flask Developer Question",
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
            roleTitle="Flask Developer"
            roleDescription="Master the essential technical and behavioral questions specifically curated for Flask Developer roles in top tech companies."
            questions={questions}
            accentColor="#000000"
            skills={['Blueprints', 'Jinja2', 'Werkzeug', 'Extensions']}
        />
    );
};

export default Flask;
