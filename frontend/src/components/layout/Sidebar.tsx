import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Building2, 
  Bed, 
  Users, 
  Calendar, 
  Settings,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const [isLargeScreen, setIsLargeScreen] = React.useState(window.innerWidth >= 992);

  React.useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 992);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Hoteles', href: '/hoteles', icon: Building2 },
    { name: 'Habitaciones', href: '/habitaciones', icon: Bed },
    { name: 'Huéspedes', href: '/huespedes', icon: Users },
    { name: 'Reservas', href: '/reservas', icon: Calendar },
    { name: 'Configuración', href: '/configuracion', icon: Settings },
  ];

  // Show sidebar if it's a large screen OR if it's open on mobile
  const shouldShow = isLargeScreen || isOpen;

  return (
    <>
      {/* Mobile backdrop - only show on mobile when sidebar is open */}
      {isOpen && !isLargeScreen && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
          style={{ zIndex: 1040 }}
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`bg-white shadow h-100 ${
          isLargeScreen ? 'position-sticky' : 'position-fixed'
        }`}
        style={{ 
          width: '16rem', 
          zIndex: 1050,
          top: isLargeScreen ? '4rem' : '0',
          left: '0',
          transform: shouldShow ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease-in-out'
        }}
      >
        <div className="d-flex align-items-center justify-content-between p-3 border-bottom" style={{ height: '4rem' }}>
          <span className="h5 mb-0 fw-semibold">
            Menú
          </span>
          {/* Close button - only show on mobile */}
          {!isLargeScreen && (
            <button
              onClick={onClose}
              className="btn btn-outline-secondary"
              type="button"
            >
              <X size={20} />
            </button>
          )}
        </div>
        
        <nav className="p-3">
          <ul className="nav nav-pills flex-column gap-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name} className="nav-item">
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      `nav-link d-flex align-items-center gap-2 ${
                        isActive
                          ? 'active'
                          : 'text-dark'
                      }`
                    }
                    onClick={() => {
                      // Close sidebar on mobile when clicking a link
                      if (!isLargeScreen) {
                        onClose();
                      }
                    }}
                  >
                    <Icon size={20} />
                    {item.name}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;