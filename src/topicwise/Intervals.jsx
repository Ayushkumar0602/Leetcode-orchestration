import React from 'react';
import TopicWiseLayout from './TopicWiseLayout';

export default function Intervals() {
    const seoMetadata = {
        title: 'Interval Interview Questions | Whizan AI DSA Prep',
        description: 'Master Interval manipulation algorithms. Solve Merge Intervals, Insert Interval, and Meeting Rooms problems with Whizan AI.',
        keywords: 'Merge Intervals solution, Insert Interval algorithm, Meeting Rooms DSA, overlapping intervals, coding interview prep',
        canonical: '/topicswise/intervals'
    };

    const seoContent = (
        <>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1.5rem', color: '#fff', letterSpacing: '-0.5px' }}>
                Mastering Intervals and Scheduling
            </h2>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <p>
                    <strong>Interval</strong> problems are a subset of array and greedy challenges that focus on ranges of time or numerical space. They are extremely common in interviews for calendar-based applications and resource allocation systems.
                </p>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', margin: '0.5rem 0 0.2rem' }}>Sorting and Overlapping</h3>
                <p>
                    The secret to 90% of interval problems is <strong>sorting by start time</strong>. Once sorted, most overlapping constraints can be resolved in a single linear pass. Problems like "Merge Intervals" and "Insert Interval" test your ability to handle complex conditional logic within a loop.
                </p>
                <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <li><strong>Merge Logic:</strong> Combining adjacent ranges that overlap into a single continuous range.</li>
                    <li><strong>Non-overlapping Intervals:</strong> Using greedy strategies to find the minimum removals for a conflict-free set.</li>
                    <li><strong>Resource Planning:</strong> Using Min-Heaps to track resource availability in "Meeting Rooms II" style problems.</li>
                </ul>
            </div>
        </>
    );

    return (
        <TopicWiseLayout
            topicTitle="Intervals"
            topicDescription="Learn to manage overlapping ranges, merge time blocks, and optimize resource scheduling through interval-based algorithms."
            apiTopics={['Array', 'Sort']}
            accentColor="#64748b"
            seoMetadata={seoMetadata}
            seoContent={seoContent}
        />
    );
}
