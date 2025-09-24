import { useFormContext } from 'react-hook-form';

import { ControlledFormItem } from '@/components/ui/form-item';
import { Input } from '../ui/input';
import { Refresh } from '@/types/refresh';
import { Button } from '../ui/button';
import { GovernanceReviewFormLegend } from './GovernanceReviewFormLegend';
import { validationRules } from '../refresh/dialogs/RefreshAllocatorValidationRules';
import { Label } from '../ui/label';

export interface RefreshGovernanceReviewFormValues {
  dataCap: number;
  intent: 'approve' | 'reject';
}

interface RefreshGovernanceReviewFormProps {
  refresh: Refresh;
  onSubmit: (data: RefreshGovernanceReviewFormValues) => void;
}

export const RefreshGovernanceReviewForm = ({
  refresh,
  onSubmit,
}: RefreshGovernanceReviewFormProps) => {
  const { control, handleSubmit, setValue } = useFormContext<RefreshGovernanceReviewFormValues>();
  const dataCapValidationRules = validationRules.dataCap();

  return (
    <form role="form" className="flex flex-col px-4 gap-2" onSubmit={handleSubmit(onSubmit)}>
      <fieldset className="flex flex-col gap-4">
        <GovernanceReviewFormLegend applicationName={refresh.title} />

        <div data-testid="allocator-type" className="flex flex-row justify-between">
          <Label>Allocator Type:</Label>
          <span className="font-medium">{refresh.metapathwayType}</span>
        </div>

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
