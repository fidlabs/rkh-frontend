import { useFormContext, useWatch } from 'react-hook-form';
import { useMemo, useEffect } from 'react';

import { ControlledFormItem } from '@/components/ui/form-item';
import { Input } from '@/components/ui/input';
import { MetapathwayType } from '@/types/refresh';
import { Button } from '@/components/ui/button';
import { validationRules } from '@/components/refresh/dialogs/RefreshAllocatorValidationRules';
import { Label } from '@/components/ui/label';
import { MetapathwayTypeBadge } from '@/components/dashboard/components/MetapathwayTypeBadge';
import { RejectableFormLegend } from './components/RejectableFormLegend';
import { Switcher } from '@/components/ui/switcher';

export interface ChangeDatacapFormValues {
  dataCap: number;
  method: 'add' | 'set';
}

interface ChangeDatacapFormStepProps {
  rejectable?: boolean;
  metapathwayType: MetapathwayType;
  verifierDataCap?: string;
  dataCap?: number;
  toAddress?: string;
  onSubmit: (data: ChangeDatacapFormValues) => void;
  onCancel: () => void;
}

export const ChangeDatacapFormStep = ({
  rejectable,
  metapathwayType,
  verifierDataCap,
  dataCap,
  toAddress,
  onSubmit,
  onCancel,
}: ChangeDatacapFormStepProps) => {
  const { control, handleSubmit } = useFormContext<ChangeDatacapFormValues>();
  const dataCapValidationRules = validationRules.dataCap();
  const datacap = useWatch({ name: 'dataCap' });
  const methodOptions = useMemo(() => {
    return [
      { label: 'Add', value: 'add' },
      { label: 'Set', value: 'set' },
    ];
  }, []);

  return (
    <form role="form" className="flex flex-col px-4 gap-4" onSubmit={handleSubmit(onSubmit)}>
      <fieldset className="flex flex-col gap-2 my-4">
        {rejectable ? <RejectableFormLegend /> : null}

        {toAddress ? (
          <div data-testid="to-address" className="flex flex-col gap-2 pb-6">
            <span>To:</span>
            <span className="text-muted-foreground break-all">{toAddress}</span>
          </div>
        ) : null}

        <div data-testid="allocator-type" className="flex flex-row justify-between mb-2">
          <Label>Allocator Type:</Label>
          <MetapathwayTypeBadge metapathwayType={metapathwayType} />
        </div>

        {verifierDataCap ? (
          <div data-testid="allocator-type" className="flex flex-row justify-between mb-2">
            <Label>Allocator Datacap:</Label>
            <span>{verifierDataCap} PiB</span>
          </div>
        ) : null}

        <ControlledFormItem
          className="w-full"
          name="method"
          defaultValue="add"
          label="Method"
          control={control}
        >
          <Switcher className="w-full" options={methodOptions} />
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
        >
          <Input
            type="number"
            defaultValue={dataCap}
            className="w-full rounded-lg bg-background pl-8"
          />
        </ControlledFormItem>
      </fieldset>

      <div className="flex justify-center gap-2">
        <Button type="submit" className="w-[150px]">
          {datacap === '0' ? 'REJECT' : 'APPROVE'}
        </Button>
        <Button className="w-[150px]" onClick={onCancel}>
          CANCEL
        </Button>
      </div>
    </form>
  );
};
