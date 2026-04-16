import React from 'react';
import TopicWiseLayout from './TopicWiseLayout';

export default function LinkedList() {
    const seoMetadata = {
        title: 'Linked List Interview Questions | Whizan AI DSA Prep',
        description: 'Master Linked List manipulation. Solve questions like Reverse Linked List, Cycle Detection, and Merge Sorted Lists with Whizan AI.',
        keywords: 'Linked List DSA, Reverse Linked List solution, Floyd Cycle detection, coding interview problems, SDE interview prep',
        canonical: '/topicswise/linked-list'
    };

    const seoContent = (
        <>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1.5rem', color: '#fff', letterSpacing: '-0.5px' }}>
                Mastering Linked List Manipulation
            </h2>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <p>
                    <strong>Linked Lists</strong> are dynamic data structures where elements are not stored in contiguous memory. Mastering them is essential for understanding memory allocation, pointers, and recursive data relationships in low-level and high-level programming.
                </p>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', margin: '0.5rem 0 0.2rem' }}>Pointers, Cycles, and Reversals</h3>
                <p>
                    Interviewers love Linked List questions because they test your ability to handle multiple "moving parts" simultaneously. Understanding <strong>Floyd’s Cycle-Finding Algorithm</strong> (tortoise and hare) and the logic behind <strong>In-place Reversal</strong> are mandatory for any software engineering role.
                </p>
                <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <li><strong>Edge Case Resiliency:</strong> Learn to handle empty lists, single-node lists, and head/tail edge cases.</li>
                    <li><strong>Space Efficiency:</strong> Focus on O(1) space solutions by avoiding auxiliary arrays.</li>
                    <li><strong>Recursive vs Iterative:</strong> Many Linked List problems have elegant recursive solutions that test your functional programming logic.</li>
                </ul>
            </div>
        </>
    );

    return (
        <TopicWiseLayout
            topicTitle="Linked List"
            topicDescription="Master pointer-based data structures with advanced tutorials on reversals, cycle detection, and merging strategies."
            apiTopics={['Linked List']}
            accentColor="#f43f5e"
            seoMetadata={seoMetadata}
            seoContent={seoContent}
        />
    );
}
