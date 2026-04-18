import { 
    Terminal, Database, GitBranch, Zap, BrainCircuit, 
    ShieldCheck, Search, FileJson, Binary, FileBox, 
    Workflow, Crosshair, Radio, ShieldAlert, Shield, Radar, Eye,
    Image as ImageIcon, Box, Cloud, Server
} from 'lucide-react';

export const TOOLS_NAV_LINKS = [
    {
        category: 'Playgrounds',
        tools: [
            { name: 'Codesandbox', path: '/tools/codesandbox', icon: Terminal, color: '#3b82f6' },
            { name: 'SQL Editor', path: '/tools/sql-editor', icon: Database, color: '#10b981' },
            { name: 'Git Playground', path: '/tools/git-playground', icon: GitBranch, color: '#f59e0b' },
            { name: 'ML Sandbox', path: '/tools/ml-sandbox', icon: BrainCircuit, color: '#8b5cf6' },
        ]
    },
    {
        category: 'DevOps & Cloud',
        tools: [
            { name: 'Docker Builder', path: '/tools/docker-compose', icon: Box, color: '#0ea5e9' },
            { name: 'K8s Validator', path: '/tools/k8s-validator', icon: Cloud, color: '#326ce5' },
            { name: 'Nginx Config', path: '/tools/nginx-config', icon: Server, color: '#10b981' },
            { name: 'Port Scanner', path: '/tools/port-checker', icon: Radar, color: '#06b6d4' },
        ]
    },
    {
        category: 'Networking & API',
        tools: [
            { name: 'API Tester', path: '/tools/api-tester', icon: Zap, color: '#06b6d4' },
            { name: 'GraphQL Runner', path: '/tools/graphql', icon: Workflow, color: '#a855f7' },
            { name: 'API Sniper', path: '/tools/api-sniper', icon: Crosshair, color: '#ef4444' },
            { name: 'Webhook Tester', path: '/tools/webhook', icon: Radio, color: '#f97316' },
        ]
    },
    {
        category: 'Security & Web',
        tools: [
            { name: 'CORS Tester', path: '/tools/cors-tester', icon: ShieldAlert, color: '#f59e0b' },
            { name: 'CSP Builder', path: '/tools/csp-generator', icon: Shield, color: '#10b981' },
            { name: 'JWT Decoder', path: '/tools/jwt-decoder', icon: ShieldCheck, color: '#f59e0b' },
            { name: 'Meta Preview', path: '/tools/meta-preview', icon: Eye, color: '#6366f1' },
        ]
    },
    {
        category: 'Data Utilities',
        tools: [
            { name: 'Code Snippets', path: '/tools/screenshot-generator', icon: ImageIcon, color: '#ec4899' },
            { name: 'Regex Tester', path: '/tools/regex-tester', icon: Search, color: '#06b6d4' },
            { name: 'JSON Formatter', path: '/tools/json-formatter', icon: FileJson, color: '#10b981' },
            { name: 'Base64 Tool', path: '/tools/base64', icon: Binary, color: '#ec4899' },
            { name: 'Data Converter', path: '/tools/data-converter', icon: FileBox, color: '#2dd4bf' },
        ]
    }
];
