import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StressTestBox } from '.';

describe('StressTestBox', () => {
  it('renders stress test text', () => {
    const testText = 'If you lost 10% income, this plan still works';

    render(<StressTestBox color="conservative">{testText}</StressTestBox>);

    expect(screen.getByText(testText)).toBeInTheDocument();
  });

  it('applies correct color class', () => {
    const { container } = render(<StressTestBox color="balanced">Test scenario</StressTestBox>);

    const box = container.querySelector('[class*="stressAmber"]');
    expect(box).toBeInTheDocument();
  });

  it('renders in aggressive color', () => {
    const { container } = render(<StressTestBox color="aggressive">High risk scenario</StressTestBox>);

    const box = container.querySelector('[class*="stressRed"]');
    expect(box).toBeInTheDocument();
  });
});
