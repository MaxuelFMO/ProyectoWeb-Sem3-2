# Sistema de Patrimonio - Frontend

Sistema integral para el control y trazabilidad de movimientos patrimoniales en instituciones. Frontend moderno construido con Next.js 16, TypeScript, Tailwind CSS y componentes UI profesionales.

## 🚀 Características

- **Autenticación JWT**: Sistema seguro de login con tokens JWT
- **Gestión de Personas**: CRUD completo para administrar usuarios responsables
- **Registro de Desplazamientos**: Documentación de movimientos de bienes
- **Historial de Auditoría**: Registro detallado de todas las operaciones
- **Dark Theme**: Interfaz moderna con colores oscuros, naranja y cian
- **Componentes Reutilizables**: Toast notifications, formularios validados, tablas paginadas
- **Responsive Design**: Compatible con laptop, tablet y móvil
- **API Hooks**: Custom hooks para gestión de datos (usePersons, useDisplacements, useHistorial)

## 📋 Requisitos Previos

- Node.js 18+ y npm/pnpm
- Backend Express funcionando en `http://localhost:3001`
- Base de datos MySQL con tablas configuradas

## 🛠️ Instalación

### 1. Clonar el repositorio

```bash
git clone <your-repo-url>
cd sistema-patrimonio-frontend
```

### 2. Instalar dependencias

```bash
pnpm install
# o
npm install
```

### 3. Configurar variables de entorno

Copia `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

Edita `.env.local` con tu URL de API:

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 4. Ejecutar el servidor de desarrollo

```bash
pnpm dev
# o
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 📁 Estructura del Proyecto

```
/vercel/share/v0-project
├── app/
│   ├── page.tsx                    # Landing page
│   ├── auth/login/page.tsx         # Página de login
│   ├── dashboard/
│   │   ├── layout.tsx              # Layout dashboard con sidebar
│   │   ├── page.tsx                # Dashboard overview
│   │   ├── personas/page.tsx       # Gestión de personas
│   │   ├── desplazamientos/page.tsx # Gestión de desplazamientos
│   │   └── historial/page.tsx      # Historial de movimientos
│   └── layout.tsx                  # Layout principal con providers
├── components/
│   ├── ui/                         # Componentes UI base
│   ├── domain/                     # Componentes de dominio
│   │   ├── person-form.tsx
│   │   └── displacement-form.tsx
│   ├── providers/
│   │   └── toast-provider.tsx
│   └── toaster.tsx
├── contexts/
│   └── auth-context.tsx            # Contexto de autenticación
├── hooks/
│   ├── use-auth.ts                 # Hook de autenticación
│   ├── use-persons.ts              # Hook para gestión de personas
│   ├── use-displacements.ts        # Hook para desplazamientos
│   ├── use-historial.ts            # Hook para historial
│   └── use-catalogs.ts             # Hook para catálogos
├── lib/
│   ├── api.ts                      # Cliente HTTP con JWT
│   └── utils.ts                    # Utilidades
├── tailwind.config.ts              # Configuración de Tailwind
└── ENDPOINTS.md                    # Documentación de endpoints

```

## 🔐 Autenticación

### Sistema de JWT

1. **Login**: El usuario ingresa email y contraseña
2. **Token**: El backend retorna un JWT que se almacena en localStorage
3. **Validación**: Cada solicitud incluye el token en el header `Authorization`
4. **Protección**: El middleware redirige a login si el token es inválido/expirado

### Flujo de Autenticación

```
Login → Backend JWT → localStorage → Header Authorization → API Calls
                              ↓
                         Si inválido → Redirect a Login
```

## 🎨 Temas y Colores

### Paleta de Colores Dark Theme

