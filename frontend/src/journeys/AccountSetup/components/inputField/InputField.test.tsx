import { fireEvent, render, screen } from '@testing-library/react';
import { InputField } from './InputField';

describe('InputField', () => {
  it('renders the label and current value', () => {
    render(<InputField label="Postcode" value="SW1A 1AA" onChange={vi.fn()} />);
    expect(screen.getByLabelText('Postcode')).toHaveValue('SW1A 1AA');
  });

  it('fires onChange with the new value', () => {
    const onChange = vi.fn();
    render(<InputField label="Postcode" value="" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Postcode'), { target: { value: 'SW1A 1AA' } });
    expect(onChange).toHaveBeenCalledWith('SW1A 1AA');
  });

  it('shows the error message when error is set, hiding any hint', () => {
    render(<InputField label="Postcode" value="" onChange={vi.fn()} hint="UK postcode" error="Postcode is required" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Postcode is required');
    expect(screen.queryByText('UK postcode')).not.toBeInTheDocument();
  });

  it('shows the hint when no error is set', () => {
    render(<InputField label="Postcode" value="" onChange={vi.fn()} hint="UK postcode" />);
    expect(screen.getByText('UK postcode')).toBeInTheDocument();
  });
});
