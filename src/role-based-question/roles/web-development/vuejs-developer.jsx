import React from 'react';
import RoleBasedLayout from '../../RoleBasedLayout';

const VuejsDeveloper = () => {
    const questions = [
        {
            title: "Common Vue.js Developer Question",
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
            roleTitle="Vue.js Developer"
            roleDescription="Master the essential technical and behavioral questions specifically curated for Vue.js Developer roles in top tech companies."
            questions={questions}
            accentColor="#42b883"
            skills={['Composition API', 'Vuex', 'Nuxt', 'Vue Router']}
        />
    );
};

export default VuejsDeveloper;
