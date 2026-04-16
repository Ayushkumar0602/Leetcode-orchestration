import React from 'react';
import TopicWiseLayout from './TopicWiseLayout';

export default function TwoPointers() {
    const seoMetadata = {
        title: 'Two Pointers Interview Questions | Whizan AI DSA Prep',
        description: 'Master Two Pointers techniques for coding interviews. Solve problems like 3Sum, Trapping Rain Water, and Palindrome checks with Whizan AI.',
        keywords: 'Two Pointers technique, coding interview problems, 3Sum solution, Trapping Rain Water DSA, software engineering prep',
        canonical: '/topicswise/two-pointers'
    };

    const seoContent = (
        <>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1.5rem', color: '#fff', letterSpacing: '-0.5px' }}>
                Mastering the Two Pointers Technique
            </h2>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <p>
                    The <strong>Two Pointers</strong> technique is an extremely powerful optimization strategy for linear data structures. By using two indices (often starting at opposite ends or one trailing the other), you can frequently reduce O(n²) exhaustive search algorithms to O(n) linear time complexity.
                </p>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', margin: '0.5rem 0 0.2rem' }}>When to Use Two Pointers?</h3>
                <p>
                    This pattern is most effective on <strong>sorted arrays</strong> or Linked Lists. Common interview problems like "Container With Most Water", "3Sum", and "Valid Palindrome" are best solved using this approach. It tests your ability to reason about boundaries and state changes within a single pass.
                </p>
                <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <li><strong>Opposite Ends:</strong> Pointers start at index 0 and n-1, moving inward based on comparison results.</li>
                    <li><strong>Slow/Fast Pointers:</strong> One pointer moves faster than the other, often used to find cycles or midpoints in Linked Lists.</li>
                    <li><strong>In-place Modification:</strong> Using pointers to modify an array without allocating extra space (O(1) space complexity).</li>
                </ul>
            </div>
        </>
    );

    return (
        <TopicWiseLayout
            topicTitle="Two Pointers"
            topicDescription="Optimize linear data structures by mastering the powerful two-pointer pattern for sorted arrays and linked lists."
            apiTopics={['Two Pointers']}
            accentColor="#8b5cf6"
            seoMetadata={seoMetadata}
            seoContent={seoContent}
        />
    );
}
