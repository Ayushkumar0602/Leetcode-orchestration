import React from 'react';
import TopicWiseLayout from './TopicWiseLayout';

export default function Tries() {
    const seoMetadata = {
        title: 'Trie (Prefix Tree) Interview Questions | Whizan AI DSA Prep',
        description: 'Master Tries for string manipulation and prefix search. Solve Implement Trie, Word Search II, and Auto-complete problems.',
        keywords: 'Trie data structure, Prefix Tree DSA, Implement Trie solution, Word Search II, coding interview prep',
        canonical: '/topicswise/tries'
    };

    const seoContent = (
        <>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1.5rem', color: '#fff', letterSpacing: '-0.5px' }}>
                Mastering Tries: The Efficient Prefix Search
            </h2>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <p>
                    A <strong>Trie</strong>, also known as a <strong>Prefix Tree</strong>, is an specialized retrieval tree optimized for string operations. It allows for extremely fast searches based on prefixes, making it the standard choice for systems like search auto-complete, spell checkers, and IP routing.
                </p>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', margin: '0.5rem 0 0.2rem' }}>Space-Efficient String Storage</h3>
                <p>
                    While Tries can consume significant memory, they offer unparalleled efficiency for checking if a string or prefix exists in a large dictionary. In interviews, you'll often be asked to "Implement a Trie" or use it as a sub-component in complex problems like <strong>Word Search II</strong>.
                </p>
                <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <li><strong>Prefix Searching:</strong> Constant time O(L) where L is the length of the string, regardless of the size of the dictionary.</li>
                    <li><strong>Suffix Tries:</strong> Advanced variations used for pattern matching within a single large text.</li>
                    <li><strong>Recursive implementation:</strong> Understanding how each node represents a character and contains a map or array of its children.</li>
                </ul>
            </div>
        </>
    );

    return (
        <TopicWiseLayout
            topicTitle="Tries"
            topicDescription="Optimize string search and retrieval with prefix trees, essential for building efficient auto-complete and dictionary systems."
            apiTopics={['Trie']}
            accentColor="#d946ef"
            seoMetadata={seoMetadata}
            seoContent={seoContent}
        />
    );
}
