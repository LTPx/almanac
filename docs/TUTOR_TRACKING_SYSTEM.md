# Sistema de Tracking de Conversaciones - Almanac Tutor

## Descripción

El sistema de tracking guarda automáticamente todas las conversaciones del Almanac Tutor en la base de datos PostgreSQL, permitiendo análisis, métricas y recuperación del historial.

## Modelo de Datos

### TutorSession

```prisma
model TutorSession {
  id         String   @id @default(cuid())
  user       User     @relation(fields: [userId], references: [id])
  userId     String
  lesson     Lesson   @relation(fields: [lessonId], references: [id])
  lessonId   Int
  messages   Json     // Historial completo de mensajes
  startedAt  DateTime @default(now())
  lastActive DateTime @default(now())
  endedAt    DateTime?

  // Métricas
  messageCount    Int      @default(0)
  userMessages    Int      @default(0)
  tutorMessages   Int      @default(0)
  wasHelpful      Boolean? // Feedback del usuario
}
```

### Estructura de Mensajes

Cada mensaje en el campo `messages` tiene este formato:

```typescript
{
  role: "user" | "model",
  content: string,
  timestamp: Date
}
```

## Características

### ✅ Tracking Automático

- Cada conversación se guarda automáticamente en la BD
- No afecta la performance (tracking asíncrono)
- Si falla el tracking, la conversación continúa normalmente

### ✅ Sesiones Inteligentes

- Crea una nueva sesión cuando el usuario cambia de tema
- Reutiliza sesión activa si el usuario continúa en el mismo tema
- Actualiza `lastActive` con cada mensaje

### ✅ Métricas Detalladas

- Cuenta total de mensajes
- Mensajes del usuario vs. tutor
- Duración de la sesión
- Feedback de utilidad (thumbs up/down)

## API Endpoints

### 1. Chat con Tracking

**POST** `/api/almanac/chat`

```json
{
  "userId": "string",
  "message": "string"
}
```

**Response:**
```json
{
  "response": "string",
  "currentTopic": "lesson_42",
  "currentTopicData": { ... },
  "sessionId": "clx123abc" // ID de la sesión en BD
}
```

### 2. Finalizar Sesión con Feedback

**DELETE** `/api/almanac/chat`

```json
{
  "userId": "string",
  "wasHelpful": true // opcional: true | false | omitir
}
```

### 3. Listar Sesiones del Usuario

**GET** `/api/almanac/sessions?userId={userId}`

```json
{
  "sessions": [
    {
      "id": "clx123abc",
      "lesson": {
        "id": 42,
        "name": "Mitosis",
        "unitName": "Cell Biology",
        "curriculumTitle": "Biology 101"
      },
      "messageCount": 12,
      "userMessages": 6,
      "tutorMessages": 6,
      "startedAt": "2025-01-15T10:00:00Z",
      "lastActive": "2025-01-15T10:15:00Z",
      "endedAt": "2025-01-15T10:15:00Z",
      "wasHelpful": true,
      "isActive": false
    }
  ],
  "total": 1
}
```

### 4. Estadísticas del Usuario

**GET** `/api/almanac/sessions?userId={userId}&stats=true`

```json
{
  "stats": {
    "totalSessions": 15,
    "totalMessages": 180,
    "uniqueLessons": 8,
    "helpfulSessions": 12,
    "unhelpfulSessions": 2,
    "unratedSessions": 1,
    "helpfulnessRate": 85.7 // porcentaje
  }
}
```

### 5. Lecciones Más Populares

**GET** `/api/almanac/sessions?popular=true&limit=10`

```json
{
  "popularLessons": [
    {
      "lessonId": 42,
      "sessionCount": 45,
      "lesson": {
        "name": "Mitosis",
        "unitName": "Cell Biology",
        "curriculumTitle": "Biology 101"
      }
    }
  ]
}
```

### 6. Detalles de una Sesión

**GET** `/api/almanac/sessions/{sessionId}`

