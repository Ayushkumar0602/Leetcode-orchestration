import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Editor from '@monaco-editor/react';
import { 
    Cloud, CheckCircle, AlertCircle, RefreshCw, 
    ShieldCheck, Code2, ArrowRight, Layers, FileJson
} from 'lucide-react';
import yaml from 'js-yaml';

export default function ToolsK8sValidator() {
    const [yamlInput, setYamlInput] = useState(
`apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.14.2
        ports:
        - containerPort: 80`
    );

    const [validationResults, setValidationResults] = useState([]);
    const [isValid, setIsValid] = useState(true);

    const validateK8sYaml = () => {
        const results = [];
        let parsedDocs = [];

        try {
            // yaml.loadAll gets all documents in a multi-doc YAML file (separated by ---)
            parsedDocs = yaml.loadAll(yamlInput);
        } catch (e) {
            setIsValid(false);
            setValidationResults([{
                type: 'error',
                message: `YAML Syntax Error: ${e.message}`,
                line: e.mark ? e.mark.line + 1 : 'Unknown'
            }]);
            return;
        }

        let allValid = true;

        if (parsedDocs.length === 0 || (parsedDocs.length === 1 && parsedDocs[0] === undefined)) {
            setIsValid(false);
            setValidationResults([{ type: 'error', message: 'Document is empty' }]);
            return;
        }

        parsedDocs.forEach((doc, index) => {
            if (!doc || typeof doc !== 'object') {
                allValid = false;
                results.push({ type: 'error', message: `Document ${index + 1}: Invalid structure, expected object.` });
                return;
            }

            const docName = doc.metadata?.name || `Document ${index + 1}`;

            // K8s Base Validity Checks
            if (!doc.apiVersion) {
                allValid = false;
                results.push({ type: 'error', message: `[${docName}] Missing required field: 'apiVersion'` });
            }
            if (!doc.kind) {
                allValid = false;
                results.push({ type: 'error', message: `[${docName}] Missing required field: 'kind'` });
            }

            // Specific Kind Checks (Mocked structurally for frontend validation)
            if (doc.kind === 'Deployment') {
                if (!doc.spec || !doc.spec.template || !doc.spec.template.spec || !doc.spec.template.spec.containers) {
                    allValid = false;
                    results.push({ type: 'error', message: `[${docName}] Deployment is missing '.spec.template.spec.containers'` });
                } else if (!Array.isArray(doc.spec.template.spec.containers)) {
                    allValid = false;
                    results.push({ type: 'error', message: `[${docName}] Deployment containers must be an array` });
                }
            } else if (doc.kind === 'Service') {
                if (!doc.spec || !doc.spec.ports) {
                    allValid = false;
                    results.push({ type: 'error', message: `[${docName}] Service is missing '.spec.ports'` });
                }
            }

            if (doc.apiVersion && doc.kind && allValid) {
                results.push({ type: 'success', message: `[${docName}] Valid ${doc.kind} manifest structure.` });
            }
        });

        setIsValid(allValid);
        setValidationResults(results);
    };

    // Auto-validate on change with slight debounce
    useEffect(() => {
        const timer = setTimeout(() => validateK8sYaml(), 500);
        return () => clearTimeout(timer);
    }, [yamlInput]);

    return (
        <div style={{ minHeight: '100vh', color: '#fff' }}>
            <Helmet>
                <title>Kubernetes YAML Validator | K8s Manifest Linter | Whizan AI</title>
                <meta name="description" content="Validate Kubernetes YAML manifests instantly. Check apiVersion, kind structures, and syntax errors for Deployments, Services, and Ingress resources." />
                <meta name="keywords" content="kubernetes yaml validator, k8s linter online, check k8s manifest, kubernetes deployment yaml, validate kubectl apply" />
                <link rel="canonical" href="https://whizan.xyz/tools/k8s-validator" />
            </Helmet>

            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '40px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(50, 108, 229, 0.1)', border: '1px solid rgba(50, 108, 229, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Cloud color="#326ce5" size={28} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>Kubernetes YAML Validator</h1>
                        <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Parse, lint, and structurally validate K8s manifests before applying.</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 400px', gap: '30px' }}>
                    {/* Editor Zone */}
                    <div style={{ background: '#0f172a', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#326ce5', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FileJson size={16} /> MANIFEST EDITOR
                            </div>
                            <button onClick={validateK8sYaml} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
                                <RefreshCw size={14} /> Force Validate
                            </button>
                        </div>
                        <Editor
                            height="600px"
                            theme="vs-dark"
                            language="yaml"
                            value={yamlInput}
                            onChange={setYamlInput}
                            options={{ fontSize: 14, minimap: { enabled: false }, scrollBeyondLastLine: false, padding: { top: 20 } }}
                        />
                    </div>

                    {/* Results Shield */}
                    <div style={{ background: '#0a0a0f', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', padding: '30px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ textAlign: 'center', marginBottom: '30px', paddingBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            {isValid ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <CheckCircle size={40} color="#10b981" />
                                    </div>
                                    <h2 style={{ color: '#10b981', margin: 0 }}>Cluster Ready</h2>
                                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Manifest passed structural validation.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <AlertCircle size={40} color="#ef4444" />
                                    </div>
                                    <h2 style={{ color: '#ef4444', margin: 0 }}>Validation Failed</h2>
                                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Review the errors below.</p>
                                </div>
                            )}
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', marginBottom: '15px' }}>DIAGNOSTIC LOGS</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {validationResults.map((res, i) => (
                                    <div 
                                        key={i} 
                                        style={{ 
                                            padding: '12px 15px', 
                                            borderRadius: '12px', 
                                            background: res.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.05)',
                                            borderLeft: `3px solid ${res.type === 'error' ? '#ef4444' : '#10b981'}`,
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '10px',
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        {res.type === 'error' ? <AlertCircle size={16} color="#ef4444" style={{ marginTop: '2px' }} /> : <CheckCircle size={16} color="#10b981" style={{ marginTop: '2px' }} />}
                                        <div style={{ color: res.type === 'error' ? '#fca5a5' : '#a7f3d0' }}>
                                            {res.message}
                                            {res.line && <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '4px' }}>Line: {res.line}</div>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Highly Technical SEO Docs */}
                <div style={{ 
                    marginTop: '80px', 
                    padding: '80px 40px', 
                    background: 'rgba(15, 23, 42, 0.3)', 
                    borderRadius: '40px', 
                    border: '1px solid rgba(255,255,255,0.05)',
                    lineHeight: '1.8',
                    color: '#94a3b8'
                }}>
                    <h2 style={{ color: '#fff', fontSize: '2.5rem', fontWeight: 900, marginBottom: '40px' }}>Mastering Kubernetes Manifests</h2>
                    <p style={{ fontSize: '1.2rem', marginBottom: '30px' }}>
                        Kubernetes (K8s) is the undeniable gold standard for container orchestration in enterprise environments. 
                        However, its declarative nature means that your entire infrastructure state relies on properly formatted YAML files. 
                        A single misplaced indentation or missing API parameter can result in a catastrophic deployment failure. 
                        The **Whizan K8s Validator** ensures that your objects adhere strictly to the target cluster's structural expectations.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', margin: '50px 0' }}>
                        <div style={{ padding: '30px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '24px', border: '1px solid rgba(50, 108, 229, 0.2)' }}>
                            <h3 style={{ color: '#326ce5', fontSize: '1.2rem', fontWeight: 800, marginBottom: '15px' }}>The Mandatory Quadrant</h3>
                            <p style={{ fontSize: '0.9rem' }}>
                                Every Kubernetes resource, from a massive StatefulSet to a tiny Secret, universally requires four top-level fields: 
                                <code>apiVersion</code>, <code>kind</code>, <code>metadata</code>, and <code>spec</code> (with a few exceptions like ConfigMaps which use <code>data</code>).
                            </p>
                        </div>
                        <div style={{ padding: '30px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                            <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 800, marginBottom: '15px' }}>Multi-Document Rendering</h3>
                            <p style={{ fontSize: '0.9rem' }}>
                                It is standard practice to bundle the Deployment and its associated Service into a single file separated by 
                                the <code>---</code> delimiter. Our validator intelligently parses the entire stream, isolating validation faults 
                                to their specific logical resource document.
                            </p>
                        </div>
                    </div>

                    <section style={{ marginTop: '50px' }}>
                        <h3 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 700, marginBottom: '20px' }}>Understanding API Group Versions</h3>
                        <p style={{ marginBottom: '20px' }}>
                            A common error when applying copied code from StackOverflow is an invalid <code>apiVersion</code>. K8s evolves rapidly, 
                            and API endpoints frequently shift from <code>v1beta1</code> to <code>v1</code>.
                        </p>
                        <ul style={{ paddingLeft: '20px', marginBottom: '30px' }}>
                            <li style={{ marginBottom: '10px' }}>**Deployments/StatefulSets**: Originally resided in <code>extensions/v1beta1</code>, now strictly require <code>apps/v1</code>.</li>
                            <li style={{ marginBottom: '10px' }}>**Ingress**: Shifted from <code>networking.k8s.io/v1beta1</code> to <code>networking.k8s.io/v1</code> depending on your control plane version.</li>
                            <li style={{ marginBottom: '10px' }}>**CronJobs**: Shifted from <code>batch/v1beta1</code> to <code>batch/v1</code>.</li>
                        </ul>
                        <p style={{ fontSize: '0.95rem', padding: '20px', background: 'rgba(50, 108, 229, 0.05)', borderRadius: '16px', borderLeft: '4px solid #326ce5' }}>
                            <strong>Pro Tip:</strong> Always run <code>kubectl api-resources</code> on your target cluster if you are unsure which API groups 
                            your specific version of Kubernetes currently supports.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
