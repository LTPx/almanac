# Generador de Contenido con IA

Esta funcionalidad permite generar contenido educativo automáticamente utilizando **Google Gemini** (gratis) u **OpenAI GPT-4** (de pago).

## Configuración

### Opción 1: Google Gemini (Recomendado - GRATIS)

#### 1. Obtener API Key de Gemini

1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Inicia sesión con tu cuenta de Google
3. Haz clic en "Create API Key"
4. Copia la API key generada

#### 2. Configurar Variable de Entorno

Agrega la siguiente variable a tu archivo `.env`:

```env
GEMINI_API_KEY=tu_api_key_de_gemini_aqui
```

**Ventajas de Gemini:**
- ✅ Plan gratuito generoso (1,500 requests/día)
- ✅ No requiere tarjeta de crédito
- ✅ Excelente calidad de generación
- ✅ Modelos Gemini 1.5 Flash y Pro disponibles

### Opción 2: OpenAI (De Pago)

#### 1. Obtener API Key de OpenAI

1. Ve a [OpenAI Platform](https://platform.openai.com/api-keys)
2. Inicia sesión o crea una cuenta
3. Genera una nueva API key
4. Copia la API key (comienza con `sk-`)

#### 2. Configurar Variable de Entorno

Agrega la siguiente variable a tu archivo `.env`:

```env
OPENAI_API_KEY=sk-tu_api_key_aqui
```

#### 3. Agregar Créditos

- Ve a [OpenAI Billing](https://platform.openai.com/account/billing)
- Agrega créditos (mínimo $5) o configura método de pago

### 3. Reiniciar Servidor

Después de agregar las variables de entorno:

```bash
# Detén el servidor (Ctrl+C) y vuelve a iniciar
npm run dev
```

### 4. Acceder al Generador

1. Inicia sesión como administrador
2. Ve a **Configuración > Generador IA** en el sidebar
3. O accede directamente a `/admin/ai-generator`

## Uso

### Generar Contenido

1. **Selecciona el proveedor de IA:**
   - **Google Gemini (Gratis)** - Recomendado para empezar
   - **OpenAI (De pago)** - Si ya tienes créditos

2. **Completa los parámetros:**
   - **Track**: Categoría del curso (ej: Foundations, Physics, Biology)
   - **Phase**: Fase del aprendizaje (ej: Phase 1, Phase 2)
   - **Unit Name**: Nombre de la unidad
   - **Topic**: Tema o concepto principal

3. **Selecciona el modelo:**

   **Gemini:**
   - Gemini 1.5 Flash (Gratis, Rápido)
   - Gemini 1.5 Pro (Gratis, Mejor calidad)
   - Gemini 2.0 Flash (Experimental)

   **OpenAI:**
   - GPT-4o (Recomendado)
   - GPT-4 Turbo
   - GPT-4

4. **Genera:** Haz clic en "Generar Contenido"

4. **Edita (Opcional):** El JSON generado aparecerá en el editor Monaco. Puedes editarlo directamente si necesitas hacer ajustes.

5. **Valida:** El sistema valida automáticamente el JSON y muestra errores si los hay.

6. **Sube:** Una vez validado, haz clic en "Subir a la Base de Datos"

### Cargar desde Curriculum

Puedes usar el desplegable "Cargar desde Curriculum" para cargar automáticamente los parámetros desde el archivo `lib/curriculum.json`.

### Descargar JSON

Puedes descargar el JSON generado haciendo clic en "Descargar JSON" para guardarlo como backup o compartirlo.

## Estructura del JSON Generado

El generador crea JSON con la siguiente estructura:

```json
[
  {
    "name": "Nombre de la Unidad",
    "description": "Descripción de la unidad",
    "order": 1,
    "experiencePoints": 25,
    "lessons": [
      {
        "name": "Nombre de la Lección",
        "description": "Descripción de la lección",
        "position": 1
      }
    ],
    "questions": [
      {
        "type": "MULTIPLE_CHOICE",
        "title": "Pregunta aquí?",
        "order": 1,
        "content": {
          "options": ["A", "B", "C", "D"],
          "correctAnswer": "B",
          "explanation": "Explicación"
        },
        "answers": [
          { "text": "A", "isCorrect": false, "order": 1 }
        ]
      }
    ]
  }
]
```

## Tipos de Preguntas Soportados

- **MULTIPLE_CHOICE**: Opción múltiple
- **FILL_IN_BLANK**: Completar espacios en blanco
- **TRUE_FALSE**: Verdadero/Falso
- **ORDER_WORDS**: Ordenar palabras (máximo 8 palabras)

## Características

- ✅ Generación automática de 3 lecciones por unidad
- ✅ Generación de 6-8 preguntas por unidad
- ✅ Validación automática del JSON
- ✅ Editor Monaco para edición manual
- ✅ Preview de estadísticas (unidades, lecciones, preguntas)
- ✅ Descarga del JSON generado
- ✅ Integración directa con la base de datos
- ✅ Reutiliza componentes del sistema de importación existente

## Personalización del Prompt

Si necesitas personalizar el prompt de generación, edita el archivo:
`app/api/admin/ai-content-generator/route.ts`

Busca la función `generatePrompt()` y modifica las instrucciones según tus necesidades.

## Manifiesto de Curriculum

El archivo `lib/curriculum.json` contiene una lista de unidades predefinidas para generar. Puedes editarlo para agregar más unidades:

```json
[
  {
    "track": "Foundations",
    "phase": "Phase 1",
    "unit": "Introduction to Causality",
    "topic": "What is Causality?",
    "fileName": "foundations-phase1-unit1.json"
  }
]
```

## Comparación de Costos

### Google Gemini (GRATIS)

**Plan Gratuito:**
- 1,500 requests por día
- 1 millón de tokens por minuto
- Sin costo
- No requiere tarjeta de crédito

**Modelos:**
- Gemini 1.5 Flash: Rápido y eficiente
- Gemini 1.5 Pro: Mejor calidad, más tokens

### OpenAI (De Pago)

**Costos aproximados (GPT-4o):**
- Input: ~$5 / 1M tokens
- Output: ~$15 / 1M tokens
- Generación típica: ~$0.01-$0.05 por unidad

**Requiere:**
- Créditos prepagados o método de pago
- Mínimo $5 USD inicial

## Troubleshooting

### Error: "Cuota de OpenAI excedida" o "You exceeded your current quota"

**Solución Rápida: Usa Gemini en su lugar**
1. En el formulario, cambia "Proveedor de IA" a "Google Gemini"
2. Asegúrate de tener `GEMINI_API_KEY` configurada
3. Vuelve a generar

**O agrega créditos a OpenAI:**
1. Ve a [OpenAI Billing](https://platform.openai.com/account/billing)
2. Agrega créditos ($5 mínimo) o configura método de pago
3. Espera 1-2 minutos y vuelve a intentar

### Error: "Gemini API key no configurada"

**Solución:**
1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crea una API key gratuita
3. Agrégala a tu archivo `.env`:
   ```env
   GEMINI_API_KEY=tu_api_key_aqui
   ```
4. Reinicia el servidor:
   ```bash
   npm run dev
   ```

### Error: "OpenAI API key invalid"
- Verifica que `OPENAI_API_KEY` esté correctamente configurada en `.env`
- Asegúrate de que la API key sea válida y no haya expirado
- La key debe comenzar con `sk-` o `sk-proj-`
- Reinicia el servidor después de agregar la variable:
  ```bash
  # Detén el servidor (Ctrl+C) y vuelve a iniciar
  npm run dev
  ```

### Error: "Rate limit alcanzado"
- Has hecho demasiadas solicitudes en poco tiempo
- Espera 1-2 minutos antes de volver a intentar
- Considera actualizar tu plan de OpenAI para límites más altos

### Error: "Invalid JSON from AI"
- Intenta regenerar el contenido
- Considera usar un modelo diferente (GPT-4 Turbo en lugar de GPT-4o)
- Revisa el prompt en `route.ts`
- Edita manualmente el JSON en el editor

### Validación falla
- Edita el JSON directamente en el editor
- Verifica que todos los campos requeridos estén presentes
- Revisa los mensajes de error específicos
- Compara con el ejemplo de estructura en esta guía

### La página no carga o muestra error 404
- Verifica que hayas reiniciado el servidor después de agregar los archivos
- Limpia la caché de Next.js:
  ```bash
  rm -rf .next
  npm run dev
  ```
