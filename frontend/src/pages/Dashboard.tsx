import React from 'react';
import { Building2, Bed, Users, Calendar } from 'lucide-react';

const Dashboard: React.FC = () => {
  const stats = [
    {
      name: 'Total Hoteles',
      value: '12',
      icon: Building2,
      color: 'bg-primary'
    },
    {
      name: 'Habitaciones',
      value: '248',
      icon: Bed,
      color: 'bg-success'
    },
    {
      name: 'Huéspedes',
      value: '1,234',
      icon: Users,
      color: 'bg-info'
    },
    {
      name: 'Reservas Activas',
      value: '89',
      icon: Calendar,
      color: 'bg-warning'
    }
  ];

  return (
    <div>
      <div className="mb-5">
        <h1 className="h4 fw-bold text-dark">Dashboard</h1>
        <p className="text-muted">Resumen general del sistema de reservas</p>
      </div>

      {/* Stats Grid */}
      <div className="row g-4 mb-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="col-12 col-md-6 col-lg-3">
              <div className="card h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className={`${stat.color} rounded p-3 me-3`}>
                      <Icon size={24} className="text-white" />
                    </div>
                    <div>
                      <p className="card-text small text-muted mb-1">{stat.name}</p>
                      <p className="h4 fw-bold text-dark mb-0">{stat.value}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header border-bottom">
          <h2 className="h5 mb-0 text-dark">Actividad Reciente</h2>
        </div>
        <div className="card-body">
          <div className="text-center text-muted py-5">
            <Calendar size={48} className="text-muted mb-3" />
            <p className="mb-0">No hay actividad reciente</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;