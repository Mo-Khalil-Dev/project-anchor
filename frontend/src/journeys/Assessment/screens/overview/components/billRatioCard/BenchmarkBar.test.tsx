import { render, screen } from '@testing-library/react';
import { BenchmarkBar } from './BenchmarkBar';

describe('BenchmarkBar', () => {
  it('renders the rounded ratio label', () => {
    render(<BenchmarkBar rounded={42} />);
    expect(screen.getByText('Your ratio: 42%')).toBeInTheDocument();
  });

  it('renders the benchmark label', () => {
    render(<BenchmarkBar rounded={42} />);
    expect(screen.getByText('Benchmark: 5–8%')).toBeInTheDocument();
  });

  it('renders the You marker', () => {
    render(<BenchmarkBar rounded={42} />);
    expect(screen.getByText('You')).toBeInTheDocument();
  });
});