- **Fondo Principal**: `slate-900` (#0f1419)
- **Fondo Secundario**: `slate-800` (#1a2332)
- **Texto Principal**: `slate-50` (#f8fafc)
- **Acento Primario**: `orange-600` (#ea580c)
- **Acento Secundario**: `cyan-500` (#06b6d4)
- **Éxito**: `green-600` (#16a34a)
- **Error**: `red-600` (#dc2626)
- **Advertencia**: `yellow-600` (#ca8a04)

### Componentes Personalizados

- **Button**: Variantes primary, secondary, danger
- **Input**: Con validación y estilos personalizados
- **Card**: Con sombras y bordes redondeados
- **Toast**: Sistema de notificaciones centrado
- **Spinner**: Componente de carga con tamaños (sm, md, lg)

## 📚 Uso de Hooks

### usePersons

```typescript
const { getPersons, createPerson, updatePerson, deletePerson } = usePersons();

// Obtener listado
const personas = await getPersons({ search: 'Juan', page: 1, limit: 10 });

// Crear
await createPerson({ nombres: 'Juan', apellidos: 'Pérez', ... });

// Actualizar
await updatePerson(id, { nombres: 'Juan' });

// Eliminar
await deletePerson(id);
```

### useDisplacements

```typescript
const { getDisplacements, createDisplacement, updateDisplacement, deleteDisplacement } = useDisplacements();

// Obtener con filtros
const desplazamientos = await getDisplacements({ 
  id_motivo: 1, 
  id_estado: 2,
  page: 1 
});
```

### useHistorial

```typescript
const { getHistorial, getHistorialByPersona, recordMovimiento } = useHistorial();

// Obtener historial general
const movimientos = await getHistorial({ page: 1 });

// Por persona específica
const personaHistory = await getHistorialByPersona(id_persona);
```

### useCatalogs

```typescript
const { motivos, estados } = useCatalogs();

// Se cargan automáticamente al montar el componente
// motivos: array de { id_motivo, descripcion }
// estados: array de { id_estado, descripcion }
```

### useToast

```typescript
const { addToast, removeToast } = useToast();

// Variantes: success, error, info, warning
addToast('¡Éxito!', 'success');
addToast('Ocurrió un error', 'error');
```

## 🔌 Integración con Backend

### Endpoints Requeridos

Consulta `ENDPOINTS.md` para la documentación completa de endpoints esperados.

Endpoints principales:

```
POST   /api/auth/login              # Autenticación
GET    /api/personas                # Listado de personas
POST   /api/personas                # Crear persona
PUT    /api/personas/:id            # Actualizar persona
DELETE /api/personas/:id            # Eliminar persona

GET    /api/desplazamientos         # Listado
POST   /api/desplazamientos         # Crear
PUT    /api/desplazamientos/:id     # Actualizar
DELETE /api/desplazamientos/:id     # Eliminar

GET    /api/historial               # Listado de movimientos
GET    /api/motivos                 # Catálogo de motivos
GET    /api/estados                 # Catálogo de estados
```

### Configuración CORS

El backend debe permitir solicitudes desde el frontend:

```javascript
// Express backend
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

## 📦 Dependencias Principales

- **Next.js 16**: Framework React con SSR
- **TypeScript**: Tipado fuerte
- **Tailwind CSS**: Utilidades CSS
- **shadcn/ui**: Componentes reutilizables
- **Lucide React**: Iconos
- **Axios**: Cliente HTTP (alternativa)

## 🚀 Build y Deployment

### Producción

```bash
# Build
pnpm build

# Start
pnpm start
```

### Vercel Deployment

```bash
# Conectar a Vercel
vercel

# Deploy
vercel deploy --prod
```

Variables de entorno en Vercel:

```
NEXT_PUBLIC_API_URL=https://api.tudominio.com/api
```

## 🐛 Troubleshooting

### Error: "Cannot find module '@/components/...'"

- Verifica que la ruta sea correcta
- Asegúrate de que el archivo existe

### Error: "Token inválido" al hacer login

- Verifica que el backend esté corriendo en `http://localhost:3001`
- Comprueba las credenciales en la base de datos
- Revisa los logs del backend

### Error: "CORS policy"

- Configura CORS correctamente en el backend
- Asegúrate que `Access-Control-Allow-Origin` incluye la URL del frontend

### Spinner no aparece

- Verifica que `lucide-react` está instalado
- Comprueba el tamaño (sm, md, lg)

## 📝 Notas de Desarrollo

### Componentes Reutilizables

Todos los componentes están en `/components/ui/` y `/components/domain/`. Para crear nuevos:

1. Crear componente en la carpeta correspondiente
2. Exportar desde `index.ts` si es necesario
3. Importar donde se use

### Validación de Formularios

Los formularios incluyen validación básica. Para validación más compleja, considera usar bibliotecas como:

- `zod` - Schema validation
- `react-hook-form` - State management de formularios
- `yup` - Another validation library

### Testing

Para tests, instala:

```bash
pnpm add -D jest @testing-library/react @testing-library/jest-dom
```

## 📞 Soporte

Para reportar bugs o sugerencias, contacta al equipo de desarrollo.

## 📄 Licencia

Todos los derechos reservados © 2024 Sistema de Patrimonio.
