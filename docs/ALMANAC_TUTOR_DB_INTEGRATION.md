# Almanac Tutor - Integración con Base de Datos

## Resumen

El Almanac Tutor ahora está **completamente integrado con tu base de datos PostgreSQL** usando Prisma. En lugar de usar topics estáticos, el sistema obtiene dinámicamente las lecciones desde tu base de datos.

## Cambios Realizados

### 1. Nuevo Servicio de Base de Datos

**Archivo:** [`lib/almanac-db-service.ts`](../lib/almanac-db-service.ts)

Este servicio proporciona funciones para:

- `getAvailableTopics()`: Obtiene todos los temas disponibles (Lessons activas)
- `getTopicById(topicId)`: Obtiene un tema específico por ID
- `searchTopics(query)`: Busca temas por palabras clave
- `getTopicsStats()`: Obtiene estadísticas de los temas disponibles

**Cómo funciona:**
- Consulta la tabla `Lesson` de Prisma
- Filtra solo lecciones activas con unidades y curriculums activos
- Genera el contenido del tutor a partir de los `Facts` de cada lección
- Los `LearningObjectives` se usan como descripción del tema

### 2. AlmanacAgent Actualizado

**Archivo:** [`lib/almanac-agent.ts`](../lib/almanac-agent.ts)

Cambios principales:
- Eliminado el objeto estático `ALMANAC_DB`
- Implementado lazy loading de topics desde la base de datos
- Router actualizado para manejar topics dinámicos
- Tutor actualizado para obtener contenido en tiempo real
- Nuevos métodos: `getCurrentTopicData()`, `refreshTopics()`

### 3. API Routes Mejorados

**Archivo:** [`app/api/almanac/chat/route.ts`](../app/api/almanac/chat/route.ts)

- POST `/api/almanac/chat`: Ahora retorna información completa del topic actual
- DELETE `/api/almanac/chat`: Limpia la sesión del usuario

**Nuevo Archivo:** [`app/api/almanac/topics/route.ts`](../app/api/almanac/topics/route.ts)

- GET `/api/almanac/topics`: Lista todos los topics disponibles
- GET `/api/almanac/topics?q=query`: Busca topics por keywords
- Incluye estadísticas del sistema

### 4. Interfaz Actualizada

**Archivo:** [`app/(root)/almanac-tutor/page.tsx`](../app/(root)/almanac-tutor/page.tsx)

- Muestra jerarquía completa: Curriculum > Unit > Lesson
- Breadcrumb visual del topic actual
- Sugerencias actualizadas para reflejar contenido dinámico

## Estructura de Datos

### Modelo de Datos (Prisma)

```
Curriculum (activo)
  └── Unit (activo)
      └── Lesson (activo)
          ├── Facts (contenido del tutor)
          │   ├── core: true (hechos principales 🔑)
          │   └── core: false (hechos secundarios 📚)
          └── LearningObjectives (descripción/keywords)
```

### Topic ID Format

Los topics usan el formato: `lesson_{id}`

Ejemplo: `lesson_42` corresponde a la Lesson con `id = 42`

### Formato de Contenido

El contenido del tutor se genera automáticamente:

```
🔑 CORE FACT: [Texto del fact principal]

📚 Fact: [Texto del fact secundario]

📚 Fact: [Otro fact]
```

## Uso

### 1. Agregar Nuevo Contenido

Para agregar nuevo contenido educativo al Almanac Tutor:

1. **Crea un Curriculum** (si no existe):
   ```typescript
   await prisma.curriculum.create({
     data: {
       title: "Biology 101",
       difficulty: "BEGINNER",
       isActive: true,
     },
   });
   ```

2. **Crea una Unit**:
   ```typescript
   await prisma.unit.create({
     data: {
       name: "Cell Biology",
       description: "Introduction to cells",
       order: 1,
       isActive: true,
       curriculumId: "curriculum_id_here",
     },
   });
   ```

3. **Crea una Lesson con Facts**:
   ```typescript
   await prisma.lesson.create({
     data: {
       name: "Mitosis",
       description: "Cell division process",
       isActive: true,
       unitId: unit_id_here,
       facts: {
         create: [
           {
             text: "Mitosis is the process of nuclear division in eukaryotic cells.",
             core: true, // Fact principal
           },
           {
             text: "Mitosis consists of four main stages: Prophase, Metaphase, Anaphase, and Telophase.",
             core: true,
           },
           {
             text: "During Prophase, chromosomes condense.",
             core: false,
           },
         ],
       },
       learningObjectives: {
         create: [
           { text: "Understand the stages of mitosis" },
           { text: "Identify the role of chromosomes" },
         ],
       },
     },
   });
   ```

4. **El tutor automáticamente**:
   - Detectará la nueva lección
   - La incluirá en el router
   - Usará los facts como material de enseñanza

### 2. Hacer Consultas

#### Listar Topics Disponibles

```bash
curl http://localhost:3000/api/almanac/topics
```

Respuesta:
```json
{
  "topics": [
    {
      "id": "lesson_1",
      "title": "Mitosis",
      "description": "Understand the stages of mitosis, Identify the role of chromosomes",
      "content": "🔑 CORE FACT: Mitosis is...",
      "unitName": "Cell Biology",
      "curriculumTitle": "Biology 101"
    }
  ],
  "count": 1,
  "stats": {
    "totalTopics": 1,
    "totalFacts": 3,
    "totalCurriculums": 1
  }
}
```

