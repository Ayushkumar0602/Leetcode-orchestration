import React from 'react';
import TopicWiseLayout from './TopicWiseLayout';

export default function Greedy() {
    const seoMetadata = {
        title: 'Greedy Interview Questions | Whizan AI DSA Prep',
        description: 'Master Greedy algorithms for optimization. Solve Maximum Subarray, Jump Game, and Hand of Straights with Whizan AI.',
        keywords: 'Greedy algorithm, local optimum global optimum, coding interview problems, Jump Game solution, SDE interview prep',
        canonical: '/topicswise/greedy'
    };

    const seoContent = (
        <>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1.5rem', color: '#fff', letterSpacing: '-0.5px' }}>
                Mastering Greedy Algorithms
            </h2>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <p>
                    A <strong>Greedy Algorithm</strong> builds up a solution piece by piece, always choosing the next piece that offers the most obvious and immediate benefit. While greedy choices don't always lead to global optima, for several high-frequency interview problems, they offer <strong>O(n)</strong> efficiency and highly concise code.
                </p>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', margin: '0.5rem 0 0.2rem' }}>Local vs. Global Optimum</h3>
                <p>
                    The hardest part of Greedy questions is <strong>proving</strong> that a local optimum always leads to a global optimum. Problems like "Maximum Subarray" (Kadane’s) and "Jump Game" are quintessential examples where taking the best immediate step is the mathematically correct strategy.
                </p>
                <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <li><strong>Choice Property:</strong> The ability to reach a global optimum by making locally optimal decisions.</li>
                    <li><strong>Sorting dependency:</strong> Many greedy solutions require sorting the input as a preprocessing step to establish an order of choices.</li>
                    <li><strong>Optimization:</strong> Ideal for resource scheduling, Huffman coding, and interval-based problems.</li>
                </ul>
            </div>
        </>
    );

    return (
        <TopicWiseLayout
            topicTitle="Greedy"
            topicDescription="Master locally optimal strategies and learn to prove global correctness for high-performance optimization challenges."
            apiTopics={['Greedy']}
            accentColor="#22c55e"
            seoMetadata={seoMetadata}
            seoContent={seoContent}
        />
    );
}
