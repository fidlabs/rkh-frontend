import { render, screen } from '@testing-library/react';
import { RejectableFormLegend } from './RejectableFormLegend';

describe('RejectableFormLegends', () => {
  it('should render rejectable form legend', () => {
    render(<RejectableFormLegend />);
    expect(screen.getByTestId('rejectable-form-legend')).toHaveTextContent(
      'Setting PiB amount as 0 will result in the refresh being rejected.',
    );
  });
});
