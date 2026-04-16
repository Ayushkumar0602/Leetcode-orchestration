import React from 'react';
import TopicWiseLayout from './TopicWiseLayout';

export default function BitManipulation() {
    const seoMetadata = {
        title: 'Bit Manipulation Interview Questions | Whizan AI DSA Prep',
        description: 'Master binary operations and bitwise techniques. Solve Number of 1 Bits, Counting Bits, and Single Number problems with Whizan AI.',
        keywords: 'Bit Manipulation DSA, bitwise AND OR XOR, Number of 1 Bits solution, binary operations, coding interview prep',
        canonical: '/topicswise/bit-manipulation'
    };

    const seoContent = (
        <>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1.5rem', color: '#fff', letterSpacing: '-0.5px' }}>
                Mastering Bit Manipulation and Binary Logic
            </h2>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <p>
                    <strong>Bit Manipulation</strong> is the act of algorithmically manipulating bits or other pieces of data shorter than a word. In interviews, bitwise operations are used to test a developer's understanding of low-level computer architecture and their ability to optimize for space and speed.
                </p>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', margin: '0.5rem 0 0.2rem' }}>AND, OR, XOR, and Shifts</h3>
                <p>
                    Effective bitwise programming requires fluency in <strong>XOR</strong> properties (like `x ^ x = 0`), <strong>AND</strong> masks for parity checks, and <strong>Bit Shifting</strong> for power-of-two calculations. These operations are performed directly by the CPU, making them significantly faster than arithmetic operations.
                </p>
                <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <li><strong>Space Optimization:</strong> Using single integers as "bitsets" to represent boolean states efficiently.</li>
                    <li><strong>Common Tricks:</strong> Mastering `n & (n-1)` to remove the lowest set bit—a trick used in many competitive programming and FAANG interviews.</li>
                    <li><strong>Binary Representation:</strong> Understanding Two's Complement and how negative numbers are handled at the bit level.</li>
                </ul>
            </div>
        </>
    );

    return (
        <TopicWiseLayout
            topicTitle="Bit Manipulation"
            topicDescription="Master low-level binary optimization, XOR properties, and efficient bitwise masks for high-speed algorithm performance."
            apiTopics={['Bit Manipulation']}
            accentColor="#94a3b8"
            seoMetadata={seoMetadata}
            seoContent={seoContent}
        />
    );
}
