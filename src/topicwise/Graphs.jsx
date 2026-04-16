import React from 'react';
import TopicWiseLayout from './TopicWiseLayout';

export default function Graphs() {
    const seoMetadata = {
        title: 'Graph Interview Questions | Whizan AI DSA Prep',
        description: 'Master Graph algorithms (BFS/DFS, Dijkstra, Topological Sort). Solve Number of Islands, Course Schedule, and Pacific Atlantic Water Flow.',
        keywords: 'Graph DSA, BFS DFS algorithm, Topological Sort, Number of Islands solution, coding interview prep',
        canonical: '/topicswise/graphs'
    };

    const seoContent = (
        <>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1.5rem', color: '#fff', letterSpacing: '-0.5px' }}>
                Mastering Graphs: BFS, DFS, and Beyond
            </h2>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <p>
                    <strong>Graphs</strong> are versatile data structures used to represent networks, relationships, and spatial data. In engineering interviews, Graph problems test your ability to navigate complex, non-linear relationships using <strong>Breadth-First Search (BFS)</strong> and <strong>Depth-First Search (DFS)</strong>.
                </p>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', margin: '0.5rem 0 0.2rem' }}>Connectivity, Cycles, and Shortest Paths</h3>
                <p>
                    Advanced Graph questions involve <strong>Topological Sort</strong> (used for dependency management) and finding <strong>Connected Components</strong>. Problems like "Number of Islands" or "Course Schedule" are staples of high-intensity interviews at companies like Google and Meta.
                </p>
                <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <li><strong>Adjacency Lists:</strong> Understanding the most memory-efficient way to represent sparse graphs.</li>
                    <li><strong>Disjoint Set Union (DSU):</strong> An essential optimization for tracking connectivity in dynamic graphs.</li>
                    <li><strong>Cycle Detection:</strong> Using coloring techniques or DSU to identify cyclic dependencies in directed and undirected graphs.</li>
                </ul>
            </div>
        </>
    );

    return (
        <TopicWiseLayout
            topicTitle="Graphs"
            topicDescription="Explore relational data, specialized connectivity algorithms, and advanced search techniques like BFS, DFS, and Topological Sort."
            apiTopics={['Graph', 'Topological Sort']}
            accentColor="#3b82f6"
            seoMetadata={seoMetadata}
            seoContent={seoContent}
        />
    );
}
