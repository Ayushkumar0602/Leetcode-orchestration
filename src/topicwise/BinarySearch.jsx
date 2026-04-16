import React from 'react';
import TopicWiseLayout from './TopicWiseLayout';

export default function BinarySearch() {
    const seoMetadata = {
        title: 'Binary Search Interview Questions | Whizan AI DSA Prep',
        description: 'Master Binary Search algorithms for sorted data. Solve Rotated Array Search, Koko Eating Bananas, and 2D Matrix search problems.',
        keywords: 'Binary Search algorithm, coding interview problems, Rotated Array search, logarithmic time complexity, DSA preparation',
        canonical: '/topicswise/binary-search'
    };

    const seoContent = (
        <>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1.5rem', color: '#fff', letterSpacing: '-0.5px' }}>
                Mastering Binary Search: O(log n) Efficiency
            </h2>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <p>
                    <strong>Binary Search</strong> is the gold standard for searching in sorted datasets. By repeatedly halving the search space, it achieves <strong>logarithmic time complexity O(log n)</strong>, which is essential for working with massive scale data in production environments.
                </p>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', margin: '0.5rem 0 0.2rem' }}>Beyond Simple Search</h3>
                <p>
                    Interviewers often push binary search beyond just finding an element. You'll need to apply it to "search-space" problems (binary search on answer), such as "Koko Eating Bananas", or modify the template to handle <strong>Rotated Sorted Arrays</strong> and 2D Matrices.
                </p>
                <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <li><strong>Template Mastery:</strong> Understanding when to use <code>left &lt; right</code> vs <code>left &lt;= right</code> and how to handle midpoint overflow.</li>
                    <li><strong>Monotonic Functions:</strong> Learning to recognize binary search opportunities in any monotonic relationship, not just sorted arrays.</li>
                    <li><strong>Binary Search on Answer:</strong> Optimizing min-max problems by searching through the possible answer range.</li>
                </ul>
            </div>
        </>
    );

    return (
        <TopicWiseLayout
            topicTitle="Binary Search"
            topicDescription="Master the art of logarithmic search and its application to rotated arrays, matrices, and search-space optimization."
            apiTopics={['Binary Search']}
            accentColor="#f59e0b"
            seoMetadata={seoMetadata}
            seoContent={seoContent}
        />
    );
}
