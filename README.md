# Sistema de Reservas Hoteleras

Sistema de gestión hotelera con Laravel (backend) y React + TypeScript (frontend).

## 📁 Estructura del Proyecto

## 🚀 Instalación Rápida

### Requisitos
- Docker Desktop
- Git

### Pasos

1. **Clonar repositorio:**
   ```bash
   git clone <URL_REPOSITORIO>
   cd <NOMBRE_PROYECTO>
   ```

2. **Ejecutar con Docker:**
   ```bash
   docker-compose up --build -d
   ```

3. **Inicializar base de datos:**
   ```bash
   docker-compose exec backend php artisan migrate --seed
   ```

## 🌐 Accesos

- **Frontend:** http://localhost:5173
- **API:** http://localhost:8000/api
- **Swagger:** http://localhost:8000/api/documentation

## 🗄️ Base de Datos

**PostgreSQL** configurada automáticamente:

```env
DB_CONNECTION=pgsql
DB_HOST=database
DB_PORT=5432
DB_DATABASE=hotel
DB_USERNAME=postgres
DB_PASSWORD=password
```

## 📊 Funcionalidades

- ✅ Gestión de hoteles
- ✅ Gestión de habitaciones (SIMPLE, DOBLE, TRIPLE, CUADRUPLE)
- ✅ Gestión de huéspedes
- ✅ Sistema de reservas
- ✅ API REST documentada
- ✅ Datos de prueba incluidos

## 🛠️ Comandos Útiles

```bash
# Ver estado
docker-compose ps

# Ver logs
docker-compose logs -f

# Detener
docker-compose down

# Reiniciar
docker-compose restart
```

## 👨‍💻 Autor

Maikel Fabián Meléndez Castaño