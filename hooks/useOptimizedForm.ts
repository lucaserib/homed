import { useCallback } from 'react';

/**
 * Hook para otimizar formulários e evitar re-renders desnecessários
 * Cria callbacks memoizados para atualizar campos de formulário
 */
export const useOptimizedForm = <T extends Record<string, any>>(
  setForm: React.Dispatch<React.SetStateAction<T>>,
  errors?: Record<string, string>,
  setErrors?: React.Dispatch<React.SetStateAction<Record<string, string>>>
) => {
  const createFieldHandler = useCallback((field: keyof T) => {
    return (value: string) => {
      setForm(prev => ({ ...prev, [field]: value }));
      
      // Limpar erro do campo se existir
      if (errors && setErrors && errors[field as string]) {
        setErrors(prev => ({ ...prev, [field as string]: '' }));
      }
    };
  }, [setForm, errors, setErrors]);

  const createCustomFieldHandler = useCallback((
    field: keyof T,
    transform: (value: string) => any
  ) => {
    return (value: string) => {
      const transformedValue = transform(value);
      setForm(prev => ({ ...prev, [field]: transformedValue }));
      
      // Limpar erro do campo se existir
      if (errors && setErrors && errors[field as string]) {
        setErrors(prev => ({ ...prev, [field as string]: '' }));
      }
    };
  }, [setForm, errors, setErrors]);

  return { createFieldHandler, createCustomFieldHandler };
};