import { useEffect, useState } from "react";

/**
 * Persist only safe, non-sensitive form fields.
 *
 * Never store:
 * - password
 * - confirmPassword
 * - token / JWT
 * - accessToken
 * - refreshToken
 * - selfie / File / Blob
 * - authentication data
 */
const FORBIDDEN_KEYS = new Set([
  "password",
  "confirmPassword",
  "token",
  "accessToken",
  "refreshToken",
  "jwt",
  "authorization",
  "selfie",
  "file",
]);

const sanitizeDraft = (values) => {
  if (!values || typeof values !== "object") {
    return {};
  }

  return Object.fromEntries(
    Object.entries(values).filter(([key, value]) => {
      if (FORBIDDEN_KEYS.has(key)) {
        return false;
      }

      if (value instanceof File) {
        return false;
      }

      if (value instanceof Blob) {
        return false;
      }

      return (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean" ||
        value === null
      );
    })
  );
};

const useFormDraft = (storageKey, initialValues = {}) => {
  const [values, setValues] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);

      if (!saved) {
        return initialValues;
      }

      const parsed = JSON.parse(saved);

      return {
        ...initialValues,
        ...parsed,
      };
    } catch (error) {
      console.error("Failed to load form draft:", error);
      return initialValues;
    }
  });

  useEffect(() => {
    try {
      const safeValues = sanitizeDraft(values);

      localStorage.setItem(
        storageKey,
        JSON.stringify(safeValues)
      );
    } catch (error) {
      console.error("Failed to save form draft:", error);
    }
  }, [storageKey, values]);

  const updateField = (field, value) => {
    setValues((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const clearDraft = () => {
    localStorage.removeItem(storageKey);
  };

  const resetForm = () => {
    setValues(initialValues);
    localStorage.removeItem(storageKey);
  };

  return {
    values,
    setValues,
    updateField,
    clearDraft,
    resetForm,
  };
};

export default useFormDraft;