# Generador de Contenido con IA

Esta funcionalidad permite generar contenido educativo automáticamente utilizando OpenAI GPT-4.

## Configuración

### 1. Obtener API Key de OpenAI

1. Ve a [OpenAI Platform](https://platform.openai.com/api-keys)
2. Inicia sesión o crea una cuenta
3. Genera una nueva API key
4. Copia la API key (comienza con `sk-`)

### 2. Configurar Variable de Entorno

Agrega la siguiente variable a tu archivo `.env`:

```env
OPENAI_API_KEY=sk-tu_api_key_aqui
```

### 3. Acceder al Generador

1. Inicia sesión como administrador
2. Ve a **Configuración > Generador IA** en el sidebar
3. O accede directamente a `/admin/ai-generator`

## Uso

### Generar Contenido

1. **Completa los parámetros:**
   - **Track**: Categoría del curso (ej: Foundations, Physics, Biology)
   - **Phase**: Fase del aprendizaje (ej: Phase 1, Phase 2)
   - **Unit Name**: Nombre de la unidad
   - **Topic**: Tema o concepto principal

2. **Selecciona el modelo de IA:**
   - GPT-4o (Recomendado) - Más rápido y económico
   - GPT-4 Turbo
   - GPT-4

3. **Genera:** Haz clic en "Generar Contenido"

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

## Costos

Ten en cuenta que cada generación consume tokens de OpenAI. El sistema muestra la cantidad de tokens usados después de cada generación.

**Costos aproximados (GPT-4o):**
- Input: ~$5 / 1M tokens
- Output: ~$15 / 1M tokens

Una generación típica usa entre 2,000-5,000 tokens totales (~$0.01-$0.05 por unidad).

## Troubleshooting

### Error: "Cuota de OpenAI excedida" o "You exceeded your current quota"

Este es el error más común. Ocurre cuando:
- Tu cuenta de OpenAI no tiene créditos
- No has agregado un método de pago
- El plan gratuito ha expirado

**Solución:**
1. Ve a [OpenAI Billing](https://platform.openai.com/account/billing)
2. Opciones:
   - **Plan de Prepago (Recomendado):** Agrega créditos ($5 mínimo)
   - **Plan Mensual:** Configura un método de pago y límite mensual
3. Verifica que tengas créditos disponibles
4. Espera 1-2 minutos y vuelve a intentar

**Costo promedio:** $0.01-$0.05 por unidad generada con GPT-4o

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
