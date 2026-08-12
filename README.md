# TrueQ Cliente App Web

## AUTORES
1. Jesús Alejandro Gutierrez Montufar
1. Miguel Angel Nuñez Gómez
1. Joseph Abrahan Yáñez García
Universidad Tecnológica de Tula - Tepeji
Tecnologías de la Información, Área Desarrollo de Software
Asesora Prof. Odisey Porras
2026

## Desarrollo

```bash
npm install
npm run dev
```

La API se espera en `http://localhost:8080` (ver `src/services/api.ts`, constante
`API_ORIGIN`). Cámbiala ahí si tu backend corre en otra URL/puerto.

**Importante:** el backend en `api-tienda-web-odi/` incluye una migración de EF Core
escrita a mano para las tablas nuevas (Propuesta, Calificacion, columnas de
Notificaciones). No se pudo compilar ni generar con `dotnet ef` en el entorno donde
se escribió este cliente. Antes de correrlo, en tu máquina: `dotnet build` y, si algo
no cuadra, regenera la migración con `dotnet ef migrations add`.

## Rutas

| Ruta | Vista | Notas |
|---|---|---|
| `/login`, `/register` | Auth | |
| `/home` | Feed principal | Categorías + búsqueda por cercanía (geolocalización) |
| `/buscar` | Búsqueda y filtros | Categoría, tipo de transacción, presupuesto (filtro local) y distancia |
| `/productos/nuevo` | Publicar artículo | |
| `/productos/:id` | Detalle de artículo | Trae el producto real por Id + calificación del vendedor |
| `/mensajes` | Lista de chats | |
| `/mensajes/:chatId` | Conversación | Mensajes, propuestas de trueque y calificación, ver abajo |
| `/notificaciones` | Notificaciones | Funcional: listar, marcar leídas, badge de conteo |
| `/perfil` | Mi perfil | Datos reales del backend + trueques realizados + calificación promedio |
| `/admin` | Panel de administrador | Solo visible/accesible para rol `Administrador`. Gestión de usuarios (cambiar rol) y categorías (crear/editar/eliminar) |

## Flujo de ofertas

Las ofertas se generan **desde el chat**, tal como lo pidió el negocio:

1. Desde el detalle de un artículo hay dos botones: **"Enviar mensaje al
   vendedor"** (abre/reutiliza el chat sin más) y **"Proponer oferta"** (abre
   o reutiliza el chat y entra directo con el compositor de oferta abierto).
   `ChatsService.crearChat` reutiliza el chat si ya existe uno entre ese
   usuario y ese producto — ya no se duplica cada vez que entras al detalle.
2. Al proponer, el comprador elige el tipo de oferta:
   - **Trueque**: ofrece uno de sus artículos disponibles a cambio.
   - **Comprar**: solo indica un monto en efectivo, sin ofrecer artículo.
   - **Trueque + diferencia**: ofrece un artículo y además un monto extra,
     indicando si él lo pone (a favor del vendedor) o lo pide (a cambio del
     vendedor).
3. El vendedor ve la oferta dentro del mismo chat, con el detalle según su
   tipo, y puede **aceptar** o **rechazar**. Al aceptar un trueque, ambos
   artículos involucrados se marcan como no disponibles.
4. Si fue aceptada, el comprador puede **calificar con estrellas** al vendedor
   desde la misma tarjeta de la oferta. Esa calificación alimenta el promedio
   que se muestra en el perfil del vendedor y en el detalle de sus artículos.

## Panel de administrador

Accesible desde el botón "Panel de administrador" en `/perfil` (solo aparece si tu
usuario tiene rol `Administrador`) o navegando directamente a `/admin` — el router
redirige a `/home` si no tienes ese rol.

- **Usuarios**: lista todos los usuarios y permite cambiar su rol (Usuario ↔
  Administrador) con un selector. No puedes cambiar tu propio rol (el backend lo
  rechaza, para evitar quedarte sin acceso).
- **Categorías**: crear, renombrar y eliminar categorías de productos, usando los
  endpoints ya existentes de `CategoriasController`.

## Estructura relevante

- `src/services/` — llamadas a la API: `AuthService`, `ProductosService`,
  `ChatsService`, `NotificacionesService`, `PropuestasService`,
  `CalificacionesService`, `UsuariosService`.
- `src/stores/` — Pinia: `auth` (token + claims del JWT), `productos` (caché de
  respaldo para el detalle) y `notificaciones` (conteo de no leídas para el badge).
- `src/composables/useUbicacion.ts` — geolocalización del navegador con fallback a CDMX.
- `src/components/` — `BottomNav`, `TopBar`, `ProductCard`, `NotificationBell`
  compartidos entre vistas.

## Bugs corregidos (sesiones recientes)

- **"Publicar artículo" devolvía 400 Bad Request.** La instancia de axios en
  `src/services/api.ts` fijaba `Content-Type: application/json` por defecto para
  *todas* las peticiones. Al enviar un `FormData` (crear producto, enviar mensaje
  con archivos), ese header pisaba el `multipart/form-data; boundary=...` que el
  navegador necesita generar — el backend recibía un body multipart con
  Content-Type de JSON y no podía parsear `[FromForm]`, así que `Titulo`/
  `Descripcion` (no-nullable) fallaban la validación implícita y ASP.NET Core
  devolvía 400 antes de llegar al controlador. Se quitó el header por defecto:
  axios ya pone `application/json` solo para objetos planos y deja que el
  navegador arme el boundary para `FormData`.
- **Login inaccesible con un token viejo.** Ver commit/fix anterior:
  `estaAutenticado` ahora valida el `exp` del JWT en vez de solo comprobar que
  exista un token en `localStorage`.
- **Filtro de "Tipo de transacción" en Búsqueda estaba hardcodeado** (solo
  Venta/Trueque, sin "Trueque o Venta" ni "Donar"). Ahora las opciones salen de
  `GET /api/Productos/TiposTransaccion`, igual que en el formulario de publicar.
- **La conversación de un chat solo mostraba el último mensaje.** El endpoint
  `GET /api/Chats/ObtenerMensajes/{chatId}` y el método
  `ChatsService.obtenerMensajes` en el frontend ya existían, pero
  `ChatConversacionView.vue` nunca los usaba (seguía con la lógica antigua de
  "último mensaje + lo enviado en esta sesión"). Ya está conectado: la
  conversación carga el historial completo y se refresca tras enviar un
  mensaje, proponer una oferta o responderla.
- **Imágenes de productos recortadas/con zoom.** Las miniaturas y el carrusel
  usaban `object-cover` (llenan el marco recortando lo que sobra). Se cambió a
  `object-contain` sobre un fondo neutro para ver la foto completa.
- **Filtros de Búsqueda ahora son un acordeón** colapsable (para no estorbar
  la vista); se colapsan solos después de aplicar una búsqueda.

## Limitaciones que siguen pendientes

- `ChatsController.CrearChat` reutiliza el chat si ya existe uno entre ese
  usuario y ese producto (ver "Bugs corregidos" más abajo para el detalle),
  pero si el usuario visita el mismo producto desde dos pestañas a la vez
  podría crear una condición de carrera mínima — no se ha visto en la práctica.
- Las notificaciones de propuesta/calificación no incluyen el `chatId` directamente
  (el backend guarda el Id de la propuesta como referencia), así que al tocarlas se
  navega a la lista de mensajes en vez de abrir el chat exacto.
