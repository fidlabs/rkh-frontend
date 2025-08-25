import { useWatch } from 'react-hook-form';

interface GovernanceReviewFormLegendProps {
  applicationName: string;
}

export const GovernanceReviewFormLegend = ({
  applicationName,
}: GovernanceReviewFormLegendProps) => {
  const datacap = useWatch({ name: 'datacap' });

  return (
    <legend
      data-testid="governance-review-form-legend"
      className="flex justify-center flex-col gap-2 text-sm font-medium pb-8"
    >
      <span>
        Approving {applicationName} for {datacap} PiBs.
      </span>
      <span>
        Please confirm your Ledger is still connected then confirm PiB amount and allocator type to
        approve.
      </span>
    </legend>
  );
};
