
"use client";

import { useState, useCallback } from 'react';

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
    [validationSchema, values]
  );

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

  const handleChange = (name: keyof TFormValues, value: TFormValues[keyof TFormValues]) => {
    setValues(prevValues => ({ ...prevValues, [name]: value }));
    validateField(name, value);
  };
  
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = event.target;
    
    let processedValue: any = value;
    if (type === 'checkbox') {
      processedValue = (event.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      processedValue = parseFloat(value);
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
    setErrors({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleInputChange,
    handleSubmit,
    validateField,
    validateForm,
    setValues, // Expose setValues for more complex scenarios (e.g. setting multiple fields at once)
    setErrors, // Expose setErrors for manual error setting
    resetForm,
  };
}
