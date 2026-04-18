import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Editor from '@monaco-editor/react';
import { 
    Box, Plus, Trash2, Copy, Download,
    Layers, Settings, HardDrive, Network,
    RefreshCw, Server, AlertCircle
} from 'lucide-react';
import yaml from 'js-yaml';

export default function ToolsDockerCompose() {
    const [services, setServices] = useState([
        {
            id: 'web-1',
            name: 'web',
            image: 'nginx:alpine',
            ports: ['80:80'],
            environment: [],
            volumes: [],
            dependsOn: []
        }
    ]);
    const [version, setVersion] = useState('3.8');
    const [yamlOutput, setYamlOutput] = useState('');

    const generateYaml = () => {
        const composeObj = {
            version: version,
            services: {}
        };

        services.forEach(svc => {
            if (!svc.name.trim()) return;
            const container = { image: svc.image || 'ubuntu:latest' };
            
            if (svc.ports.length > 0 && svc.ports[0]) container.ports = svc.ports.filter(Boolean);
            
            if (svc.environment.length > 0 && svc.environment[0]) {
                container.environment = svc.environment.filter(Boolean);
            }
            
            if (svc.volumes.length > 0 && svc.volumes[0]) {
                container.volumes = svc.volumes.filter(Boolean);
            }

            if (svc.dependsOn.length > 0 && svc.dependsOn[0]) {
                container.depends_on = svc.dependsOn.filter(Boolean);
            }

            composeObj.services[svc.name] = container;
        });

        const dump = yaml.dump(composeObj, { indent: 2, lineWidth: -1 });
        setYamlOutput(dump);
    };

    useEffect(() => {
        generateYaml();
    }, [services, version]);

    const addService = () => {
        setServices([...services, {
            id: `svc-${Date.now()}`,
            name: `service${services.length + 1}`,
            image: 'node:18',
            ports: [],
            environment: [],
            volumes: [],
            dependsOn: []
        }]);
    };

    const removeService = (id) => {
        if (services.length === 1) return;
        setServices(services.filter(s => s.id !== id));
    };

    const updateService = (id, field, value) => {
        setServices(services.map(s => {
            if (s.id === id) {
                return { ...s, [field]: value };
            }
            return s;
        }));
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(yamlOutput);
    };

    const handleDownload = () => {
        const blob = new Blob([yamlOutput], { type: 'text/yaml' });
        const link = document.createElement('a');
        link.download = 'docker-compose.yml';
        link.href = URL.createObjectURL(blob);
        link.click();
    };

    return (
        <div style={{ minHeight: '100vh', color: '#fff' }}>
            <Helmet>
                <title>Docker Compose Builder | Container Orchestration UI | Whizan AI</title>
                <meta name="description" content="Visually build multi-container Docker applications. Add services, ports, volumes, and environment variables to automatically generate a perfect docker-compose.yml file." />
                <meta name="keywords" content="docker compose generator, visual docker compose, container orchestration tools, devops ui builder, docker-compose.yml export" />
                <link rel="canonical" href="https://whizan.xyz/tools/docker-compose" />
            </Helmet>

            <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '20px' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '40px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Box color="#38bdf8" size={28} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>Docker Compose Builder</h1>
                        <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Visually orchestrate multi-container environments and auto-generate YAML.</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '40px', alignItems: 'start' }}>
                    {/* Visual Builder UI */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', padding: '15px 25px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Settings size={18} color="#38bdf8" />
                                <span style={{ fontWeight: 800 }}>Compose Version</span>
                            </div>
                            <select 
                                value={version} 
                                onChange={(e) => setVersion(e.target.value)}
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 15px', borderRadius: '10px', color: '#fff', outline: 'none' }}
                            >
                                <option value="3.8">3.8</option>
                                <option value="3">3</option>
                                <option value="2.4">2.4</option>
                            </select>
                        </div>

                        {services.map((svc, index) => (
                            <div key={svc.id} style={{ background: '#0f172a', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', padding: '25px', position: 'relative' }}>
                                {services.length > 1 && (
                                    <button 
                                        onClick={() => removeService(svc.id)}
                                        style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.7 }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                                
                                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', marginBottom: '8px', display: 'block' }}>SERVICE NAME</label>
                                        <input 
                                            value={svc.name}
                                            onChange={(e) => updateService(svc.id, 'name', e.target.value)}
                                            placeholder="e.g. backend"
                                            style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px', color: '#fff' }}
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8', marginBottom: '8px', display: 'block' }}>DOCKER IMAGE</label>
                                        <input 
                                            value={svc.image}
                                            onChange={(e) => updateService(svc.id, 'image', e.target.value)}
                                            placeholder="e.g. node:18-alpine"
                                            style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px', color: '#fff' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><Network size={14} /> PORTS (Host:Container)</label>
                                        <textarea 
                                            value={svc.ports.join('\n')}
                                            onChange={(e) => updateService(svc.id, 'ports', e.target.value.split('\n'))}
                                            placeholder="8080:80"
                                            rows={2}
                                            style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px', color: '#fff', resize: 'vertical' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><Settings size={14} /> ENV VARIABLES</label>
                                        <textarea 
                                            value={svc.environment.join('\n')}
                                            onChange={(e) => updateService(svc.id, 'environment', e.target.value.split('\n'))}
                                            placeholder="NODE_ENV=production"
                                            rows={2}
                                            style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px', color: '#fff', resize: 'vertical' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><HardDrive size={14} /> VOLUMES</label>
                                        <textarea 
                                            value={svc.volumes.join('\n')}
                                            onChange={(e) => updateService(svc.id, 'volumes', e.target.value.split('\n'))}
                                            placeholder="./data:/var/lib/mysql"
                                            rows={2}
                                            style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px', color: '#fff', resize: 'vertical' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><Layers size={14} /> DEPENDS ON</label>
                                        <textarea 
                                            value={svc.dependsOn.join('\n')}
                                            onChange={(e) => updateService(svc.id, 'dependsOn', e.target.value.split('\n'))}
                                            placeholder="database_service"
                                            rows={2}
                                            style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px', color: '#fff', resize: 'vertical' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button 
                            onClick={addService}
                            style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px dashed rgba(56, 189, 248, 0.4)', color: '#38bdf8', padding: '15px', borderRadius: '20px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}
                        >
                            <Plus size={18} /> Add New Service
                        </button>
                    </div>

                    {/* YAML Output */}
                    <div style={{ background: '#0a0a0f', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'sticky', top: '40px', height: 'calc(100vh - 150px)' }}>
                        <div style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ fontWeight: 800, color: '#38bdf8' }}>docker-compose.yml</div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={handleCopy} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Copy size={14} /> Copy
                                </button>
                                <button onClick={handleDownload} style={{ background: '#38bdf8', border: 'none', color: '#000', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Download size={14} /> Save
                                </button>
                            </div>
                        </div>
                        <div style={{ flex: 1 }}>
                            <Editor
                                theme="vs-dark"
                                language="yaml"
                                value={yamlOutput}
                                options={{ 
                                    readOnly: true, 
                                    minimap: { enabled: false }, 
                                    fontSize: 14,
                                    padding: { top: 20 }
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Extensive SEO Content */}
                <div style={{ 
                    marginTop: '80px', 
                    padding: '80px 40px', 
                    background: 'rgba(15, 23, 42, 0.3)', 
                    borderRadius: '40px', 
                    border: '1px solid rgba(255,255,255,0.05)',
                    lineHeight: '1.8',
                    color: '#94a3b8'
                }}>
                    <h2 style={{ color: '#fff', fontSize: '2.5rem', fontWeight: 900, marginBottom: '40px' }}>Mastering Multi-Container Orchestration</h2>
                    <p style={{ fontSize: '1.2rem', marginBottom: '30px' }}>
                        In modern cloud-native development, applications are rarely relegated to a single monolithic runtime. 
                        A standard web application usually requires an API backend, a frontend client, a relational database, 
                        and memory caches like Redis. **Docker Compose** is the definitive tool used to define, launch, and 
                        govern these multi-container applications locally before graduating them to Kubernetes.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', margin: '60px 0' }}>
                        <div style={{ padding: '30px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '24px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                            <h3 style={{ color: '#38bdf8', fontSize: '1.2rem', fontWeight: 800, marginBottom: '15px' }}>Environment Drift Prevention</h3>
                            <p style={{ fontSize: '0.9rem' }}>
                                Using a `docker-compose.yml` ensures that the "it works on my machine" problem is eradicated. 
                                By defining exact image tags, volume mounts, and network links in YAML, any developer on your team 
                                can spin up a perfect byte-for-byte replica of the staging environment with a single `docker compose up` command.
                            </p>
                        </div>
                        <div style={{ padding: '30px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                            <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 800, marginBottom: '15px' }}>Network Bridging Magic</h3>
                            <p style={{ fontSize: '0.9rem' }}>
                                A hidden superpower of Compose is the default bridge network. Services can communicate with each other 
                                using their defined `servicename` as a valid hostname. For instance, your Node.js app can connect directly 
                                to your Postgres container via `postgres:5432` without worrying about dynamic IP assignments.
                            </p>
                        </div>
                    </div>

                    <section style={{ marginTop: '50px' }}>
                        <h3 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 700, marginBottom: '20px' }}>Advanced Properties Breakdown</h3>
                        <ul style={{ paddingLeft: '20px', marginBottom: '30px' }}>
                            <li style={{ marginBottom: '15px' }}>**Volumes (`./local:/container`)**: Used for data persistence. Databases like MySQL will lose all records on container restart unless a volume mapping physically stores the data on the host machine.</li>
                            <li style={{ marginBottom: '15px' }}>**Ports (`host:container`)**: Dictates public availability. Binding `8080:80` maps port 80 inside the container to port 8080 on your local laptop browser. Crucial for web traffic.</li>
                            <li style={{ marginBottom: '15px' }}>**Depends_on**: Ensures correct startup sequences. If your application crashes because the database hasn't booted yet, adding a `depends_on: [ db ]` rule instructs Compose to queue the container initializations accordingly.</li>
                        </ul>
                    </section>
                </div>

            </div>
        </div>
    );
}
