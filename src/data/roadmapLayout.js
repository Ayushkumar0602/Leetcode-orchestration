export const roadmapEdges = [
  { source: 'Arrays & Hashing', target: 'Two Pointers' },
  { source: 'Arrays & Hashing', target: 'Stack' },
  
  { source: 'Two Pointers', target: 'Binary Search' },
  { source: 'Two Pointers', target: 'Sliding Window' },
  { source: 'Two Pointers', target: 'Linked List' },
  
  { source: 'Binary Search', target: 'Trees' },
  { source: 'Sliding Window', target: 'Trees' },
  { source: 'Linked List', target: 'Trees' },

  { source: 'Trees', target: 'Tries' },
  { source: 'Trees', target: 'Heap / Priority Queue' },
  { source: 'Trees', target: 'Backtracking' },

  { source: 'Heap / Priority Queue', target: 'Intervals' },
  { source: 'Heap / Priority Queue', target: 'Greedy' },
  { source: 'Heap / Priority Queue', target: 'Advanced Graphs' },

  { source: 'Backtracking', target: 'Graphs' },
  { source: 'Backtracking', target: '1-D DP' },
  { source: 'Backtracking', target: 'Dynamic Programming' }, // Fallback for 250

  { source: 'Graphs', target: 'Advanced Graphs' },
  { source: 'Graphs', target: '2-D DP' },
  { source: 'Graphs', target: 'Math & Geometry' },

  { source: '1-D DP', target: '2-D DP' },
  { source: '1-D DP', target: 'Bit Manipulation' },
  { source: 'Dynamic Programming', target: 'Math & Geometry' }, // Since 250 merges DP

  { source: '2-D DP', target: 'Bit Manipulation' },
  { source: 'Bit Manipulation', target: 'Math & Geometry' }
];

const X_SPACING = 250;
const Y_SPACING = 120;
const CENTER_X = 500;

export const dagPositions = {
    'Arrays & Hashing': { x: CENTER_X, y: 0 },
    
    'Two Pointers': { x: CENTER_X - X_SPACING/1.5, y: Y_SPACING },
    'Stack': { x: CENTER_X + X_SPACING/1.5, y: Y_SPACING },
    
    'Binary Search': { x: CENTER_X - X_SPACING * 1.5, y: Y_SPACING * 2 },
    'Sliding Window': { x: CENTER_X - X_SPACING/2, y: Y_SPACING * 2 },
    'Linked List': { x: CENTER_X + X_SPACING/2, y: Y_SPACING * 2 },
    
    'Trees': { x: CENTER_X - X_SPACING/2, y: Y_SPACING * 3 },
    
    'Tries': { x: CENTER_X - X_SPACING * 2, y: Y_SPACING * 4 },
    'Heap / Priority Queue': { x: CENTER_X - X_SPACING/1.2, y: Y_SPACING * 4 },
    'Backtracking': { x: CENTER_X + X_SPACING, y: Y_SPACING * 4 },
    
    'Intervals': { x: CENTER_X - X_SPACING * 2, y: Y_SPACING * 5 },
    'Greedy': { x: CENTER_X - X_SPACING, y: Y_SPACING * 5 },
    'Advanced Graphs': { x: CENTER_X, y: Y_SPACING * 5 },
    'Advanced Data Structures & Design': { x: CENTER_X, y: Y_SPACING * 5 }, // For 250 list fallback

    'Graphs': { x: CENTER_X + X_SPACING/2, y: Y_SPACING * 5.5 },
    '1-D DP': { x: CENTER_X + X_SPACING * 1.5, y: Y_SPACING * 5.5 },
    'Dynamic Programming': { x: CENTER_X + X_SPACING * 1.5, y: Y_SPACING * 5.5 },
    
    '2-D DP': { x: CENTER_X + X_SPACING, y: Y_SPACING * 6.5 },
    'Bit Manipulation': { x: CENTER_X + X_SPACING * 2, y: Y_SPACING * 6.5 },
    
    'Math & Geometry': { x: CENTER_X + X_SPACING * 1.5, y: Y_SPACING * 7.5 }
};
