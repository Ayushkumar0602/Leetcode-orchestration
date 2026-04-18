import React from 'react';
import ToolsSidebar from './ToolsSidebar';
import ToolsNavbar from './ToolsNavbar';

export default function ToolsLayout({ children }) {
    const [isCollapsed, setIsCollapsed] = React.useState(false);

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0f' }}>
            {/* Sidebar */}
            <div style={{ flexShrink: 0 }}>
                <ToolsSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
            </div>

            {/* Main Content Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                {/* Navbar */}
                <ToolsNavbar />

                {/* Content */}
                <main style={{ 
                    flex: 1, 
                    padding: '20px', 
                    marginLeft: isCollapsed ? '80px' : '260px',
                    marginTop: '70px',  /* Height of navbar */
                    transition: 'margin-left 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }} className="tools-main-content">
                    {children}
                </main>
            </div>

            <style>{`
                /* Media query to handle responsive margins */
                @media (max-width: 1200px) {
                    .tools-main-content {
                        margin-left: 0 !important;
                    }
                }
            `}</style>
        </div>
    );
}
