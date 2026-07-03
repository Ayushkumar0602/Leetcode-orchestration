import React from 'react';
import RoleBasedLayout from '../../RoleBasedLayout';

const Android = () => {
    const questions = [
        {
            title: "Common Android Developer Question",
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
            roleTitle="Android Developer"
            roleDescription="Master the essential technical and behavioral questions specifically curated for Android Developer roles in top tech companies."
            questions={questions}
            accentColor="#3ddc84"
            skills={['Kotlin', 'Jetpack Compose', 'Coroutines', 'MVVM']}
        />
    );
};

export default Android;
