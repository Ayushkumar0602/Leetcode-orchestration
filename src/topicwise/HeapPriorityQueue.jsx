import React from 'react';
import TopicWiseLayout from './TopicWiseLayout';

export default function HeapPriorityQueue() {
    const seoMetadata = {
        title: 'Heap / Priority Queue Interview Questions | Whizan AI DSA Prep',
        description: 'Master Heaps and Priority Queues for coding interviews. Solve Kth Largest Element, Task Scheduler, and Median from Data Stream problems.',
        keywords: 'Heap data structure, Priority Queue DSA, Min-Heap Max-Heap, Top K elements solution, coding interview prep',
        canonical: '/topicswise/heap-priority-queue'
    };

    const seoContent = (
        <>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1.5rem', color: '#fff', letterSpacing: '-0.5px' }}>
                Mastering Heaps and Priority Queues
            </h2>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <p>
                    A <strong>Heap</strong> is a specialized tree-based data structure that satisfies the heap property. In technical interviews, <strong>Priority Queues</strong> (often implemented as heaps) are indispensable for problems involving "Top K" elements, real-time sorting, and greedy optimization.
                </p>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', margin: '0.5rem 0 0.2rem' }}>Min-Heaps, Max-Heaps, and Complexity</h3>
                <p>
                    Understanding the O(log n) insertion and deletion complexity of heaps is crucial. Heaps allow you to access the minimum or maximum element in O(1) time, making them far more efficient than sorting an entire array when you only need a subset of extremes.
                </p>
                <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <li><strong>Top K Patterns:</strong> Efficiently finding the most frequent or largest elements in a stream.</li>
                    <li><strong>Two-Heap Strategy:</strong> Mastering the "Median from Data Stream" pattern using a Min-Heap and a Max-Heap in tandem.</li>
                    <li><strong>Dijkstra’s Algorithm:</strong> Priority queues are the heart of efficient shortest-path graph algorithms.</li>
                </ul>
            </div>
        </>
    );

    return (
        <TopicWiseLayout
            topicTitle="Heap / Priority Queue"
            topicDescription="Optimize extreme value retrieval and real-time data sorting using Min-Heaps, Max-Heaps, and Priority Queue strategies."
            apiTopics={['Heap']}
            accentColor="#eab308"
            seoMetadata={seoMetadata}
            seoContent={seoContent}
        />
    );
}
