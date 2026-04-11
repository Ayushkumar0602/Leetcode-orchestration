import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Cpu, Clock, HardDrive, Infinity, ChevronRight,
  Terminal, Code2, Layers, BarChart3, Binary, Network,
  Database, GitBranch, ArrowUpRight, Scale, Info, CheckCircle2,
  AlertCircle, Hash, Search, SortAsc, Layout, Box, GitMerge,
  Target, TrendingUp, HelpCircle, Activity
} from 'lucide-react';
import DSANotesLayout from './components/DSANotesLayout';
import './DSANotesStyles.css';

const TableOfContents = ({ items }) => {
  return (
    <div style={{
      position: 'sticky', top: '88px', background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px',
      padding: '1.5rem', maxHeight: 'calc(100vh - 120px)', overflowY: 'auto',
      width: '240px', marginLeft: '2rem', display: 'none' // Hidden by default on small screens
    }} className="dsa-toc">
      <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#a855f7', textTransform: 'uppercase', letterSpacing: '1px' }}>Chapters</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {items.map(item => (
          <a key={item.id} href={`#${item.id}`} style={{
            fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', textDecoration: 'none',
            transition: 'color 0.2s', padding: '4px 0', borderLeft: '2px solid transparent',
            paddingLeft: '12px'
          }}
            onMouseEnter={e => e.currentTarget.style.color = '#d8b4fe'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
          >
            {item.title}
          </a>
        ))}
      </div>
    </div>
  );
};

const Section = ({ id, title, icon: Icon, children }) => (
  <motion.section
    id={id}
    className="dsa-section"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '2.5rem', marginBottom: '3rem' }}
  >
    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 25px 0', display: 'flex', alignItems: 'center', gap: '15px', color: '#fff' }}>
      <Icon size={28} color="#a855f7" /> {title}
    </h2>
    {children}
  </motion.section>
);

const ComplexityCard = ({ complexity, label, description, color }) => (
  <div style={{
    background: 'rgba(0,0,0,0.3)', border: `1px solid ${color}44`,
    borderRadius: '12px', padding: '1.5rem', transition: 'transform 0.3s',
    cursor: 'default'
  }}
    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
    onMouseLeave={e => e.currentTarget.style.transform = 'none'}
  >
    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: color, marginBottom: '8px' }}>{complexity}</div>
    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>{label}</div>
    <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{description}</p>
  </div>
);

