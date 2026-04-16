import React from 'react';
import TopicWiseLayout from './TopicWiseLayout';

export default function Backtracking() {
    const seoMetadata = {
        title: 'Backtracking Interview Questions | Whizan AI DSA Prep',
        description: 'Master Backtracking algorithms for combinatorics. Solve Subsets, Permutations, Combination Sum, and N-Queens problems.',
        keywords: 'Backtracking DSA, Subsets solution, Permutations interview question, DFS backtracking, coding interview prep',
        canonical: '/topicswise/backtracking'
    };

    const seoContent = (
        <>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1.5rem', color: '#fff', letterSpacing: '-0.5px' }}>
                Mastering Backtracking: The Systematic Search
            </h2>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <p>
                    <strong>Backtracking</strong> is an algorithmic technique that involves finding a solution incrementally by trying different options and "backing out" (removing a choice) if it doesn't lead to a valid solution. It is the core approach for solving <strong>Combinatorial</strong> and <strong>Permutation</strong> problems.
                </p>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', margin: '0.5rem 0 0.2rem' }}>State Space Trees and Pruning</h3>
                <p>
                    Efficient backtracking requires visualizing the <strong>State Space Tree</strong>. Interviewers look for your ability to optimize these algorithms through <strong>Pruning</strong>—early termination of recursive branches that cannot possibly satisfy the problem constraints.
                </p>
                <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <li><strong>Standard Patterns:</strong> Learning the generic backtracking template (choose, explore, un-choose).</li>
                    <li><strong>Handling Duplicates:</strong> Mastering the sort-and-skip strategy to handle duplicate elements in subsets or permutations.</li>
                    <li><strong>Constraint Satisfaction:</strong> Solving complex games (Sudoku) or puzzles (N-Queens) using depth-first exploration.</li>
                </ul>
            </div>
        </>
    );

    return (
        <TopicWiseLayout
            topicTitle="Backtracking"
            topicDescription="Master systematic state-space exploration and pruning techniques for solving complex combinatorial and permutation challenges."
            apiTopics={['Backtracking']}
            accentColor="#ef4444"
            seoMetadata={seoMetadata}
            seoContent={seoContent}
        />
    );
}
