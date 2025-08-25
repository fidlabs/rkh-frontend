'use client';

import { FormProvider, useForm, type FieldValues, type UseFormProps } from 'react-hook-form';
import * as React from 'react';

/**
 * HOC to wrap a component with a form provider
 * helps with form state management for stateful forms with multiple steps
 * @param WrappedComponent - The component to wrap
 * @returns A new component with the form provider
 */
export const withFormProvider = <T extends FieldValues, P extends object>(
  WrappedComponent: React.ComponentType<P>,
) => {
  const FormProviderWrapper = (props: P & { formProps?: UseFormProps<T> } & P) => {
    const methods = useForm<T>(props as UseFormProps<T>);

    return (
      <FormProvider {...methods}>
        <WrappedComponent {...props} />
      </FormProvider>
    );
  };

  FormProviderWrapper.displayName = 'FormProviderHoc';

  return FormProviderWrapper;
};
