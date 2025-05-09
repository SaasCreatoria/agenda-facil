
"use client";

import { useState, useCallback, useEffect } from 'react';

type ValidationRule<T> = (value: T, allValues?: Record<string, any>) => string | null;
type ValidationSchema<TFormValues extends Record<string, any>> = {
  [K in keyof TFormValues]?: ValidationRule<TFormValues[K]>;
};
type FormErrors<TFormValues extends Record<string, any>> = {
  [K in keyof TFormValues]?: string | null;
};

interface UseFormValidationOptions<TFormValues extends Record<string, any>> {
  initialValues: TFormValues;
  validationSchema: ValidationSchema<TFormValues>;
  onSubmit: (values: TFormValues) => void;
}

export function useFormValidation<TFormValues extends Record<string, any>>({
  initialValues,
  validationSchema,
  onSubmit,
}: UseFormValidationOptions<TFormValues>) {
  const [values, setValues] = useState<TFormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors<TFormValues>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stable handleChange, only sets values
  const handleChange = useCallback((name: keyof TFormValues, value: TFormValues[keyof TFormValues]) => {
    setValues(prevValues => ({ ...prevValues, [name]: value }));
  }, []); // setValues from useState is stable, so this is stable

  // useEffect for validation, runs when values or validationSchema change
  useEffect(() => {
    const newErrors: FormErrors<TFormValues> = {};
    for (const key in validationSchema) {
      const fieldName = key as keyof TFormValues;
      const rule = validationSchema[fieldName];
      if (rule) {
        const error = rule(values[fieldName], values);
        newErrors[fieldName] = error;
      }
    }
    setErrors(newErrors);
  }, [values, validationSchema]);

  const validateForm = useCallback(() => {
    let isValid = true;
    const newErrors: FormErrors<TFormValues> = {};
    for (const key in validationSchema) {
      const fieldName = key as keyof TFormValues;
      const rule = validationSchema[fieldName];
      if (rule) {
        const error = rule(values[fieldName], values);
        newErrors[fieldName] = error;
        if (error !== null) {
          isValid = false;
        }
      }
    }
    setErrors(newErrors);
    return isValid;
  }, [validationSchema, values]);
  
  // Specific field validation, if needed to be called programmatically
  const validateField = useCallback(
    (name: keyof TFormValues, value: TFormValues[keyof TFormValues]) => {
      const rule = validationSchema[name];
      if (rule) {
        const error = rule(value, values);
        setErrors(prevErrors => ({ ...prevErrors, [name]: error }));
        return error === null;
      }
      return true;
    },
    [validationSchema, values] // This depends on values, so it's not stable if values change
  );


  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = event.target;
    
    let processedValue: any = value;
    if (type === 'checkbox') {
      processedValue = (event.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      const numValue = parseFloat(value);
      processedValue = (value.trim() === '' && isNaN(numValue)) ? undefined : numValue;
    }
    handleChange(name as keyof TFormValues, processedValue);
  };


  const handleSubmit = async (event?: React.FormEvent<HTMLFormElement>) => {
    if (event) event.preventDefault();
    setIsSubmitting(true);
    if (validateForm()) {
      await onSubmit(values);
    }
    setIsSubmitting(false);
  };
  
  const resetForm = useCallback(() => {
    setValues(initialValues);
    // Errors will be recalculated by the useEffect due to values change
  }, [initialValues]);

  return {
    values,
    errors,
    isSubmitting,
    handleChange, // Now stable
    handleInputChange,
    handleSubmit,
    validateField, // Kept for explicit validation needs, but be mindful of its dependencies
    validateForm, 
    setValues, 
    setErrors, 
    resetForm,
  };
}