#### Buscar Topics

```bash
curl "http://localhost:3000/api/almanac/topics?q=cell"
```

#### Chat con el Tutor

```bash
curl -X POST http://localhost:3000/api/almanac/chat \
-H "Content-Type: application/json" \
-d '{
  "userId": "student1",
  "message": "Tell me about mitosis"
}'
```

Respuesta:
```json
{
  "response": "Great question! Mitosis is the process of nuclear division...",
  "currentTopic": "lesson_1",
  "currentTopicData": {
    "title": "Mitosis",
    "unitName": "Cell Biology",
    "curriculumTitle": "Biology 101"
  }
}
```

## Ventajas de la Integración con DB

### ✅ Contenido Dinámico
- No necesitas editar código para agregar temas
- Usa el mismo sistema de gestión de contenido que ya tienes

### ✅ Consistencia
- El tutor usa exactamente el mismo contenido que tus lecciones
- Los facts y learning objectives se mantienen sincronizados

### ✅ Escalabilidad
- Puede manejar miles de lecciones
- Cache automático con lazy loading

### ✅ Filtrado Inteligente
- Solo muestra lecciones activas
- Respeta la jerarquía Curriculum > Unit > Lesson

### ✅ Rich Context
- El tutor conoce el curriculum y unit de cada lección
- Puede proporcionar contexto adicional

## Configuración de Facts para Mejores Resultados

### Buenas Prácticas

1. **Marca Facts Principales como Core**
   ```typescript
   { text: "Main concept...", core: true }
   ```

2. **Escribe Facts Claros y Concisos**
   ```typescript
   // ✅ Bueno
   { text: "Mitosis consists of four stages: Prophase, Metaphase, Anaphase, and Telophase." }

   // ❌ Evitar
   { text: "Well, basically, like, mitosis has stages..." }
   ```

3. **Usa Learning Objectives como Keywords**
   ```typescript
   learningObjectives: {
     create: [
       { text: "cell division" },
       { text: "chromosomes" },
       { text: "nuclear membrane" }
     ]
   }
   ```

4. **Organiza Facts en Orden Lógico**
   - Los facts se presentan en el orden en que fueron creados
   - Comienza con conceptos básicos
   - Progresa a detalles específicos

## Limitaciones Actuales

1. **Almacenamiento en Memoria**: Las sesiones se guardan en memoria del servidor
   - Se pierden al reiniciar
   - No escala horizontalmente
   - **Solución futura**: Implementar Redis o base de datos

2. **Sin Tracking**: No se registran las conversaciones
   - **Solución futura**: Crear tabla `TutorSession` en Prisma

3. **Lazy Loading Simple**: Cache básico por sesión
   - **Solución futura**: Implementar cache global con Redis

## Próximos Pasos Sugeridos

### 1. Tracking de Conversaciones

Agregar al schema de Prisma:

```prisma
model TutorSession {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  lessonId  Int
  lesson    Lesson   @relation(fields: [lessonId], references: [id])
  messages  Json     // Historial de mensajes
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 2. Recomendaciones Personalizadas

Usar el progreso del usuario para sugerir temas:

```typescript
// Obtener lecciones que el usuario no ha completado
const recommendedLessons = await prisma.lesson.findMany({
  where: {
    isActive: true,
    unit: {
      userUnitProgress: {
        none: {
          userId: currentUserId,
          completedAt: { not: null }
        }
      }
    }
  }
});
```

### 3. Integración con Sistema de Gamificación

Otorgar XP o Hearts por usar el tutor:

```typescript
// Después de una conversación exitosa
await prisma.user.update({
  where: { id: userId },
  data: {
    totalExperiencePoints: { increment: 5 }
  }
});
```

## Testing

### Verificar Contenido en DB

```bash
# Contar lecciones activas
psql $DATABASE_URL -c "SELECT COUNT(*) FROM lesson WHERE is_active = true;"

# Ver facts de una lección
psql $DATABASE_URL -c "SELECT * FROM fact WHERE lesson_id = 1;"
```

### Test Manual

1. Inicia el servidor: `npm run dev`
2. Abre: `http://localhost:3000/almanac-tutor`
3. Prueba:
   - "What topics can you help me with?"
   - Selecciona un tema de la lista
   - Haz preguntas de seguimiento

## Troubleshooting

### "No topics available"

**Causa**: No hay lecciones activas en la DB

**Solución**:
```bash
# Verificar lecciones
npm run prisma studio
# Navega a Lesson y asegúrate de que isActive = true
# Verifica que Unit y Curriculum también estén activos
```

### "Topic not found in database"

**Causa**: El topic_id no corresponde a una lección válida

**Solución**:
```typescript
// Refrescar topics en la sesión
const agent = agents.get(userId);
await agent.refreshTopics();
```

### Respuestas vacías o genéricas

**Causa**: La lección no tiene Facts suficientes

**Solución**:
- Agrega al menos 3-5 facts por lección
- Marca los conceptos principales como `core: true`
- Asegúrate de que los facts sean descriptivos

## Soporte

Para problemas o preguntas sobre la integración con la base de datos, consulta:
- [Prisma Schema](../prisma/schema.prisma)
- [Servicio de DB](../lib/almanac-db-service.ts)
- [Documentación de Prisma](https://www.prisma.io/docs)
