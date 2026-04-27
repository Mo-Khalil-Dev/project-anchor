import { fireEvent, render, screen } from '@testing-library/react';
import { UtilityTypeStep } from './UtilityTypeStep';

describe('UtilityTypeStep', () => {
  it('renders the title and all three utility options', () => {
    render(<UtilityTypeStep selectedType="" onSelectType={vi.fn()} onContinue={vi.fn()} />);
    expect(screen.getByText('Link your utility account')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Water/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Gas/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Electricity/ })).toBeInTheDocument();
  });

  it('disables Continue until a type is selected', () => {
    const { rerender } = render(<UtilityTypeStep selectedType="" onSelectType={vi.fn()} onContinue={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
    rerender(<UtilityTypeStep selectedType="water" onSelectType={vi.fn()} onContinue={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled();
  });

  it('fires onSelectType when a card is clicked and onContinue when Continue is pressed', () => {
    const onSelectType = vi.fn();
    const onContinue = vi.fn();
    render(<UtilityTypeStep selectedType="electricity" onSelectType={onSelectType} onContinue={onContinue} />);
    fireEvent.click(screen.getByRole('button', { name: /Gas/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(onSelectType).toHaveBeenCalledWith('gas');
    expect(onContinue).toHaveBeenCalledTimes(1);
  });
});
