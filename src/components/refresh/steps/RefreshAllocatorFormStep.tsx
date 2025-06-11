import { FormItem } from '@/components/ui/form-item'
import { Input } from '@/components/ui/input'
import { FormFields, validationRules } from '@/components/refresh/dialogs/RefreshAllocatorValidationRules'
import { DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import React from 'react'
import { useForm } from 'react-hook-form'

interface RefreshAllocatorFormStepProps {
  onSubmit: (props: FormFields) => void
  onCancel: () => void
}

export function RefreshAllocatorFormStep({ onSubmit, onCancel }: RefreshAllocatorFormStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormFields>()

  return (
    <>
      <form className="pt-4 pb-6">
        <fieldset className="pb-">
          <FormItem required name="allocator_address" label="Allocator address" error={errors?.allocatorAddress}>
            <Input {...register('allocatorAddress', validationRules.allocatorAddress())} />
          </FormItem>

          <FormItem required name="data_cap" label="DataCap" error={errors?.dataCap}>
            <Input {...register('dataCap', validationRules.dataCap())} />
          </FormItem>

          <FormItem name="github_issue" label="GitHub Issue" error={errors?.githubIssue}>
            <Input {...register('githubIssue', validationRules.githubIssue())} />
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
  )
}