```json
{
  "id": "clx123abc",
  "user": {
    "id": "user123",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "lesson": { ... },
  "messages": [
    {
      "role": "user",
      "content": "What is mitosis?",
      "timestamp": "2025-01-15T10:00:00Z"
    },
    {
      "role": "model",
      "content": "Mitosis is...",
      "timestamp": "2025-01-15T10:00:05Z"
    }
  ],
  "messageCount": 12,
  "userMessages": 6,
  "tutorMessages": 6,
  "startedAt": "2025-01-15T10:00:00Z",
  "lastActive": "2025-01-15T10:15:00Z",
  "endedAt": "2025-01-15T10:15:00Z",
  "wasHelpful": true,
  "isActive": false
}
```

## Servicio de Base de Datos

### Funciones Principales

**Archivo:** `lib/tutor-session-service.ts`

#### `createTutorSession(userId, lessonId)`
Crea una nueva sesión de tutor.

#### `addMessageToSession(sessionId, message)`
Agrega un mensaje a una sesión existente.

```typescript
await addMessageToSession(sessionId, {
  role: "user",
  content: "What is mitosis?",
  timestamp: new Date()
});
```

#### `endTutorSession(sessionId, wasHelpful?)`
Finaliza una sesión y opcionalmente guarda el feedback.

#### `getOrCreateSession(userId, lessonId)`
Obtiene la sesión activa o crea una nueva si no existe.

#### `getUserSessions(userId)`
Lista todas las sesiones de un usuario con detalles completos.

#### `getUserTutorStats(userId)`
Obtiene estadísticas de uso del tutor para un usuario.

#### `getPopularLessons(limit)`
Obtiene las lecciones más consultadas en el tutor.

## Interfaz de Usuario

### Botones de Feedback

La interfaz ahora incluye botones de feedback:

- **👍 Thumbs Up**: Marca la sesión como útil
- **👎 Thumbs Down**: Marca la sesión como no útil
- **🗑️ Clear**: Limpia la conversación sin feedback

Estos botones aparecen cuando hay una conversación activa.

## Casos de Uso

### 1. Análisis de Contenido

Identifica qué lecciones necesitan mejor contenido:

```typescript
const stats = await getUserTutorStats(userId);
// Si helpfulnessRate < 50%, revisar contenido de las lecciones
```

### 2. Recomendaciones Personalizadas

```typescript
const sessions = await getUserSessions(userId);
const lessonsStudied = sessions.map(s => s.lessonId);
// Recomendar lecciones relacionadas que no ha visto
```

### 3. Dashboard de Administrador

```typescript
const popularLessons = await getPopularLessons(20);
// Mostrar qué temas son más demandados
```

### 4. Recuperar Conversación

```typescript
const session = await prisma.tutorSession.findUnique({
  where: { id: sessionId },
  include: { messages: true }
});
// Permitir al usuario revisar conversaciones pasadas
```

## Métricas y Analytics

### Por Usuario

- Total de sesiones creadas
- Total de mensajes enviados
- Lecciones únicas consultadas
- Tasa de sesiones útiles
- Tiempo promedio por sesión

### Por Lección

- Número de veces consultada
- Mensajes promedio por sesión
- Tasa de satisfacción
- Temas más confusos (más mensajes = más preguntas)

### Globales

- Total de sesiones en la plataforma
- Lecciones más populares
- Tasa general de satisfacción
- Usuarios más activos

## Integración con Gamificación

### Otorgar XP por Usar el Tutor

```typescript
// Al finalizar sesión con feedback positivo
if (wasHelpful) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      totalExperiencePoints: { increment: 10 }
    }
  });
}
```

### Logros

- "Estudiante Curioso": 10 sesiones completadas
- "Aprendiz Dedicado": 50 sesiones completadas
- "Maestro del Diálogo": 100 sesiones completadas

## Mantenimiento

### Limpiar Sesiones Antiguas

```typescript
import { cleanOldSessions } from "@/lib/tutor-session-service";

// Eliminar sesiones con más de 90 días de inactividad
const deleted = await cleanOldSessions(90);
console.log(`Deleted ${deleted} old sessions`);
```

