import React from 'react';
import TopicWiseLayout from './TopicWiseLayout';

export default function Trees() {
    const seoMetadata = {
        title: 'Binary Tree & BST Interview Questions | Whizan AI DSA Prep',
        description: 'Master Binary Trees, BSTs, and traversals (DFS/BFS). Practice Maximum Depth, Diameter, and Lowest Common Ancestor problems with Whizan AI.',
        keywords: 'Binary Tree DSA, BST interview questions, DFS BFS traversal, Tree algorithms, coding interview prep',
        canonical: '/topicswise/trees'
    };

    const seoContent = (
        <>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1.5rem', color: '#fff', letterSpacing: '-0.5px' }}>
                Mastering Binary Trees and BSTs
            </h2>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <p>
                    <strong>Trees</strong> are non-linear, hierarchical data structures that serve as the foundation for many complex systems, from file systems to databases. In interviews, <strong>Binary Trees</strong> and <strong>Binary Search Trees (BST)</strong> are favorite topics for testing recursive thinking.
                </p>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', margin: '0.5rem 0 0.2rem' }}>DFS, BFS, and Recursive Intuition</h3>
                <p>
                    Solving tree problems effectively requires a deep understanding of <strong>Depth-First Search (DFS)</strong> (Pre-order, In-order, Post-order) and <strong>Breadth-First Search (BFS)</strong> (Level-order). Mastering the transition between recursive and iterative traversal is a key differentiator in senior-level interviews.
                </p>
                <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <li><strong>Pathfinding:</strong> Finding maximum paths, diameters, and lowest common ancestors.</li>
                    <li><strong>Tree Construction:</strong> Building trees from traversal arrays (In-order/Pre-order).</li>
                    <li><strong>BST Properties:</strong> Leveraging sorted properties for O(log n) lookups and validations.</li>
                </ul>
            </div>
        </>
    );

    return (
        <TopicWiseLayout
            topicTitle="Trees"
            topicDescription="Deep dive into hierarchical data structures, binary search trees, and advanced traversal techniques like DFS and BFS."
            apiTopics={['Tree', 'Binary Search Tree']}
            accentColor="#84cc16"
            seoMetadata={seoMetadata}
            seoContent={seoContent}
        />
    );
}
