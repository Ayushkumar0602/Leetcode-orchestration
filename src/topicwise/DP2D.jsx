import React from 'react';
import TopicWiseLayout from './TopicWiseLayout';

export default function DP2D() {
    const seoMetadata = {
        title: '2-D Dynamic Programming Interview Questions | Whizan AI DSA Prep',
        description: 'Master 2-D Dynamic Programming (DP) for coding interviews. Solve Unique Paths, Longest Common Subsequence, and Edit Distance with Whizan AI.',
        keywords: '2-D Dynamic Programming, Matrix DP, Longest Common Subsequence solution, Edit Distance algorithm, SDE interview prep',
        canonical: '/topicswise/2d-dp'
    };

    const seoContent = (
        <>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1.5rem', color: '#fff', letterSpacing: '-0.5px' }}>
                Mastering 2-D Dynamic Programming
            </h2>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <p>
                    <strong>2-D Dynamic Programming</strong> extends the concepts of state and recurrence to multi-dimensional grids or string comparisons. It is the gold standard for testing an interviewee's ability to visualize complex recursive relationships and optimize them for high-scale performance.
                </p>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', margin: '0.5rem 0 0.2rem' }}>Grids, Strings, and Matrices</h3>
                <p>
                    Most 2-D DP problems involve either navigating a <strong>Grid</strong> (e.g., "Unique Paths") or comparing two <strong>Strings</strong> (e.g., "Longest Common Subsequence"). Identifying the 2-D DP state—often represented as `dp[i][j]`—is the most critical step in formulating an O(m*n) solution.
                </p>
                <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <li><strong>String Editing:</strong> Understanding the Levenshtein distance and how to transform one string into another.</li>
                    <li><strong>Matrix Optimization:</strong> Solving path-finding and cost-minimization problems in 2D space.</li>
                    <li><strong>Space-Time Complexity:</strong> Learning to use a single row (O(n) space) instead of a full matrix when dependencies allow.</li>
                </ul>
            </div>
        </>
    );

    return (
        <TopicWiseLayout
            topicTitle="2-D Dynamic Programming"
            topicDescription="Master multi-dimensional state mapping and optimization for complex grid navigation and string alignment challenges."
            apiTopics={['Dynamic Programming']}
            accentColor="#7c3aed"
            seoMetadata={seoMetadata}
            seoContent={seoContent}
        />
    );
}
