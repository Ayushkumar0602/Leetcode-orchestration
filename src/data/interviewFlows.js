export const ROLES = [
  {
    id: 'sde-intern',
    title: 'Software Engineer Intern',
    description: 'Entry-level coding assessment focusing heavily on Data Structures, Algorithms, and analytical thinking.',
    rounds: [
      { id: 'oa', title: 'Online Assessment (OA)', type: 'coding', desc: '1-2 algorithmic problems via HackerRank or similar platforms (70-90 mins).' },
      { id: 'tech1', title: 'Technical Round 1', type: 'interview', desc: 'Live DSA interview focused on Arrays, Strings, and simple Graphs/Trees (45 mins).' },
      { id: 'hr', title: 'HR / Behavioral Round', type: 'hr', desc: 'Culture fit assessment, teamwork scenarios, and resume deep dive (30 mins).' }
    ]
  },
  {
    id: 'sde',
    title: 'Software Engineer',
    description: 'Standard software development role involving DSA, coding scalability, and domain knowledge.',
    rounds: [
      { id: 'oa', title: 'Online Assessment (OA)', type: 'coding', desc: '2-3 medium-hard algorithmic challenges (90 mins).' },
      { id: 'tech1', title: 'Technical Round 1', type: 'interview', desc: 'Core data structures and problem-solving. Live coding.' },
      { id: 'tech2', title: 'Technical Round 2', type: 'interview', desc: 'Advanced algorithms, multi-threading, or domain-specific questions.' },
      { id: 'sysdesign', title: 'System Design Round', type: 'architecture', desc: 'High-level or Low-level design depending on experience.' },
      { id: 'hr', title: 'HR / Behavioral Round', type: 'hr', desc: 'Culture fit and previous project impacts.' }
    ]
  },
  {
    id: 'frontend',
    title: 'Frontend Engineer',
    description: 'UI/UX focused engineering role evaluating web fundamentals, frameworks, and rendering optimization.',
    rounds: [
      { id: 'oa', title: 'UI/Coding Assessment', type: 'coding', desc: 'JavaScript/React coding challenge and CSS knowledge.' },
      { id: 'machine-coding', title: 'Machine Coding (UI)', type: 'practical', desc: 'Build a working frontend component (e.g. Carousel, Search bar) from scratch.' },
      { id: 'tech1', title: 'Frontend Fundamentals', type: 'interview', desc: 'DOM, Event Loop, closures, promises, and React internals.' },
      { id: 'sysdesign', title: 'Frontend System Design', type: 'architecture', desc: 'Designing a large-scale web app (e.g. News feed, Chat application).' },
      { id: 'hr', title: 'HR / Behavioral Round', type: 'hr', desc: 'Culture fit, collaboration with designers and backend.' }
    ]
  },
  {
    id: 'backend',
    title: 'Backend Engineer',
    description: 'Server-side engineering role evaluating API design, database schemas, and distributed systems.',
    rounds: [
      { id: 'oa', title: 'Online Assessment (OA)', type: 'coding', desc: 'Algorithmic focus and SQL queries.' },
      { id: 'tech1', title: 'DSA & Logic', type: 'interview', desc: 'Live coding on core algorithms.' },
      { id: 'sysdesign', title: 'HLD System Design', type: 'architecture', desc: 'System architecture, caching, queues, scalability (e.g. Design Netflix).' },
      { id: 'dbdesign', title: 'Low-Level / DB Design', type: 'architecture', desc: 'Schema design, normalization, transactions, and API structure.' },
      { id: 'hr', title: 'Behavioral & Leadership', type: 'hr', desc: 'Past projects, incident responses, and cultural fit.' }
    ]
  },
  {
    id: 'fullstack',
    title: 'Full Stack Engineer',
    description: 'End-to-end development evaluating both server performance and user interface logic.',
    rounds: [
      { id: 'oa', title: 'Full Stack Assessment', type: 'coding', desc: 'Algorithmic questions + UI logic task.' },
      { id: 'machine-coding', title: 'Machine Coding (Full Stack)', type: 'practical', desc: 'Create a mini full-stack CRUD application.' },
      { id: 'sysdesign', title: 'System Design', type: 'architecture', desc: 'End-to-end architecture (Client -> Gateway -> Microservices -> DB).' },
      { id: 'tech1', title: 'Domain Knowledge', type: 'interview', desc: 'Deep dive into APIs, state management, and protocols.' },
      { id: 'hr', title: 'HR / Behavioral Round', type: 'hr', desc: 'Team involvement, cross-functional impact.' }
    ]
  },
  {
    id: 'data-scientist',
    title: 'Data Scientist',
    description: 'Focus on statistics, machine learning models, and data analytics.',
    rounds: [
      { id: 'oa', title: 'Data/Stats Assessment', type: 'coding', desc: 'Python/R scripting and Probability/Statistics questions.' },
      { id: 'tech1', title: 'SQL & Data Wrangling', type: 'practical', desc: 'Live data manipulation and advanced SQL querying.' },
      { id: 'tech2', title: 'Machine Learning Models', type: 'interview', desc: 'Model selection, bias-variance tradeoff, evaluation metrics.' },
      { id: 'takehome', title: 'Take-home Assignment', type: 'practical', desc: 'Building a predictive model on a provided dataset and presenting it. (Optional)' },
      { id: 'hr', title: 'Behavioral & Impact', type: 'hr', desc: 'Business acumen, communication of complex insights.' }
    ]
  },
  {
    id: 'ml-engineer',
    title: 'Machine Learning Engineer',
    description: 'Evaluating the deployment and scaling of ML models in production.',
    rounds: [
      { id: 'oa', title: 'Coding & ML Basics', type: 'coding', desc: 'DSA + standard ML algorithms (e.g. implementing KNN from scratch).' },
      { id: 'tech1', title: 'Software Engineering / DSA', type: 'interview', desc: 'Standard data structure rounds focused on efficiency.' },
      { id: 'sysdesign', title: 'ML System Design', type: 'architecture', desc: 'Designing production ML pipelines (e.g. Recommendation System).' },
      { id: 'tech2', title: 'Deep Learning / Domain', type: 'interview', desc: 'Specific discussions on NLP, CV, or generative models.' },
      { id: 'hr', title: 'HR / Behavioral Round', type: 'hr', desc: 'Culture fit and engineering collaboration.' }
    ]
  },
  {
    id: 'product-manager',
    title: 'Product Manager',
    description: 'Product strategy, execution, and cross-functional leadership evaluation.',
    rounds: [
      { id: 'product-sense', title: 'Product Sense', type: 'interview', desc: 'Designing a product for a specific user persona. Creativity and vision.' },
      { id: 'execution', title: 'Execution & Metrics', type: 'interview', desc: 'Defining success metrics, handling trade-offs, and A/B testing.' },
      { id: 'tech', title: 'Technical Competency', type: 'interview', desc: 'System architecture understanding, API integrations, interacting with engineering.' },
      { id: 'hr', title: 'Behavioral & Leadership', type: 'hr', desc: 'Stakeholder management, conflict resolution, past product impact.' }
    ]
  },
  {
    id: 'sdet',
    title: 'SDET (Test Engineer)',
    description: 'Software development in testing, focusing on automation, edge cases, and CI/CD.',
    rounds: [
      { id: 'oa', title: 'Coding & Bug Catching', type: 'coding', desc: 'Finding bugs in provided code and standard algorithmic puzzles.' },
      { id: 'tech1', title: 'Automation & Coding', type: 'practical', desc: 'Writing automated test frameworks (e.g., Selenium, Cypress) from scratch.' },
      { id: 'sysdesign', title: 'Test System Architecture', type: 'architecture', desc: 'Designing scalable test environments and continuous integration pipelines.' },
      { id: 'tech2', title: 'Edge Cases & Quality', type: 'interview', desc: 'Given a system or feature, boundary-value analysis and test strategy.' },
      { id: 'hr', title: 'HR / Behavioral Round', type: 'hr', desc: 'Culture fit.' }
    ]
  }
];
