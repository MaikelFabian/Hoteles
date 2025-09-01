import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [isLargeScreen, setIsLargeScreen] = React.useState(window.innerWidth >= 992);

  React.useEffect(() => {
    const handleResize = () => {
      const largeScreen = window.innerWidth >= 992;
      setIsLargeScreen(largeScreen);
      if (largeScreen) {
        setSidebarOpen(false); // Reset sidebar state on large screens
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-vh-100 bg-light">
      {/* Header */}
      <Header 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />
      
      <div className="d-flex" style={{ paddingTop: '4rem' }}>
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        
        {/* Main Content */}
        <main 
          className="flex-fill" 
          style={{ 
            marginLeft: isLargeScreen ? '16rem' : '0',
            transition: 'margin-left 0.3s ease-in-out'
          }}
        >
          <div className="p-4" style={{ minHeight: 'calc(100vh - 4rem)' }}>
            {children || <Outlet />}
          </div>
        </main>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Layout;