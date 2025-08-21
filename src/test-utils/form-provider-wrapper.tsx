import { ReactNode } from 'react';
import { useForm, FormProvider } from 'react-hook-form';

export const createFormProviderWrapper = () => {
  const Wrapper = ({ children }: { children: ReactNode }) => {
    const form = useForm();

    return <FormProvider {...form}>{children}</FormProvider>;
  };
  Wrapper.displayName = 'FormProviderTestWrapper';

  return Wrapper;
};
