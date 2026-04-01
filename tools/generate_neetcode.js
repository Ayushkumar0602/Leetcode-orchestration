import fs from 'fs';

const neetcodeData = {
  "Arrays & Hashing": [1, 217, 242, 49, 347, 238, 36, 128],
  "Two Pointers": [125, 167, 15, 11, 42],
  "Sliding Window": [121, 3, 424, 567, 76],
  "Stack": [20, 155, 150, 22, 739, 84],
  "Binary Search": [704, 74, 875, 153, 33],
  "Linked List": [206, 21, 141, 143, 19, 138, 2, 287],
  "Trees": [226, 104, 543, 110, 100, 572, 235, 236, 102, 98, 105, 124],
  "Backtracking": [78, 39, 46, 90, 131, 17, 51],
  "Heap / Priority Queue": [215, 973, 703, 295, 621],
  "Tries": [208, 211, 212],
  "Graphs": [200, 133, 695, 417, 994, 207, 210, 261, 323],
  "1-D DP": [70, 198, 213, 5, 647, 91, 322, 139, 300],
  "2-D DP": [62, 1143, 72, 115],
  "Greedy": [53, 55, 45, 134, 846],
  "Intervals": [56, 57, 435, 452, 253],
  "Math & Geometry": [48, 54, 73, 202],
  "Bit Manipulation": [136, 191, 338, 268, 190]
};

async function generate() {
    console.log("Fetching problem details from backend...");
    const outData = [];
    
    for (const [category, ids] of Object.entries(neetcodeData)) {
        console.log("Processing", category);
        const problemsObj = { category, problems: [] };
        
        for (const id of ids) {
            try {
                // Production API or local API
                const res = await fetch(`https://leetcode-orchestration.onrender.com/api/problems/${id}`);
                const data = await res.json();
                
                if (data && !data.error) {
                    problemsObj.problems.push({
                        id,
                        title: data.title || data.problemName || `Problem ${id}`,
                        difficulty: data.difficulty || 'Medium',
                        slug: data.slug || data.titleSlug || '',
                    });
                } else {
                    problemsObj.problems.push({ id, title: `Problem ${id}`, difficulty: 'Medium', slug: '' });
                }
            } catch (err) {
                console.log(`Failed for id ${id}`);
                problemsObj.problems.push({ id, title: `Problem ${id}`, difficulty: 'Medium', slug: '' });
            }
        }
        outData.push(problemsObj);
    }
    
    // Add an overall wrapper or just export it
    const fileContent = `export const neetcode150 = ${JSON.stringify(outData, null, 2)};`;
    
    fs.writeFileSync('src/data/neetcode150.js', fileContent);
    console.log("Generated src/data/neetcode150.js!");
}

generate();
