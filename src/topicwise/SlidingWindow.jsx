import React from 'react';
import TopicWiseLayout from './TopicWiseLayout';

export default function SlidingWindow() {
    const seoMetadata = {
        title: 'Sliding Window Interview Questions | Whizan AI DSA Prep',
        description: 'Learn the Sliding Window pattern for linear data structures. Solve Top K elements, Longest Substring, and Minimum Window Substring problems.',
        keywords: 'Sliding Window technique, coding interview problems, Longest Substring solution, Minimum Window Substring, DSA preparation',
        canonical: '/topicswise/sliding-window'
    };

    const seoContent = (
        <>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1.5rem', color: '#fff', letterSpacing: '-0.5px' }}>
                Mastering the Sliding Window Pattern
            </h2>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <p>
                    The <strong>Sliding Window</strong> pattern is used to perform operations on a specific window size or range within an array or string. It is particularly effective for problems that ask for the longest, shortest, or specific sum sub-segments of data.
                </p>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', margin: '0.5rem 0 0.2rem' }}>Fixed vs. Variable Windows</h3>
                <p>
                    Sliding window problems typically fall into two categories: <strong>Fixed size</strong> (where the window length is constant) and <strong>Dynamic size</strong> (where the window expands or shrinks based on conditions). Most Hard-level interview questions like "Minimum Window Substring" involve dynamic resizing.
                </p>
                <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <li><strong>Efficiency:</strong> Convert O(n²) or O(n³) nested loops into a single O(n) pass.</li>
                    <li><strong>State Management:</strong> Use hash maps or variables to track counts of characters/numbers within the current window.</li>
                    <li><strong>Optimization:</strong> Ideal for finding contiguous sub-segments in real-time data streams.</li>
                </ul>
            </div>
        </>
    );

    return (
        <TopicWiseLayout
            topicTitle="Sliding Window"
            topicDescription="Master sub-segment optimization with fixed and variable sliding windows for strings and arrays."
            apiTopics={['Sliding Window']}
            accentColor="#06b6d4"
            seoMetadata={seoMetadata}
            seoContent={seoContent}
        />
    );
}
