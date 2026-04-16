import React from 'react';
import TopicWiseLayout from './TopicWiseLayout';

export default function Stack() {
    const seoMetadata = {
        title: 'Stack Interview Questions | Whizan AI DSA Prep',
        description: 'Master the Stack data structure (LIFO). Practice Valid Parentheses, Monotonic Stacks, and Histogram problems for coding interviews.',
        keywords: 'Stack data structure, Monotonic Stack, LIFO principle, Valid Parentheses solution, coding interview prep',
        canonical: '/topicswise/stack'
    };

    const seoContent = (
        <>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1.5rem', color: '#fff', letterSpacing: '-0.5px' }}>
                Mastering Stack: LIFO and Beyond
            </h2>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <p>
                    The <strong>Stack</strong> is a fundamental linear data structure following the <strong>Last-In, First-Out (LIFO)</strong> principle. While its basic operations (push/pop) are simple, its applications in expression parsing, backtracking, and memory management are critical for technical interviews.
                </p>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', margin: '0.5rem 0 0.2rem' }}>Monotonic Stacks: The Pro Secret</h3>
                <p>
                    Intermediate to Hard interview questions often use a <strong>Monotonic Stack</strong> (elements are kept in sorted order). This is essential for finding the "Next Greater Element" or solving complex geometric problems like "Largest Rectangle in Histogram" in O(n) time.
                </p>
                <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <li><strong>Parentheses Matching:</strong> The classic "Valid Parentheses" problem uses a stack to match nested structures.</li>
                    <li><strong>Recursion Simulation:</strong> Stacks are the underlying structure of the call stack; many recursive problems can be solved iteratively using an explicit stack.</li>
                    <li><strong>Efficiency:</strong> Constant time O(1) for push, pop, and peek operations makes it extremely performant.</li>
                </ul>
            </div>
        </>
    );

    return (
        <TopicWiseLayout
            topicTitle="Stack"
            topicDescription="Understand LIFO principles and advanced monotonic stacks to solve complex linear and geometric challenges."
            apiTopics={['Stack']}
            accentColor="#10b981"
            seoMetadata={seoMetadata}
            seoContent={seoContent}
        />
    );
}
