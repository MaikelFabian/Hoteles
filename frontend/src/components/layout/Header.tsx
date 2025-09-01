import React from 'react';
import { Menu, Bell, User, Search } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
  sidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="bg-white shadow-sm border-bottom fixed-top">
      <div className="container-fluid px-3 px-lg-4">
        <div className="d-flex justify-content-between align-items-center" style={{ height: '4rem' }}>
          {/* Left side */}
          <div className="d-flex align-items-center">
            <button
              onClick={onMenuClick}
              className="btn btn-outline-secondary d-lg-none me-3"
              type="button"
            >
              <Menu size={20} />
            </button>
            
            <div className="d-flex align-items-center">
              <h1 className="h4 mb-0 fw-bold text-dark">
                Sistema de Reservas
              </h1>
            </div>
          </div>

          {/* Search bar */}
          <div className="d-none d-md-block flex-fill mx-4" style={{ maxWidth: '32rem' }}>
            <div className="position-relative">
              <div className="position-absolute top-50 start-0 translate-middle-y ps-3">
                <Search size={16} className="text-muted" />
              </div>
              <input
                type="text"
                placeholder="Buscar..."
                className="form-control ps-5"
              />
            </div>
          </div>

          {/* Right side */}
          <div className="d-flex align-items-center gap-2">
            <button className="btn btn-outline-secondary">
              <Bell size={20} />
            </button>
            
            <div className="dropdown">
              <button className="btn btn-outline-secondary dropdown-toggle d-flex align-items-center gap-2" type="button" data-bs-toggle="dropdown">
                <User size={20} />
                <span className="d-none d-md-inline">Admin</span>
              </button>
              <ul className="dropdown-menu">
                <li><a className="dropdown-item" href="#">Perfil</a></li>
                <li><a className="dropdown-item" href="#">Configuración</a></li>
                <li><hr className="dropdown-divider" /></li>
                <li><a className="dropdown-item" href="#">Cerrar Sesión</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;