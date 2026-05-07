import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OverviewErrorState } from '.';

describe('OverviewErrorState', () => {
  it('renders the error message', () => {
    render(<OverviewErrorState error="Something went wrong" onGoBack={vi.fn()} />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders the Assessment Failed title', () => {
    render(<OverviewErrorState error="err" onGoBack={vi.fn()} />);
    expect(screen.getByText('Assessment Failed')).toBeInTheDocument();
  });

  it('calls onGoBack when Go Back is clicked', async () => {
    const onGoBack = vi.fn();
    render(<OverviewErrorState error="err" onGoBack={onGoBack} />);
    await userEvent.click(screen.getByRole('button', { name: 'Go Back' }));
    expect(onGoBack).toHaveBeenCalledTimes(1);
  });
});
