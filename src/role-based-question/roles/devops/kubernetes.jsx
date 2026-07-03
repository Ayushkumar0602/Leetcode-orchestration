import React from 'react';
import RoleBasedLayout from '../../RoleBasedLayout';

const Kubernetes = () => {
    const questions = [
        {
            title: "Common Kubernetes Engineer Question",
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
            roleTitle="Kubernetes Engineer"
            roleDescription="Master the essential technical and behavioral questions specifically curated for Kubernetes Engineer roles in top tech companies."
            questions={questions}
            accentColor="#326ce5"
            skills={['Pods', 'Deployments', 'Services', 'Helm']}
        />
    );
};

export default Kubernetes;
