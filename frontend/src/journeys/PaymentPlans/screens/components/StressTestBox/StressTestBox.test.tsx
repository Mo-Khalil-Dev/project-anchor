import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StressTestBox } from './StressTestBox';

describe('StressTestBox', () => {
  it('renders stress test text', () => {
    const testText = 'If you lost 10% income, this plan still works';

    render(
      <StressTestBox text={testText} color="conservative" />
    );

    expect(screen.getByText(testText)).toBeInTheDocument();
  });

  it('applies correct color class', () => {
    const { container } = render(
      <StressTestBox text="Test scenario" color="balanced" />
    );

    const box = container.querySelector('[class*="balanced"]');
    expect(box).toBeInTheDocument();
  });

  it('renders in aggressive color', () => {
    const { container } = render(
      <StressTestBox text="High risk scenario" color="aggressive" />
    );

    const box = container.querySelector('[class*="aggressive"]');
    expect(box).toBeInTheDocument();
  });
});
