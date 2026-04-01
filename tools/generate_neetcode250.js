import fs from 'fs';

const neetcode250Data = {
  "Arrays & Hashing": [1, 217, 242, 49, 347, 238, 36, 271, 128, 66, 202, 268, 560, 525, 523],
  "Two Pointers": [125, 167, 15, 11, 42, 26, 80, 88, 283, 844],
  "Sliding Window": [121, 3, 424, 567, 76, 239, 438, 1004, 1456, 209],
  "Stack": [20, 155, 150, 22, 739, 853, 84, 85, 456, 496, 503, 901],
  "Binary Search": [704, 74, 875, 153, 33, 981, 4, 1011, 410, 1482, 1552, 1760, 1870],
  "Linked List": [206, 21, 143, 19, 138, 2, 141, 287, 146, 25, 92, 82, 61, 86, 24, 430, 707],
  "Trees": [226, 104, 543, 110, 100, 572, 236, 102, 199, 1448, 98, 230, 105, 124, 297, 662, 987, 958, 971, 1372, 1026, 1457, 894, 951, 863],
  "Tries": [208, 211, 212],
  "Heap / Priority Queue": [215, 1046, 973, 295, 621, 355, 480, 703, 692, 451],
  "Backtracking": [78, 39, 46, 90, 40, 79, 131, 17, 51, 52, 37, 93, 126, 127, 140, 282, 320],
  "Greedy": [53, 55, 45, 134, 846, 1899, 763, 678, 435, 452, 406],
  "Dynamic Programming": [70, 746, 198, 213, 5, 647, 91, 322, 152, 139, 300, 416, 72, 221, 309, 714, 518, 377, 115, 97, 123, 188, 312, 354, 368, 410, 474, 63, 64, 120, 931, 174, 1143, 583, 712, 516, 1035, 337, 494],
  "Graphs": [200, 133, 695, 417, 130, 994, 286, 207, 210, 684, 685, 743, 332, 1584, 778, 269, 787, 329, 2101, 1462, 1514, 1631, 1786, 1976, 1129, 847],
  "Bit Manipulation": [136, 191, 338, 190, 268, 371, 201, 137],
  "Math & Geometry": [48, 54, 59, 73, 202, 66, 50, 43, 29, 166],
  "Advanced Data Structures & Design": [146, 460, 155, 895, 208, 211, 212, 981, 432, 379, 1381, 1670, 2080]
};

async function generate() {
    console.log("Fetching problem details from backend...");
    const outData = [];
    
    for (const [category, ids] of Object.entries(neetcode250Data)) {
        console.log("Processing", category);
        const problemsObj = { category, problems: [] };
        
        for (const id of ids) {
            try {
                // Using the exact URL as previously used for generator
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
    
    const fileContent = `export const neetcode250 = ${JSON.stringify(outData, null, 2)};`;
    fs.writeFileSync('src/data/neetcode250.js', fileContent);
    console.log("Generated src/data/neetcode250.js!");
}

generate();
