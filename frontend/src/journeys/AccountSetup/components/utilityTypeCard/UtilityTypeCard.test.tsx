import { fireEvent, render, screen } from '@testing-library/react';
import { UTILITY_TYPES } from '../../data/utilityTypes';
import { UtilityTypeCard } from '.';

const water = UTILITY_TYPES[0];

describe('UtilityTypeCard', () => {
  it('shows the label and description', () => {
    render(<UtilityTypeCard type={water} selected={false} onSelect={vi.fn()} />);
    expect(screen.getByText('Water')).toBeInTheDocument();
    expect(screen.getByText('Water supply & sewerage')).toBeInTheDocument();
  });

  it('reflects selection via aria-pressed', () => {
    const { rerender } = render(<UtilityTypeCard type={water} selected={false} onSelect={vi.fn()} />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
    rerender(<UtilityTypeCard type={water} selected={true} onSelect={vi.fn()} />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('fires onSelect when clicked', () => {
    const onSelect = vi.fn();
    render(<UtilityTypeCard type={water} selected={false} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});