const BigONotation = () => {
  const navigate = useNavigate();

  const sections = [
    { id: 'foundations', title: 'Analysis Foundations', icon: Zap },
    { id: 'asymptotic', title: 'Asymptotic Notations', icon: Infinity },
    { id: 'hierarchy', title: 'Growth Rate Hierarchy', icon: TrendingUp },
    { id: 'rules', title: 'Rules of Calculation', icon: Terminal },
    { id: 'loops', title: 'Loop Analysis', icon: Activity },
    { id: 'recursion', title: 'Recursion Analysis', icon: GitBranch },
    { id: 'benchmarks', title: 'Algorithm Benchmarks', icon: Target },
    { id: 'advanced', title: 'Advanced Concepts', icon: Binary },
  ];

  return (
    <DSANotesLayout activeTab="Notes">
      <Helmet>
        <title>Big-O Notation Masterclass | DSA Notes</title>
        <meta name="description" content="Comprehensive guide to Big-O notation, algorithm complexity analysis, time and space complexity, and common algorithm performance benchmarks." />
      </Helmet>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '60px' }}>
        <span style={{
          display: 'inline-block', padding: '6px 12px', borderRadius: '6px',
          background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.3)',
          color: '#d8b4fe', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px'
        }}>
          Chapter 2
        </span>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 900, margin: '0 0 20px 0', background: 'linear-gradient(135deg, #ffffff 0%, #d8b4fe 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-2px' }}>
          Big-O Notation & Complexity
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, maxWidth: '850px' }}>
          Big-O notation is the mathematical language we use to describe how an algorithm's performance scales as the input size grows. It focuses on the "big picture" (asymptotic behavior).
        </p>
      </motion.div>

      {/* Foundations Module */}
      <Section id="foundations" title="Analysis Foundations" icon={Zap}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div>
            <h3 style={{ color: '#d8b4fe', margin: '0 0 15px 0' }}>Introduction to Analysis</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.7 }}>
              Algorithm analysis is the process of finding the computational complexity of algorithms—the amount of time, storage, or other resources needed to execute them.
            </p>
            <div style={{ background: 'rgba(168,85,247,0.05)', borderLeft: '4px solid #a855f7', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
              <strong style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#d8b4fe' }}><Scale size={18} /> Time vs Space</strong>
              <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>
                <strong>Time Complexity:</strong> How the execution time increases with input size.<br />
                <strong>Space Complexity:</strong> How much memory is required as input size grows.
              </p>
            </div>
          </div>
          <div>
            <h3 style={{ color: '#60a5fa', margin: '0 0 15px 0' }}>Case Analysis</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <CheckCircle2 color="#34d399" size={20} style={{ flexShrink: 0 }} />
                <div>
                  <strong style={{ color: '#fff' }}>Best Case (Ω):</strong> The minimum time needed (e.g., target is at the first index).
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <AlertCircle color="#ef4444" size={20} style={{ flexShrink: 0 }} />
                <div>
                  <strong style={{ color: '#fff' }}>Worst Case (O):</strong> The maximum time needed (e.g., target is at the last index or not present). <strong>This is usually our primary focus.</strong>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <Info color="#a855f7" size={20} style={{ flexShrink: 0 }} />
                <div>
                  <strong style={{ color: '#fff' }}>Average Case (Θ):</strong> The expected time averaged over all possible inputs.
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <Clock color="#fcd34d" size={20} style={{ flexShrink: 0 }} />
                <div>
                  <strong style={{ color: '#fff' }}>Amortized Analysis:</strong> The average time per operation over a series of operations (e.g., dynamic array resizing).
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Asymptotic Section */}
      <Section id="asymptotic" title="Asymptotic Notations" icon={Infinity}>
        <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, marginBottom: '2rem' }}>
          Asymptotic notations are mathematical tools used to describe the limiting behavior of functions.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <div style={{ background: 'rgba(168,85,247,0.1)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(168,85,247,0.2)' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#d8b4fe' }}>Big O (Upper Bound)</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
              $f(n) = O(g(n))$ if there exist constants $c$ and $n_0$ such that $f(n) \leq c \cdot g(n)$ for all $n \geq n_0$. Represents the "at most" growth rate.
            </p>
          </div>
          <div style={{ background: 'rgba(59,130,246,0.1)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(59,130,246,0.2)' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#60a5fa' }}>Big Omega (Lower Bound)</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
              $f(n) = \Omega(g(n))$ if $f(n) \geq c \cdot g(n)$ for all $n \geq n_0$. Represents the "at least" growth rate.
            </p>
          </div>
          <div style={{ background: 'rgba(16,185,129,0.1)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.2)' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#6ee7b7' }}>Big Theta (Tight Bound)</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
              $f(n) = \Theta(g(n))$ if it is both $O(g(n))$ and $\Omega(g(n))$. Represents the exact asymptotic growth.
            </p>
          </div>
        </div>
        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', fontSize: '0.9rem' }}>
          <span style={{ color: '#a855f7', fontWeight: 700 }}>Note:</span> <strong>Little-o ($o$)</strong> and <strong>Little-omega ($\omega$)</strong> represent non-tight upper and lower bounds respectively (e.g., $n = o(n^2)$ but $n^2 \neq o(n^2)$).
        </div>
      </Section>

      {/* Hierarchy Section */}
      <Section id="hierarchy" title="Growth Rate Hierarchy" icon={TrendingUp}>
        <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, marginBottom: '2.5rem' }}>
          Common complexity classes ordered from most efficient to least efficient (The hierarchy of doom).
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <ComplexityCard
            complexity="O(1)" color="#34d399" label="Constant Time"
            description="Execution time remains the same regardless of input size. Example: Accessing an array index."
          />
          <ComplexityCard
            complexity="O(log n)" color="#10b981" label="Logarithmic Time"
            description="Input size is halved each step. Example: Binary Search."
          />
          <ComplexityCard
            complexity="O(n)" color="#60a5fa" label="Linear Time"
            description="Time grows proportionally with input size. Example: Iterating through an array."
          />
          <ComplexityCard
            complexity="O(n log n)" color="#3b82f6" label="Linearithmic Time"
            description="Efficient sorting algorithms. Example: Merge Sort, Quick Sort."
          />
          <ComplexityCard
            complexity="O(n²)" color="#fbbf24" label="Quadratic Time"
            description="Nested loops over the same input. Example: Bubble Sort."
          />
          <ComplexityCard
            complexity="O(2ⁿ)" color="#f87171" label="Exponential Time"
            description="Cost doubles with each additional element. Example: Recursive Fibonacci."
          />
          <ComplexityCard
            complexity="O(n!)" color="#ef4444" label="Factorial Time"
            description="Extremely slow. Example: Generating all permutations of a string."
          />
        </div>

        {/* Visualization Graph Component */}
        <div style={{
          marginTop: '4rem', padding: '2.5rem', background: '#000', borderRadius: '16px',
          border: '1px solid rgba(168,85,247,0.2)', position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ fontSize: '0.9rem', color: '#a855f7', textTransform: 'uppercase', marginBottom: '20px' }}>Complexity Curve Visualization</div>
          <div style={{ position: 'relative', height: '300px', width: '100%', borderBottom: '2px solid rgba(255,255,255,0.2)', borderLeft: '2px solid rgba(255,255,255,0.2)' }}>
            {/* O(n!) */}
            <motion.div initial={{ height: 0 }} whileInView={{ height: '280px' }} transition={{ duration: 1 }} style={{ position: 'absolute', left: '10%', bottom: 0, width: '2px', background: '#ef4444' }} />
            {/* O(2^n) */}
            <motion.div initial={{ height: 0 }} whileInView={{ pathLength: 1 }} style={{ position: 'absolute', left: 0, bottom: 0, width: '100%', height: '100%', overflow: 'hidden' }}>
              <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                <motion.path
                  d="M0 100 Q 80 100 90 0"
                  stroke="#f87171" strokeWidth="2" fill="none"
                  initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ duration: 1.5 }}
                />
              </svg>
            </motion.div>
            {/* O(n^2) */}
            <motion.div initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} style={{ position: 'absolute', left: 0, bottom: 0, width: '100%', height: '100%' }}>
              <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                <motion.path d="M0 100 C 30 100 70 80 100 0" stroke="#fbbf24" strokeWidth="1.5" fill="none" />
              </svg>
            </motion.div>
            {/* O(n) */}
            <motion.div initial={{ width: 0 }} whileInView={{ width: '100%' }} transition={{ duration: 1 }} style={{ position: 'absolute', left: 0, bottom: 0, height: '100%', overflow: 'hidden' }}>
              <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                <line x1="0" y1="100" x2="100" y2="0" stroke="#60a5fa" strokeWidth="1" strokeDasharray="4 2" />
              </svg>
            </motion.div>
            {/* O(log n) */}
            <motion.div style={{ position: 'absolute', left: 0, bottom: 0, width: '100%', height: '100%' }}>
              <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0 100 C 10 90 40 85 100 80" stroke="#10b981" strokeWidth="2" fill="none" />
              </svg>
            </motion.div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>
            <span>Input Size (n)</span>
            <div style={{ display: 'flex', gap: '15px' }}>
              <span style={{ color: '#60a5fa' }}>Linear</span>
              <span style={{ color: '#fbbf24' }}>Quadratic</span>
              <span style={{ color: '#ef4444' }}>Factorial</span>
            </div>
          </div>
        </div>
      </Section>

      {/* Rules Module */}
      <Section id="rules" title="Rules of Calculation" icon={Terminal}>
        <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, marginBottom: '2rem' }}>
          How to simplify complex code into a single Big-O expression.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid #a855f7' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#fff' }}>1. Ignore Constants</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,245,0.6)' }}>
                $O(2n + 5)$ becomes $O(n)$. We focus on the trend, not the specific count.
              </p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid #a855f7' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#fff' }}>2. Drop Lower Order Terms</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,245,0.6)' }}>
                $O(n^2 + n)$ becomes $O(n^2)$. As $n$ grows, $n$ becomes insignificant compared to $n^2$.
              </p>
            </div>
          </div>
          <div style={{ background: '#090510', border: '1px solid rgba(168,85,247,0.2)', borderRadius: '12px', padding: '20px' }}>
            <h4 style={{ color: '#d8b4fe', marginBottom: '15px' }}>Code Analysis Cheat Sheet</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'rgba(255,255,255,0.6)' }}>Loop $(0...n)$:</span>
                <span style={{ color: '#60a5fa' }}>$O(n)$</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'rgba(255,255,255,0.6)' }}>Nested Loop $(n \cdot n)$:</span>
                <span style={{ color: '#fbbf24' }}>$O(n^2)$</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'rgba(255,255,255,0.6)' }}>Halving Input $(n/2...)$:</span>
                <span style={{ color: '#34d399' }}>$O(\log n)$</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'rgba(255,255,255,0.6)' }}>Binary Recursion:</span>
                <span style={{ color: '#f87171' }}>$O(2^n)$</span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Loop Analysis Module */}
      <Section id="loops" title="Loop Complexity Analysis" icon={Activity}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <div>
            <h3 style={{ color: '#d8b4fe', margin: '0 0 10px 0' }}>Dependent Nested Loops</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '15px' }}>
              When the inner loop count depends on the outer loop's index.
            </p>
            <div style={{ background: '#090510', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '15px' }}>
              <pre style={{ margin: 0, color: '#e9d8fd', fontSize: '0.82rem' }}>
                {`for (let i = 0; i < n; i++) {
  for (let j = 0; j < i; j++) {
    // Total iterations: 1 + 2 + 3 + ... + n = n(n+1)/2
    // Complexity: O(n^2)
  }
}`}
              </pre>
            </div>
          </div>
          <div>
            <h3 style={{ color: '#d8b4fe', margin: '0 0 10px 0' }}>Logarithmic Loops</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '15px' }}>
              Variable increment/decrement by multiplication or division.
            </p>
            <div style={{ background: '#090510', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '15px' }}>
              <pre style={{ margin: 0, color: '#e9d8fd', fontSize: '0.82rem' }}>
                {`for (let i = 1; i < n; i = i * 2) {
  // i doubles: 1, 2, 4, 8, 16 ... n
  // Complexity: O(log n)
}`}
              </pre>
            </div>
          </div>
        </div>
      </Section>

      {/* Recursion Analysis Module */}
      <Section id="recursion" title="Recursion Complexity Analysis" icon={GitBranch}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: 'rgba(168,85,247,0.1)', padding: '1.2rem', borderRadius: '12px' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#d8b4fe' }}>The Master Theorem</h4>
              <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                Used for Divide & Conquer recurrence: $T(n) = aT(n/b) + f(n)$.<br />
                It provides a direct way to solve complexity without expanding the tree.
              </p>
            </div>
            <div style={{ background: 'rgba(59,130,246,0.1)', padding: '1.2rem', borderRadius: '12px' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#60a5fa' }}>Recursion Tree Method</h4>
              <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                {/* Visualize work done at each level of recursion. Total work = $\sum \text{work at each level}$. */}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h4 style={{ color: '#fff', margin: 0 }}>Complexity of Recursive Fibonacci</h4>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>A classic example of exponential growth $O(2^n)$.</p>
            <div style={{ borderLeft: '2px solid rgba(168,85,247,0.3)', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ position: 'relative' }}>
                <span style={{ background: '#a855f7', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>F(4)</span>
                <div style={{ display: 'flex', gap: '40px', marginTop: '10px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>↙ F(3)</span>
                  <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>↘ F(2)</span>
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Each call branches into 2 more, creating a tree of depth $n$. Total nodes $\approx 2^n$.</p>
            </div>
          </div>
        </div>
      </Section>

      {/* Benchmarks Section */}
      <Section id="benchmarks" title="Algorithm Benchmarks" icon={Target}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ textAlign: 'left', padding: '1rem', color: '#a855f7' }}>Algorithm / Operation</th>
                <th style={{ textAlign: 'left', padding: '1rem', color: '#a855f7' }}>Average Case</th>
                <th style={{ textAlign: 'left', padding: '1rem', color: '#a855f7' }}>Worst Case</th>
                <th style={{ textAlign: 'left', padding: '1rem', color: '#a855f7' }}>Space</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '1rem' }}>Linear Search</td>
                <td style={{ padding: '1rem' }}>$O(n)$</td>
                <td style={{ padding: '1rem' }}>$O(n)$</td>
                <td style={{ padding: '1rem' }}>$O(1)$</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '1rem' }}>Binary Search</td>
                <td style={{ padding: '1rem' }}>$O(\log n)$</td>
                <td style={{ padding: '1rem' }}>$O(\log n)$</td>
                <td style={{ padding: '1rem' }}>$O(1)$</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '1rem' }}>Quick Sort</td>
                <td style={{ padding: '1rem', color: '#6ee7b7' }}>$O(n \log n)$</td>
                <td style={{ padding: '1rem', color: '#f87171' }}>$O(n^2)$</td>
                <td style={{ padding: '1rem' }}>$O(\log n)$</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '1rem' }}>Merge Sort</td>
                <td style={{ padding: '1rem', color: '#6ee7b7' }}>$O(n \log n)$</td>
                <td style={{ padding: '1rem', color: '#6ee7b7' }}>$O(n \log n)$</td>
                <td style={{ padding: '1rem', color: '#f87171' }}>$O(n)$</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '1rem' }}>Hash Map Lookup</td>
                <td style={{ padding: '1rem', color: '#34d399' }}>$O(1)$</td>
                <td style={{ padding: '1rem' }}>$O(n)$</td>
                <td style={{ padding: '1rem' }}>$O(n)$</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '1rem' }}>Dijkstra's (Heap)</td>
                <td style={{ padding: '1rem' }}>-</td>
                <td style={{ padding: '1rem' }}>$O((V+E)\log V)$</td>
                <td style={{ padding: '1rem' }}>$O(V)$</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      {/* Advanced Module */}
      <Section id="advanced" title="Advanced Concepts" icon={Binary}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h4 style={{ color: '#d8b4fe', margin: '0 0 10px 0' }}>P vs NP Overview</h4>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
              <strong>P:</strong> Problems solvable in polynomial time.<br />
              <strong>NP:</strong> Problems whose solution can be <em>verified</em> in polynomial time.<br />
              <strong>NP-Hard:</strong> Problems at least as hard as the hardest problems in NP.<br />
              <strong>NP-Complete:</strong> Problems in both NP and NP-Hard.
            </p>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h4 style={{ color: '#60a5fa', margin: '0 0 10px 0' }}>Practical Performance</h4>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
              Theoretical Big-O doesn't always account for <strong>Cache Efficiency</strong>. Sequential array access is often faster than linked list traversal due to spatial locality, even if both are $O(n)$. <strong>Bit Complexity</strong> considers the number of bits in the input, critical for cryptography.
            </p>
          </div>
        </div>
      </Section>

      {/* Navigation Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '2rem', marginTop: '3rem' }}>
        <button onClick={() => navigate('/dsa/notes/introduction')} style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '15px 25px', color: '#fff', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '8px', borderRadius: '50%', display: 'flex' }}>
            <ChevronRight size={20} color="#fff" style={{ transform: 'rotate(180deg)' }} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Previous Chapter</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>Introduction to DSA</div>
          </div>
        </button>

        <button onClick={() => navigate('/dsa/notes/arrays')} style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: '12px', padding: '15px 25px', color: '#fff', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'right' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(168,85,247,0.2)'; e.currentTarget.style.transform = 'translateY(-2px)' }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(168,85,247,0.1)'; e.currentTarget.style.transform = 'none' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#d8b4fe', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Next Chapter</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>Arrays & Strings</div>
          </div>
          <div style={{ background: 'rgba(168,85,247,0.2)', padding: '8px', borderRadius: '50%', display: 'flex' }}>
            <ChevronRight size={20} color="#d8b4fe" />
          </div>
        </button>
      </div>
    </DSANotesLayout>
  );
};

export default BigONotation;
