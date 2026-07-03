import React from 'react';
import RoleBasedLayout from '../../RoleBasedLayout';

const MlEngineer = () => {
    const questions = [
        {
            title: "Common ML Engineer Question",
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
            roleTitle="ML Engineer"
            roleDescription="Master the essential technical and behavioral questions specifically curated for ML Engineer roles in top tech companies."
            questions={questions}
            accentColor="#ffcf40"
            skills={['PyTorch', 'TensorFlow', 'MLOps', 'Model Deployment']}
        />
    );
};

export default MlEngineer;
