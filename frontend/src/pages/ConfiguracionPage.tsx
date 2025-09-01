import React, { useState } from 'react';
import { Settings, User, Bell, Shield, Database, Info } from 'lucide-react';
import { Button, Input } from '../components/ui';

const ConfiguracionPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    siteName: 'Sistema de Reservas Hoteleras',
    adminEmail: 'admin@hotel.com',
    timezone: 'America/Bogota',
    currency: 'COP',
    language: 'es',
    notifications: {
      email: true,
      push: false,
      sms: false
    }
  });

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'usuario', name: 'Usuario', icon: User },
    { id: 'notificaciones', name: 'Notificaciones', icon: Bell },
    { id: 'seguridad', name: 'Seguridad', icon: Shield },
    { id: 'sistema', name: 'Sistema', icon: Database },
    { id: 'acerca', name: 'Acerca de', icon: Info }
  ];

  const handleSave = () => {
    // Aquí se implementaría la lógica para guardar la configuración
    console.log('Configuración guardada:', settings);
    alert('Configuración guardada exitosamente');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="row g-4">
            <div className="col-12">
              <label className="form-label fw-medium text-dark">
                Nombre del Sistema
              </label>
              <Input
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                placeholder="Nombre del sistema"
              />
            </div>
            <div className="col-12">
              <label className="form-label fw-medium text-dark">
                Email del Administrador
              </label>
              <Input
                type="email"
                value={settings.adminEmail}
                onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                placeholder="admin@hotel.com"
              />
            </div>
            <div className="col-12">
              <label className="form-label fw-medium text-dark">
                Zona Horaria
              </label>
              <select 
                className="form-select"
                value={settings.timezone}
                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
              >
                <option value="America/Bogota">América/Bogotá (GMT-5)</option>
                <option value="America/Mexico_City">América/Ciudad de México (GMT-6)</option>
                <option value="America/New_York">América/Nueva York (GMT-5)</option>
              </select>
            </div>
            <div className="col-12">
              <label className="form-label fw-medium text-dark">
                Moneda
              </label>
              <select 
                className="form-select"
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              >
                <option value="COP">Peso Colombiano (COP)</option>
                <option value="USD">Dólar Americano (USD)</option>
                <option value="EUR">Euro (EUR)</option>
                <option value="MXN">Peso Mexicano (MXN)</option>
              </select>
            </div>
          </div>
        );
      
      case 'notificaciones':
        return (
          <div className="row g-4">
            <div className="col-12">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h3 className="h6 fw-medium text-dark mb-1">Notificaciones por Email</h3>
                  <p className="text-muted small mb-0">Recibir notificaciones importantes por correo</p>
                </div>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="emailNotifications"
                    checked={settings.notifications.email}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, email: e.target.checked }
                    })}
                  />
                </div>
              </div>
            </div>
            
            <div className="col-12">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h3 className="h6 fw-medium text-dark mb-1">Notificaciones Push</h3>
                  <p className="text-muted small mb-0">Recibir notificaciones en el navegador</p>
                </div>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="pushNotifications"
                    checked={settings.notifications.push}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, push: e.target.checked }
                    })}
                  />
                </div>
              </div>
            </div>
            
            <div className="col-12">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h3 className="h6 fw-medium text-dark mb-1">Notificaciones SMS</h3>
                  <p className="text-muted small mb-0">Recibir notificaciones por mensaje de texto</p>
                </div>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="smsNotifications"
                    checked={settings.notifications.sms}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, sms: e.target.checked }
                    })}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'acerca':
        return (
          <div className="row g-4">
            <div className="col-12">
              <div className="text-center">
                <div className="mx-auto bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mb-4" style={{width: '4rem', height: '4rem'}}>
                  <Settings size={32} className="text-primary" />
                </div>
                <h3 className="h5 fw-medium text-dark mb-2">
                  Sistema de Reservas Hoteleras
                </h3>
                <p className="text-muted small mb-4">Versión 1.0.0</p>
                <div className="bg-light rounded p-4 text-start">
                  <h4 className="fw-medium text-dark mb-3">Características:</h4>
                  <ul className="list-unstyled text-muted small">
                    <li className="mb-1">• Gestión completa de hoteles y habitaciones</li>
                    <li className="mb-1">• Administración de huéspedes y reservas</li>
                    <li className="mb-1">• Sistema de disponibilidad en tiempo real</li>
                    <li className="mb-1">• Interfaz responsive y moderna</li>
                    <li className="mb-1">• API REST con Laravel</li>
                    <li className="mb-1">• Frontend con React y TypeScript</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="text-center py-5">
            <p className="text-muted">Sección en desarrollo...</p>
          </div>
        );
    }
  };

  return (
    <div>
      <div className="mb-5">
        <h1 className="h4 fw-bold text-dark">Configuración</h1>
        <p className="text-muted">Administra la configuración del sistema</p>
      </div>

      <div className="card">
        {/* Tabs */}
        <div className="card-header border-bottom">
          <nav className="nav nav-tabs card-header-tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`nav-link d-flex align-items-center gap-2 ${
                    activeTab === tab.id ? 'active' : ''
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="card-body">
          {renderTabContent()}
        </div>

        {/* Save Button */}
        {(activeTab === 'general' || activeTab === 'notificaciones') && (
          <div className="card-footer bg-light border-top d-flex justify-content-end">
            <Button onClick={handleSave} className="btn-primary">
              Guardar Cambios
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfiguracionPage;