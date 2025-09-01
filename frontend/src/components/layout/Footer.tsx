import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-top mt-auto">
      <div className="container-fluid py-3 px-4">
        <div className="d-flex justify-content-between align-items-center">
          <div className="text-muted small">
            © 2024 Sistema de Reservas. Todos los derechos reservados.
          </div>
          <div className="text-muted small">
            Versión 1.0.0
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;