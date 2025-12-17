"use client";

import { useState, useCallback } from "react";

export interface JSONValidationStats {
  units: number;
  lessons: number;
  questions: number;
}

export function useJSONValidation() {
  const [jsonData, setJsonData] = useState<any>(null);
  const [jsonText, setJsonText] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validateJSON = useCallback((data: any): string[] => {
    const errors: string[] = [];

    if (!Array.isArray(data)) {
      errors.push("El JSON debe ser un array de unidades");
      return errors;
    }

    data.forEach((unit: any, unitIndex: number) => {
      if (!unit.name) errors.push(`Unidad ${unitIndex + 1}: Falta el nombre`);
      if (!unit.description)
        errors.push(`Unidad ${unitIndex + 1}: Falta la descripción`);
      if (typeof unit.order !== "number")
        errors.push(`Unidad ${unitIndex + 1}: El orden debe ser un número`);
      if (typeof unit.experiencePoints !== "number")
        errors.push(
          `Unidad ${unitIndex + 1}: experiencePoints debe ser un número`
        );

      if (!Array.isArray(unit.lessons)) {
        errors.push(
          `Unidad ${unitIndex + 1}: Debe tener un array de lecciones`
        );
      } else {
        unit.lessons.forEach((lesson: any, lessonIndex: number) => {
          if (!lesson.name)
            errors.push(
              `Unidad ${unitIndex + 1}, Lección ${lessonIndex + 1}: Falta el nombre`
            );
          if (!lesson.description)
            errors.push(
              `Unidad ${unitIndex + 1}, Lección ${lessonIndex + 1}: Falta la descripción`
            );
          if (typeof lesson.position !== "number")
            errors.push(
              `Unidad ${unitIndex + 1}, Lección ${lessonIndex + 1}: position debe ser un número`
            );
        });
      }

      if (!Array.isArray(unit.questions)) {
        errors.push(
          `Unidad ${unitIndex + 1}: Debe tener un array de preguntas`
        );
      } else {
        unit.questions.forEach((q: any, qIndex: number) => {
          const validTypes = [
            "MULTIPLE_CHOICE",
            "FILL_IN_BLANK",
            "TRUE_FALSE",
            "ORDER_WORDS",
            "MATCHING",
            "DRAG_DROP"
          ];
          if (!validTypes.includes(q.type)) {
            errors.push(
              `Unidad ${unitIndex + 1}, Pregunta ${qIndex + 1}: Tipo inválido (debe ser ${validTypes.join(", ")})`
            );
          }
          if (!q.title)
            errors.push(
              `Unidad ${unitIndex + 1}, Pregunta ${qIndex + 1}: Falta el título`
            );
          if (!q.content)
            errors.push(
              `Unidad ${unitIndex + 1}, Pregunta ${qIndex + 1}: Falta el contenido`
            );
          if (typeof q.order !== "number")
            errors.push(
              `Unidad ${unitIndex + 1}, Pregunta ${qIndex + 1}: order debe ser un número`
            );

          if (q.type === "MULTIPLE_CHOICE" || q.type === "TRUE_FALSE") {
            if (!Array.isArray(q.answers) || q.answers.length === 0) {
              errors.push(
                `Unidad ${unitIndex + 1}, Pregunta ${qIndex + 1}: Debe tener respuestas`
              );
            } else {
              q.answers.forEach((answer: any, aIndex: number) => {
                if (!answer.text)
                  errors.push(
                    `Unidad ${unitIndex + 1}, Pregunta ${qIndex + 1}, Respuesta ${aIndex + 1}: Falta el texto`
                  );
                if (typeof answer.isCorrect !== "boolean")
                  errors.push(
                    `Unidad ${unitIndex + 1}, Pregunta ${qIndex + 1}, Respuesta ${aIndex + 1}: isCorrect debe ser booleano`
                  );
              });
            }
          }
        });
      }
    });

    return errors;
  }, []);

  const getStats = useCallback((data: any): JSONValidationStats | null => {
    if (!data) return null;

    const units = data.length;
    const lessons = data.reduce(
      (acc: number, u: any) => acc + (u.lessons?.length || 0),
      0
    );
    const questions = data.reduce(
      (acc: number, u: any) => acc + (u.questions?.length || 0),
      0
    );

    return { units, lessons, questions };
  }, []);

  const handleJSONChange = useCallback(
    (value: string | undefined) => {
      if (!value) {
        setJsonData(null);
        setValidationErrors([]);
        setJsonText("");
        return;
      }

      setJsonText(value);

      try {
        const json = JSON.parse(value);
        setJsonData(json);
        const errors = validateJSON(json);
        setValidationErrors(errors);
      } catch (error: any) {
        setJsonData(null);
        setValidationErrors(["Error al parsear JSON: " + error.message]);
      }
    },
    [validateJSON]
  );

  const setJSON = useCallback(
    (data: any) => {
      const jsonString = JSON.stringify(data, null, 2);
      handleJSONChange(jsonString);
    },
    [handleJSONChange]
  );

  const resetJSON = useCallback(() => {
    setJsonData(null);
    setJsonText("");
    setValidationErrors([]);
  }, []);

  return {
    jsonData,
    jsonText,
    validationErrors,
    handleJSONChange,
    setJSON,
    resetJSON,
    getStats: () => getStats(jsonData),
    isValid: validationErrors.length === 0 && jsonData !== null
  };
}
