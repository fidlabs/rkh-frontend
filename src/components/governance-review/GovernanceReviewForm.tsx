import { RegisterOptions, useFormContext } from 'react-hook-form';

import { ControlledFormItem, FormItem } from '@/components/ui/form-item';
import { Input } from '../ui/input';
import { useAllocatorTypeSelectOptions } from './hooks/useAllocatorTypeSelectOptions';
import { Select } from '../ui/select';
import { Application } from '@/types/application';
import { Button } from '../ui/button';
import { GovernanceReviewFormLegend } from './GovernanceReviewFormLegend';
import { validationRules } from '../refresh/dialogs/RefreshAllocatorValidationRules';
export interface GovernanceReviewFormValues {
  allocatorType: string;
  dataCap: number;
  isMDMAAllocatorChecked: boolean;
  intent: 'approve' | 'reject';
  reason: string;
}

interface GovernanceReviewFormProps {
  application: Application;
  onSubmit: (data: GovernanceReviewFormValues) => void;
}

export const GovernanceReviewForm = ({ application, onSubmit }: GovernanceReviewFormProps) => {
  const { control, handleSubmit, setValue } = useFormContext<GovernanceReviewFormValues>();
  const options = useAllocatorTypeSelectOptions();
  const dataCapValidationRules = validationRules.dataCap();

  return (
    <form role="form" className="flex flex-col px-4 gap-2" onSubmit={handleSubmit(onSubmit)}>
      <fieldset>
        <GovernanceReviewFormLegend applicationName={application.name} />

        <ControlledFormItem
          name="isMDMAAllocatorChecked"
          label="Update JSON only, no onchain DC Allocation"
          className="flex flex-row justify-between"
          control={control}
          defaultValue={false}
        >
          <Input type="checkbox" className="w-full rounded-lg bg-background size-5" />
        </ControlledFormItem>

        <ControlledFormItem
          name="allocatorType"
          label="Allocator Type"
          control={control}
          rules={{ required: { value: true, message: 'Allocator type is required' } }}
        >
          <Select className="w-full" options={options} placeholder="Select an allocator type" />
        </ControlledFormItem>

        <ControlledFormItem
          className="w-full"
          name="dataCap"
          label="Datacap"
          control={control}
          rules={{
            required: dataCapValidationRules.required,
            min: dataCapValidationRules.min,
            max: dataCapValidationRules.max,
          }}
          defaultValue={application.datacap.toString()}
        >
          <Input type="number" className="w-full rounded-lg bg-background pl-8" />
        </ControlledFormItem>
      </fieldset>

      <div className="flex justify-center gap-2">
        <Button type="submit" className="w-[150px]" onClick={() => setValue('intent', 'approve')}>
          APPROVE
        </Button>
        <Button type="submit" className="w-[150px]" onClick={() => setValue('intent', 'reject')}>
          REJECT
        </Button>
      </div>
    </form>
  );
};
