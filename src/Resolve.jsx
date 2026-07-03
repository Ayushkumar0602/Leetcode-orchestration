import React, { useState, useEffect } from 'react';
import { collection, query, limit, getDocs, startAfter, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import './Resolve.css';

const Resolve = () => {
    const [problems, setProblems] = useState([]);
    const [lastVisible, setLastVisible] = useState(null);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const [userCodes, setUserCodes] = useState({});
    const [verifying, setVerifying] = useState({});
    const [verifyResults, setVerifyResults] = useState({});

    const handleCodeChange = (id, code) => {
        setUserCodes(prev => ({ ...prev, [id]: code }));
    };

    const handleVerify = async (id) => {
        const code = userCodes[id];
        if (!code) return alert("Please enter C++ code to verify.");

        setVerifying(prev => ({ ...prev, [id]: true }));
        setVerifyResults(prev => ({ ...prev, [id]: null }));

        try {
            // Using production URL or relative local path based on where React is served from
            const url = process.env.NODE_ENV === 'production' 
                ? 'https://leetcode-orchestration.onrender.com/api/admin/verify-problem'
                : 'http://localhost:3001/api/admin/verify-problem';

            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ problemId: id, cppCode: code })
            });
            const data = await res.json();
            setVerifyResults(prev => ({ ...prev, [id]: data }));
        } catch (err) {
            console.error(err);
            setVerifyResults(prev => ({ ...prev, [id]: { error: err.message } }));
        }
        setVerifying(prev => ({ ...prev, [id]: false }));
    };

    const fetchProblems = async (isNext = false) => {
        setLoading(true);
        try {
            let q;
            if (isNext && lastVisible) {
                // Using document ID for ordering to paginate
                q = query(collection(db, "problems"), orderBy('__name__'), startAfter(lastVisible), limit(10));
            } else {
                q = query(collection(db, "problems"), orderBy('__name__'), limit(10));
            }

            const querySnapshot = await getDocs(q);
            const docs = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            if (docs.length < 10) {
                setHasMore(false);
            }

            if (docs.length > 0) {
                setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
                if (isNext) {
                    setProblems(prev => [...prev, ...docs]);
                } else {
                    setProblems(docs);
                }
            }
        } catch (error) {
            console.error("Error fetching problems:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchProblems();
    }, []);

    return (
        <div className="resolve-container">
            <header className="resolve-header">
                <h1>Cached Problem Registry</h1>
                <p>Viewing stored LeetCode questions, test cases, and wrappers.</p>
            </header>

            <div className="problems-list">
                {problems.map((problem) => (
                    <div key={problem.id} className="problem-card">
                        <div className="problem-card-header">
                            <h2>Problem ID: {problem.id}</h2>
                            <span className="problem-title">{problem.problem?.title || 'No Title'}</span>
                        </div>

                        <div className="problem-card-body">
                            <div className="section">
                                <h3>Primary Test Cases (Visible)</h3>
                                <pre className="code-block">
                                    <code>{JSON.stringify(problem.primaryTestCases || [], null, 2)}</code>
                                </pre>
                            </div>

                            <div className="section">
                                <h3>Hidden Test Cases (Submit)</h3>
                                <pre className="code-block">
                                    <code>{JSON.stringify(problem.submitTestCases || [], null, 2)}</code>
                                </pre>
                            </div>

                            <div className="section">
                                <h3>Wrapper Function (C++)</h3>
                                <pre className="code-block">
                                    <code>{problem.wrapper?.cpp || 'No C++ Wrapper'}</code>
                                </pre>
                            </div>
                        </div>

                        <div className="verify-section">
                            <h3>Test C++ Solution</h3>
                            <textarea 
                                className="cpp-editor"
                                placeholder="Paste your C++ solution here... (e.g. class Solution { public: ... });"
                                value={userCodes[problem.id] || ''}
                                onChange={(e) => handleCodeChange(problem.id, e.target.value)}
                            />
                            <button 
                                className="verify-btn" 
                                onClick={() => handleVerify(problem.id)}
                                disabled={verifying[problem.id]}
                            >
                                {verifying[problem.id] ? 'Compiling & Running...' : 'Verify All Test Cases'}
                            </button>

                            {verifyResults[problem.id] && (
                                <div className={`verify-result ${verifyResults[problem.id].success ? 'success' : 'fail'}`}>
                                    {verifyResults[problem.id].error ? (
                                        <div className="result-error">Error: {verifyResults[problem.id].error}</div>
                                    ) : verifyResults[problem.id].compileError ? (
                                        <div className="result-error">
                                            <strong>Compilation Error:</strong>
                                            <pre>{verifyResults[problem.id].compileError}</pre>
                                        </div>
                                    ) : (
                                        <div>
                                            <h4>✅ Verification Complete</h4>
                                            <p>Passed: {verifyResults[problem.id].passed} / {verifyResults[problem.id].total}</p>
                                            
                                            {verifyResults[problem.id].results?.filter(r => !r.passed).length > 0 && (
                                                <div className="failures">
                                                    <h5>Failures:</h5>
                                                    {verifyResults[problem.id].results.filter(r => !r.passed).map((fail, idx) => (
                                                        <div key={idx} className="fail-card">
                                                            <strong>{fail.label}</strong>
                                                            <div>Input: {String(fail.input)}</div>
                                                            <div>Expected: {fail.expectedOutput}</div>
                                                            <div>Actual: {fail.actualOutput}</div>
                                                            {fail.error && <div>Error: {fail.error}</div>}
                                                            <div>Time: {fail.durationMs}ms</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {problems.length === 0 && !loading && (
                    <div className="no-data">No problems found in the database.</div>
                )}
            </div>

            {hasMore && (
                <div className="load-more-container">
                    <button 
                        className="load-more-btn"
                        onClick={() => fetchProblems(true)}
                        disabled={loading}
                    >
                        {loading ? 'Loading...' : 'Load More Problems'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default Resolve;
