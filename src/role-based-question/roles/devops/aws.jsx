import React from 'react';
import RoleBasedLayout from '../../RoleBasedLayout';

const Aws = () => {
    const questions = [
        {
            title: "Common AWS Architect Question",
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
            roleTitle="AWS Architect"
            roleDescription="Master the essential technical and behavioral questions specifically curated for AWS Architect roles in top tech companies."
            questions={questions}
            accentColor="#ff9900"
            skills={['EC2', 'Lambda', 'S3', 'CloudFormation']}
        />
    );
};

export default Aws;
