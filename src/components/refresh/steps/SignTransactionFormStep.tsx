'use client';

import { FormItem } from '@/components/ui/form-item';
import { Input } from '@/components/ui/input';
import {
  FormFields,
  validationRules,
} from '@/components/refresh/dialogs/RefreshAllocatorValidationRules';
import { DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import React from 'react';
import { useForm } from 'react-hook-form';

interface RefreshAllocatorFormStepProps {
  toAddress?: string;
  fromAddress?: string;
  onSubmit: (props: FormFields) => void;
  onCancel: () => void;
}

export function SignTransactionFormStep({
  toAddress,
  fromAddress,
  onSubmit,
  onCancel,
}: RefreshAllocatorFormStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormFields>();

  return (
    <>
      <form className="pt-4 pb-6">
        {fromAddress ? (
          <div className="flex flex-col gap-2 pb-6" data-testid="from-address">
            <span>From:</span>
            <span className="text-muted-foreground break-all">{fromAddress}</span>
          </div>
        ) : null}

        {toAddress ? (
          <div className="flex flex-col gap-2 pb-6" data-testid="to-address">
            <span>To:</span>
            <span className="text-muted-foreground break-all">{toAddress}</span>
          </div>
        ) : null}

        <fieldset className="pb-2">
          <FormItem required name="data_cap" label="DataCap in PiB" error={errors?.dataCap}>
            <Input {...register('dataCap', validationRules.dataCap())} />
          </FormItem>
        </fieldset>
      </form>

      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit(onSubmit)}>Approve</Button>
      </DialogFooter>
    </>
  );
}
