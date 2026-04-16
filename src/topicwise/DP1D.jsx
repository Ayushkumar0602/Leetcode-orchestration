import React from 'react';
import TopicWiseLayout from './TopicWiseLayout';

export default function DP1D() {
    const seoMetadata = {
        title: '1-D Dynamic Programming Interview Questions | Whizan AI DSA Prep',
        description: 'Master 1-D Dynamic Programming (DP) for coding interviews. Solve Climbing Stairs, House Robber, and Coin Change with Whizan AI.',
        keywords: '1-D Dynamic Programming, DP algorithms, Memoization vs Tabulation, coding interview problems, SDE interview prep',
        canonical: '/topicswise/1d-dp'
    };

    const seoContent = (
        <>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1.5rem', color: '#fff', letterSpacing: '-0.5px' }}>
                Mastering 1-D Dynamic Programming
            </h2>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <p>
                    <strong>Dynamic Programming (DP)</strong> is a powerful technique for solving complex problems by breaking them down into simpler subproblems. <strong>1-D DP</strong> represents the most foundational level of this mastery, focusing on linear recurrence relations.
                </p>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', margin: '0.5rem 0 0.2rem' }}>Memoization and Tabulation</h3>
                <p>
                    The two primary approaches to DP are <strong>Top-Down (Memoization)</strong> and <strong>Bottom-Up (Tabulation)</strong>. Whizan AI prepares you to handle both by focusing on the "DP state" definition and "transition relation" which are key to solving problems like "Coin Change" and "Longest Increasing Subsequence".
                </p>
                <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <li><strong>Space Optimization:</strong> Learning to reduce O(n) space to O(1) by only keeping track of the previous few states.</li>
                    <li><strong>Overlapping Subproblems:</strong> Recognizing when recursive calls are repetitive and storing results to ensure efficiency.</li>
                    <li><strong>Optimal Substructure:</strong> Identifying when the global optimal solution can be constructed from local optimal subproblems.</li>
                </ul>
            </div>
        </>
    );

    return (
        <TopicWiseLayout
            topicTitle="1-D Dynamic Programming"
            topicDescription="Build recursive intuition and master state-space optimization for linear dynamic programming challenges."
            apiTopics={['Dynamic Programming']}
            accentColor="#4f46e5"
            seoMetadata={seoMetadata}
            seoContent={seoContent}
        />
    );
}
