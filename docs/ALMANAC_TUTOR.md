# Almanac Tutor - Documentación

## Descripción

El **Almanac Tutor** es un sistema de tutoría educativa impulsado por IA que utiliza Google's Generative AI (Gemini) para proporcionar enseñanza socrática sobre temas específicos del Almanac.

## Características

- **Routing Inteligente**: Detecta automáticamente el tema sobre el que el usuario está preguntando
- **Contexto Persistente**: Mantiene la conversación y el contexto a través de múltiples mensajes
- **Tutoría Socrática**: Hace preguntas guía en lugar de simplemente dar respuestas
- **Multi-tema**: Actualmente soporta Mitosis, Fotosíntesis y Termodinámica
- **Gestión de Sesiones**: Cada usuario tiene su propia sesión de chat independiente

## Estructura de Archivos

```
almanac/
├── lib/
│   └── almanac-agent.ts          # Clase principal del agente
├── app/
│   ├── api/
│   │   └── almanac/
│   │       └── chat/
│   │           └── route.ts      # API endpoint para el chat
│   └── (root)/
│       └── almanac-tutor/
│           └── page.tsx          # Interfaz de usuario
└── docs/
    └── ALMANAC_TUTOR.md          # Esta documentación
```

## Componentes

### 1. AlmanacAgent (lib/almanac-agent.ts)

La clase principal que maneja la lógica del tutor:

**Métodos principales:**
- `chat(userInput: string)`: Procesa el mensaje del usuario y retorna una respuesta
- `routeTopic(userInput: string)`: Determina el tema de la conversación
- `generateTutorResponse(userInput: string)`: Genera la respuesta del tutor

**Propiedades:**
- `chatHistory`: Historial de la conversación
- `currentTopicId`: Tema actual de la conversación
- `genAI`: Instancia de GoogleGenerativeAI

### 2. API Route (app/api/almanac/chat/route.ts)

Endpoints disponibles:

#### POST /api/almanac/chat
Envía un mensaje al tutor.

**Request:**
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
  "currentTopic": "string | null"
}
```

#### DELETE /api/almanac/chat
Limpia la sesión de un usuario.

**Request:**
```json
{
  "userId": "string"
}
```

### 3. Interfaz de Usuario (app/(root)/almanac-tutor/page.tsx)

Página de chat interactiva con:
- Visualización de mensajes
- Input para enviar mensajes
- Indicador del tema actual
- Botón para limpiar la conversación
- Sugerencias de inicio rápido

## Cómo Usar

### 1. Acceder a la Página

Navega a: `http://localhost:3000/almanac-tutor`

### 2. Iniciar una Conversación

Puedes empezar preguntando sobre cualquier tema disponible:
- "Tell me about cell division"
- "What is photosynthesis?"
- "Explain thermodynamics"

### 3. Hacer Preguntas de Seguimiento

El tutor mantendrá el contexto de la conversación:
- "What happens in the first stage?"
- "Give me an example"
- "Why does this happen?"

### 4. Cambiar de Tema

Simplemente pregunta sobre otro tema:
- "Now tell me about photosynthesis"
- "Switch to thermodynamics"

## Cómo Funciona

### Flujo de Conversación

1. **Routing**: Cuando llega un mensaje, el Router analiza el historial y determina qué tema está discutiendo el usuario
2. **Sticky Topics**: Una vez seleccionado un tema, las preguntas de seguimiento se mantienen en ese tema
3. **Tutor Response**: El modelo Gemini genera una respuesta usando solo el material del tema actual
4. **Historia**: Cada intercambio se guarda para mantener el contexto

### Router

El Router utiliza Gemini Flash con instrucciones del sistema para:
- Analizar el historial de conversación
- Detectar cambios de tema
- Identificar preguntas de seguimiento
- Retornar el topic_id apropiado

### Tutor

El Tutor utiliza Gemini Flash con:
- Instrucciones específicas del tema
- Material de fuente restringido
- Enfoque socrático (hacer preguntas guía)

## Personalización

### Agregar Nuevos Temas

Edita el objeto `ALMANAC_DB` en [lib/almanac-agent.ts](../lib/almanac-agent.ts:16-45):

```typescript
const ALMANAC_DB: AlmanacDB = {
  tu_nuevo_tema: {
    title: "Título del Tema",
    description: "Descripción breve, palabras clave",
    content: `
      Contenido detallado del tema...
      Información que el tutor puede usar...
    `,
  },
  // ... otros temas
};
```

### Configurar el Modelo

Puedes cambiar el modelo de Gemini en la clase AlmanacAgent:

```typescript
// Para el Router
const model = this.genAI.getGenerativeModel({
  model: "gemini-1.5-flash", // o "gemini-1.5-pro"
  systemInstruction: routerInstruction,
  generationConfig: { responseMimeType: "application/json" },
});

// Para el Tutor
const model = this.genAI.getGenerativeModel({
  model: "gemini-1.5-flash", // o "gemini-1.5-pro"
  systemInstruction: tutorInstruction,
});
```

### Modificar el Estilo de Tutoría

Edita el `tutorInstruction` en el método `generateTutorResponse`:

```typescript
const tutorInstruction = `
  You are a Socratic Tutor for: ${topicData.title}.

  CONSTRAINTS:
  1. Answer using ONLY the Source Material below.
  2. If asked about outside topics, politely refuse.
  3. Be brief and ask a guiding question.
  4. [TUS NUEVAS INSTRUCCIONES AQUÍ]

  SOURCE MATERIAL:
  ${topicData.content}
`;
```

## Variables de Entorno

Asegúrate de tener configurada la siguiente variable en tu archivo `.env`:

```bash
GEMINI_API_KEY=tu_api_key_aqui
```

## Pruebas con CURL

### Enviar un Mensaje

```bash
curl -X POST http://localhost:3000/api/almanac/chat \
-H "Content-Type: application/json" \
-d '{"userId": "test_user", "message": "Tell me about cell division"}'
```

### Limpiar Sesión

```bash
curl -X DELETE http://localhost:3000/api/almanac/chat \
-H "Content-Type: application/json" \
-d '{"userId": "test_user"}'
```

## Limitaciones Actuales

1. **Almacenamiento en Memoria**: Las sesiones se guardan en memoria del servidor, se pierden al reiniciar
2. **Sin Persistencia**: No hay base de datos para guardar conversaciones
3. **Temas Limitados**: Solo incluye 3 temas de ejemplo
4. **Sin Autenticación**: Usa un userId simple sin verificación

## Mejoras Futuras

- [ ] Integración con base de datos para persistencia
- [ ] Más temas del Almanac
- [ ] Sistema de autenticación real
- [ ] Historial de conversaciones guardado
- [ ] Exportar conversaciones
- [ ] Modo multilingüe
- [ ] Evaluaciones y quizzes
- [ ] Progreso del estudiante

## Diferencias con la Versión Node.js Original

| Aspecto | Node.js + Express | Next.js (Esta versión) |
|---------|------------------|------------------------|
| **Framework** | Express | Next.js App Router |
| **Endpoints** | `app.post('/chat')` | API Routes `route.ts` |
| **Tipos** | JavaScript puro | TypeScript |
| **Frontend** | No incluido | Página React integrada |
| **Estructura** | Archivo único | Modular (lib, api, pages) |
| **Configuración** | `require('dotenv')` | Variables de entorno de Next.js |

## Soporte

Para problemas o preguntas, contacta al equipo de desarrollo.
