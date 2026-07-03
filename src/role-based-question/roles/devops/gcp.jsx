import React from 'react';
import RoleBasedLayout from '../../RoleBasedLayout';

const Gcp = () => {
    const questions = [
        {
            title: "Common GCP Cloud Engineer Question",
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
            roleTitle="GCP Cloud Engineer"
            roleDescription="Master the essential technical and behavioral questions specifically curated for GCP Cloud Engineer roles in top tech companies."
            questions={questions}
            accentColor="#4285f4"
            skills={['GKE', 'BigQuery', 'Cloud Run', 'IAM']}
        />
    );
};

export default Gcp;
