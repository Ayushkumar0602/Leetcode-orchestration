import React from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, ChevronRight, Cpu, Network, Globe, Search, 
  Activity, Database, Scale, Lightbulb, Code2, Layers 
} from 'lucide-react';
import DSANotesLayout from './components/DSANotesLayout';
import './DSANotesStyles.css';

const Introduction = () => {
  const navigate = useNavigate();
  
  const seoData = {
    title: "Introduction to Data Structures and Algorithms | DSA Notes",
    description: "Master the fundamentals of DSA with detailed notes, real-life examples, and interactive visualizations. Learn why DSA is the backbone of modern software architecture.",
    keywords: "DSA introduction, data structures, algorithms, coding basics, computer science, software engineering, real-life dsa examples",
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <DSANotesLayout activeTab="Notes">
      <Helmet>
        <title>{seoData.title}</title>
        <meta name="description" content={seoData.description} />
        <meta name="keywords" content={seoData.keywords} />
        <link rel="canonical" href="https://whizan.xyz/dsa/notes/introduction" />
      </Helmet>

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        style={{ marginBottom: '40px' }}
      >
        <span style={{ 
          display: 'inline-block', padding: '6px 12px', borderRadius: '6px', 
          background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.3)', 
          color: '#d8b4fe', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' 
        }}>
          Intro to Computing
        </span>
        <h1 style={{ fontSize: '2.8rem', fontWeight: 800, margin: '0 0 15px 0', background: 'linear-gradient(135deg, #ffffff 0%, #d8b4fe 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-1px' }}>
          Mastering DSA: The Core Fundamentals
        </h1>
        <p style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, maxWidth: '800px', margin: 0 }}>
          Unlock the secrets of efficient software. Learn how Google searches billions of pages in milliseconds and how Netflix recommends your favorite shows using optimized data flows.
        </p>
      </motion.div>

      {/* Why DSA Matters (Real Life) */}
      <motion.div 
        className="dsa-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '2rem', marginBottom: '2rem' }}
      >
        <motion.h2 variants={fadeInUp} style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Globe size={24} color="#a855f7" /> Why DSA Matters in the Real World
        </motion.h2>
        <motion.p variants={fadeInUp} style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, marginBottom: '25px' }}>
          The distinction between a "junior developer" and a "senior engineer" often boils down to how they handle scale. A simple algorithm might work for 100 users, but will crash for 1,000,000.
        </motion.p>

        <motion.div variants={fadeInUp} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(168,85,247,0.1)', borderRadius: '12px', padding: '1.5rem' }}>
            <Search size={24} color="#d8b4fe" style={{marginBottom: '10px'}} />
            <h4 style={{margin: '0 0 8px 0', color: '#fff'}}>Search Engines</h4>
            <p style={{margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5}}>
              Google uses massive <strong>Graphs</strong> and the <strong>PageRank</strong> algorithm to index billions of websites and retrieve the most relevant ones in 0.2 seconds.
            </p>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(59,130,246,0.1)', borderRadius: '12px', padding: '1.5rem' }}>
            <Activity size={24} color="#60a5fa" style={{marginBottom: '10px'}} />
            <h4 style={{margin: '0 0 8px 0', color: '#fff'}}>Google Maps</h4>
            <p style={{margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5}}>
              Finding the shortest path from point A to B involves <strong>Dijkstra’s Algorithm</strong> or <strong>A* Search</strong> applied on a visual Graph of roads.
            </p>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(16,185,129,0.1)', borderRadius: '12px', padding: '1.5rem' }}>
            <Database size={24} color="#6ee7b7" style={{marginBottom: '10px'}} />
            <h4 style={{margin: '0 0 8px 0', color: '#fff'}}>Social Media</h4>
            <p style={{margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5}}>
              Facebook and LinkedIn use <strong>Tries</strong> for autocomplete and <strong>Hash Tables</strong> for instant friend-search and session management.
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Memory Model Section */}
      <motion.div 
        className="dsa-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '2rem', marginBottom: '2rem' }}
      >
        <motion.h2 variants={fadeInUp} style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Cpu size={24} color="#a855f7" /> Memory Management & Storage
        </motion.h2>
        <motion.p variants={fadeInUp} style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, marginBottom: '25px' }}>
          Data structures are essentially different ways of mapping data into your computer's RAM. They are categorized by how they utilize space and how fast they can be accessed.
        </motion.p>

        <motion.div variants={fadeInUp} style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: '12px', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '2px', alignSelf: 'flex-start' }}>Memory Grid Visualizer</div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '4px', width: '100%', maxWidth: '600px' }}>
            {Array.from({ length: 40 }).map((_, i) => {
              const isArray = i >= 4 && i <= 8;
              const isNode = i === 12 || i === 25 || i === 38;
              let bg = 'rgba(255,255,255,0.05)';
              let color = 'transparent';
              if (isArray) { bg = 'rgba(59,130,246,0.3)'; color = '#60a5fa'; }
              if (isNode) { bg = 'rgba(168,85,247,0.3)'; color = '#d8b4fe'; }
              return (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.02 }}
                  style={{ 
                    aspectRatio: '1/1', background: bg, border: `1px solid ${color !== 'transparent' ? color : 'rgba(255,255,255,0.1)'}`, 
                    borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#fff'
                  }}
                >
                  {isArray ? `A[${i-4}]` : isNode ? `N` : ''}
                </motion.div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '20px', marginTop: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
              <div style={{ width: '12px', height: '12px', background: 'rgba(59,130,246,0.3)', border: '1px solid #60a5fa', borderRadius: '2px' }}></div>
              <strong style={{color: '#60a5fa'}}>Contiguous:</strong> Fast access (Arrays)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
              <div style={{ width: '12px', height: '12px', background: 'rgba(168,85,247,0.3)', border: '1px solid #d8b4fe', borderRadius: '2px' }}></div>
              <strong style={{color: '#d8b4fe'}}>Non-Contiguous:</strong> Flexible size (Linked Lists)
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Classification of Data Structures */}
      <motion.div 
        className="dsa-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '2rem', marginBottom: '2rem' }}
      >
        <motion.h2 variants={fadeInUp} style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Scale size={24} color="#a855f7" /> Taxonomy of Data Structures
        </motion.h2>

        <motion.div variants={fadeInUp} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#d8b4fe' }}>Linear Data Structures</h4>
            <ul style={{ paddingLeft: '20px', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', lineHeight: 1.8 }}>
              <li><strong>Arrays:</strong> Continuous memory.</li>
              <li><strong>Linked Lists:</strong> Connected via pointers.</li>
              <li><strong>Stacks:</strong> LIFO (Last In First Out).</li>
              <li><strong>Queues:</strong> FIFO (First In First Out).</li>
            </ul>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#60a5fa' }}>Non-Linear Data Structures</h4>
            <ul style={{ paddingLeft: '20px', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', lineHeight: 1.8 }}>
              <li><strong>Trees:</strong> Hierarchical data (Folders, DOM).</li>
              <li><strong>Graphs:</strong> Complex networks (Friends, Roads).</li>
              <li><strong>Heaps:</strong> Priority-based access.</li>
              <li><strong>Hash Tables:</strong> Instant key-value lookups.</li>
            </ul>
          </div>
        </motion.div>
      </motion.div>

      {/* Abstract Data Types (ADT) */}
      <motion.div 
        className="dsa-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        style={{ background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: '16px', padding: '2rem', marginBottom: '2rem' }}
      >
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Lightbulb size={24} color="#d8b4fe" /> Pro Tip: Understand the ADT
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, margin: 0 }}>
          An <strong>Abstract Data Type (ADT)</strong> defines <em>what</em> a data structure does (its operations like push, pop), but not <em>how</em> it is implemented. For example, a "Stack" is an ADT that can be implemented using an Array OR a Linked List. Focus on the concept first, then the implementation!
        </p>
      </motion.div>

      {/* Flow Graph */}
      <motion.div 
        className="dsa-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '2rem', marginBottom: '2rem' }}
      >
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Network size={24} color="#a855f7" /> Algorithm Flow Graph
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, marginBottom: '25px' }}>
          How raw bits of information turn into meaningful results through optimized logic.
        </p>
        
        <div style={{ padding: '3rem 2rem', background: 'rgba(0,0,0,0.4)', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <motion.div 
            initial={{ x: -20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}
            style={{ padding: '15px 25px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.4)', borderRadius: '8px', fontWeight: 600, color: '#93c5fd' }}
          >
            Input (RAM)
          </motion.div>
          <ChevronRight size={24} color="rgba(255,255,255,0.3)" />
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3 }}
            style={{ padding: '15px 30px', background: 'linear-gradient(135deg, #7e22ce 0%, #581c87 100%)', border: '1px solid rgba(168,85,247,0.5)', borderRadius: '8px', fontWeight: 700, color: '#fff', boxShadow: '0 10px 20px rgba(126,34,206,0.3)' }}
          >
            Algorithm (Logic)
          </motion.div>
          <ChevronRight size={24} color="rgba(255,255,255,0.3)" />
          <motion.div 
            initial={{ x: 20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }}
            style={{ padding: '15px 25px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.4)', borderRadius: '8px', fontWeight: 600, color: '#6ee7b7' }}
          >
            Result (UI/DB)
          </motion.div>
        </div>
      </motion.div>

      {/* Example Code */}
      <motion.div 
        className="dsa-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '2rem', marginBottom: '2rem' }}
      >
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Code2 size={24} color="#a855f7" /> Practical Algorithm Implementation
        </h2>
        <div style={{ background: '#090510', border: '1px solid rgba(168,85,247,0.2)', borderRadius: '12px', padding: '20px', overflowX: 'auto' }}>
          <pre style={{ margin: 0, color: '#e9d8fd', fontFamily: '"Fira Code", monospace', fontSize: '0.9rem', lineHeight: 1.5 }}>
{`// Data: Static Array (Fixed memory)
const students = ["Alice", "Bob", "Charlie", "David"];

/**
 * Algorithm: Simple Search
 * Efficiency: O(n) - Linear Time
 */
function containsStudent(list, name) {
  for (let student of list) {
    if (student === name) return true;
  }
  return false;
}

console.log(containsStudent(students, "Charlie")); // true`}
          </pre>
        </div>
      </motion.div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '2rem', marginTop: '3rem' }}>
        <div></div> 
        <button onClick={() => navigate('/dsa/notes/big-o-notation')} style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: '12px', padding: '15px 25px', color: '#fff', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'right' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(168,85,247,0.2)'; e.currentTarget.style.transform = 'translateY(-2px)' }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(168,85,247,0.1)'; e.currentTarget.style.transform = 'none' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#d8b4fe', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Next Chapter</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>Big-O Notation</div>
          </div>
          <div style={{ background: 'rgba(168,85,247,0.2)', padding: '8px', borderRadius: '50%', display: 'flex' }}>
            <ChevronRight size={20} color="#d8b4fe" />
          </div>
        </button>
      </div>
    </DSANotesLayout>
  );
};

export default Introduction;
