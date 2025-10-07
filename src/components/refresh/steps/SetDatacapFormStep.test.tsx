import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { WrapperBuilder } from '@/test-utils/wrapper-builder';
import { createWrapper } from '@/test-utils';
import { SetDatacapFormStep, type SetDatacapFormValues } from './SetDatacapFormStep';
import { MetapathwayType, type Refresh, RefreshStatus } from '@/types/refresh';

describe('SetDatacapFormStep', () => {
  const fixtureDataCap = 123;
  const fixtureMetapathwayType = MetapathwayType.RKH;

  const TestFormProvider = ({ children }: { children: React.ReactNode }) => {
    const methods = useForm<SetDatacapFormValues>({
      defaultValues: {
        dataCap: fixtureDataCap,
        intent: 'approve',
      },
    });
    return <FormProvider {...methods}>{children}</FormProvider>;
  };

  const wrapper = WrapperBuilder.create().with(createWrapper()).with(TestFormProvider).build();

  const onSubmit = vi.fn();
  const onCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders allocator type, datacap input and action buttons', () => {
    render(
      <SetDatacapFormStep
        metapathwayType={fixtureMetapathwayType}
        dataCap={fixtureDataCap}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />,
      {
        wrapper,
      },
    );

    expect(screen.getByRole('form')).toBeInTheDocument();
    expect(screen.getByTestId('allocator-type')).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: 'Datacap' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'APPROVE' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'CANCEL' })).toBeInTheDocument();
  });

  it('pre-fills datacap with refresh value', () => {
    render(
      <SetDatacapFormStep
        metapathwayType={fixtureMetapathwayType}
        dataCap={fixtureDataCap}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />,
      {
        wrapper,
      },
    );

    const datacapInput = screen.getByRole('spinbutton', { name: 'Datacap' });
    expect(datacapInput).toHaveValue(fixtureDataCap);
  });

  it('calls onSubmit when APPROVE is clicked', async () => {
    const user = userEvent.setup();

    render(
      <SetDatacapFormStep
        metapathwayType={fixtureMetapathwayType}
        dataCap={fixtureDataCap}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />,
      {
        wrapper,
      },
    );

    const approveButton = screen.getByRole('button', { name: 'APPROVE' });
    await user.click(approveButton);

    expect(onSubmit).toHaveBeenCalled();
  });

  it('calls onCancel when CANCEL is clicked', async () => {
    const user = userEvent.setup();

    render(
      <SetDatacapFormStep
        metapathwayType={fixtureMetapathwayType}
        dataCap={fixtureDataCap}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />,
      {
        wrapper,
      },
    );

    const cancelButton = screen.getByRole('button', { name: 'CANCEL' });
    await user.click(cancelButton);

    expect(onCancel).toHaveBeenCalled();
  });
});
