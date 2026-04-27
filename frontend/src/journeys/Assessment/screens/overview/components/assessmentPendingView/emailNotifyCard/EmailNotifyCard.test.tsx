import { render, screen } from '@testing-library/react';
import { EmailNotifyCard } from './EmailNotifyCard';

describe('EmailNotifyCard', () => {
  it('renders the title', () => {
    render(<EmailNotifyCard email="sarah@example.com" />);
    expect(screen.getByText("Get notified when it's ready")).toBeInTheDocument();
  });

  it('renders the email address inline', () => {
    render(<EmailNotifyCard email="sarah.mitchell@example.com" />);
    expect(screen.getByText('sarah.mitchell@example.com')).toBeInTheDocument();
  });

  it('exposes itself as a labelled aside region', () => {
    render(<EmailNotifyCard email="x@y.com" />);
    expect(screen.getByLabelText('Email notification')).toBeInTheDocument();
  });
});