### Exportar Datos

```typescript
// Exportar todas las sesiones de un usuario
const sessions = await getUserSessions(userId);
const export = JSON.stringify(sessions, null, 2);
// Guardar o enviar al usuario
```

## Privacy y GDPR

### Eliminar Datos del Usuario

```typescript
// Al eliminar cuenta de usuario, las sesiones se eliminan automáticamente
// gracias a: onDelete: Cascade en el schema de Prisma
await prisma.user.delete({
  where: { id: userId }
});
// Todas las TutorSessions del usuario se eliminan automáticamente
```

### Anonimizar Datos

```typescript
// Si necesitas mantener métricas pero anonimizar
await prisma.tutorSession.updateMany({
  where: { userId },
  data: {
    userId: "ANONYMIZED",
    messages: [] // Eliminar contenido de mensajes
  }
});
```

## Consultas SQL Útiles

### Usuarios más activos

```sql
SELECT
  u.id,
  u.name,
  u.email,
  COUNT(ts.id) as session_count,
  SUM(ts.message_count) as total_messages
FROM "user" u
JOIN "tutor_session" ts ON u.id = ts.user_id
GROUP BY u.id, u.name, u.email
ORDER BY session_count DESC
LIMIT 10;
```

### Lecciones con mejor feedback

```sql
SELECT
  l.name,
  COUNT(CASE WHEN ts.was_helpful = true THEN 1 END) as helpful_count,
  COUNT(CASE WHEN ts.was_helpful = false THEN 1 END) as unhelpful_count,
  COUNT(*) as total_sessions,
  ROUND(
    COUNT(CASE WHEN ts.was_helpful = true THEN 1 END)::numeric /
    COUNT(*)::numeric * 100,
    2
  ) as satisfaction_rate
FROM "lesson" l
JOIN "tutor_session" ts ON l.id = ts.lesson_id
WHERE ts.was_helpful IS NOT NULL
GROUP BY l.id, l.name
HAVING COUNT(*) > 5  -- Al menos 5 sesiones
ORDER BY satisfaction_rate DESC;
```

### Actividad por día

```sql
SELECT
  DATE(started_at) as date,
  COUNT(*) as sessions,
  SUM(message_count) as messages
FROM "tutor_session"
WHERE started_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(started_at)
ORDER BY date DESC;
```

## Testing

### Probar Tracking

```bash
# 1. Enviar mensaje
curl -X POST http://localhost:3000/api/almanac/chat \
-H "Content-Type: application/json" \
-d '{"userId": "test123", "message": "Tell me about photosynthesis"}'

# Respuesta incluirá sessionId

# 2. Ver sesiones del usuario
curl "http://localhost:3000/api/almanac/sessions?userId=test123"

# 3. Ver estadísticas
curl "http://localhost:3000/api/almanac/sessions?userId=test123&stats=true"

# 4. Finalizar con feedback positivo
curl -X DELETE http://localhost:3000/api/almanac/chat \
-H "Content-Type: application/json" \
-d '{"userId": "test123", "wasHelpful": true}'
```

## Próximas Mejoras

- [ ] Dashboard de analytics para administradores
- [ ] Exportación de sesiones en PDF
- [ ] Búsqueda en historial de conversaciones
- [ ] Detección automática de temas confusos (análisis de sentimiento)
- [ ] Sugerencias de mejora de contenido basadas en feedback
- [ ] Notificaciones cuando usuario tiene preguntas sin responder
- [ ] Integración con sistema de reportes

## Conclusión

El sistema de tracking proporciona:

1. **Visibilidad**: Saber qué y cómo estudian los usuarios
2. **Mejora Continua**: Identificar contenido que necesita mejoras
3. **Personalización**: Recomendar contenido basado en historial
4. **Métricas**: KPIs para medir éxito del tutor
5. **Compliance**: Auditoría y datos para regulaciones

Todo mientras mantiene la performance y experiencia del usuario intactas.
