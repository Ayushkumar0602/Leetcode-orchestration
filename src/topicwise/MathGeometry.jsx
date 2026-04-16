import React from 'react';
import TopicWiseLayout from './TopicWiseLayout';

export default function MathGeometry() {
    const seoMetadata = {
        title: 'Math & Geometry Interview Questions | Whizan AI DSA Prep',
        description: 'Solve Math and Geometry problems for coding interviews. Master Rotate Image, Spiral Matrix, and Set Matrix Zeroes with Whizan AI.',
        keywords: 'Math for coding interviews, Geometry algorithms, Matrix rotation solution, Spiral Matrix DSA, coding interview prep',
        canonical: '/topicswise/math-geometry'
    };

    const seoContent = (
        <>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1.5rem', color: '#fff', letterSpacing: '-0.5px' }}>
                Mastering Math and Geometry in Interviews
            </h2>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <p>
                    <strong>Math and Geometry</strong> questions test your ability to convert mathematical formulas and spatial relationships into logical code. While they often involve 2D matrices, they primarily assess your mastery of coordinates, symmetries, and number theory.
                </p>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', margin: '0.5rem 0 0.2rem' }}>Matrices and 2D Symmetries</h3>
                <p>
                    A significant portion of geometry interviews involves <strong>In-place Matrix Rotation</strong> and <strong>Spiral Traversal</strong>. These problems require careful boundary management and index calculation. Mastering these reveals a developer's attention to detail and precision.
                </p>
                <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <li><strong>Index Mapping:</strong> Transposing matrices and flipping indices to achieve 90-degree rotations in O(1) extra space.</li>
                    <li><strong>Number Theory:</strong> Working with prime factorization, GCD, and modular arithmetic for high-performance math queries.</li>
                    <li><strong>Spatial Logic:</strong> Solving problems related to lines, circles, and bounding boxes in a 2D coordinate system.</li>
                </ul>
            </div>
        </>
    );

    return (
        <TopicWiseLayout
            topicTitle="Math & Geometry"
            topicDescription="Master spatial relationships, matrix transformations, and number theory fundamentals for technical interview success."
            apiTopics={['Math', 'Geometry']}
            accentColor="#2dd4bf"
            seoMetadata={seoMetadata}
            seoContent={seoContent}
        />
    );
}
