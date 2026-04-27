import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/types';
import type { AccountSetupStep, LinkDetails } from './types';

interface UseAccountSetupPageOptions {
  /** Initial step — useful for tests and Storybook. Defaults to 'checking'. */
  initialStep?: AccountSetupStep;
  /** Override navigation target after the redirect spinner. Defaults to '/bank-connection'. */
  bankConnectionPath?: string;
}

export function useAccountSetupPage(options: UseAccountSetupPageOptions = {}) {
  const navigate = useNavigate();
  const { initialStep = 'checking', bankConnectionPath = '/bank-connection' } = options;

  const [step, setStep] = useState<AccountSetupStep>(initialStep);
  const [linkDetails, setLinkDetails] = useState<LinkDetails | null>(null);

  const user = useSelector((s: RootState) => s.auth.user);
  const userName = buildName(user?.firstName, user?.lastName, user?.email);
  const userInitials = buildInitials(user?.firstName, user?.lastName, user?.email);

  const goToLinking = useCallback(() => setStep('linking'), []);
  const goToHelp = useCallback(() => setStep('help'), []);
  const goBackToError = useCallback(() => setStep('error'), []);
  const goToRedirect = useCallback(() => setStep('redirect'), []);
  const goToError = useCallback((details: LinkDetails) => { setLinkDetails(details); setStep('error'); }, []);
  const goToSuccess = useCallback((details: LinkDetails) => { setLinkDetails(details); setStep('success'); }, []);
  const retryLinking = useCallback(() => setStep('linking'), []);
  const navigateToBankConnection = useCallback(() => navigate(bankConnectionPath, { replace: true }), [navigate, bankConnectionPath]);

  return {
    step,
    linkDetails,
    userName,
    userInitials,
    goToLinking,
    goToHelp,
    goBackToError,
    goToRedirect,
    goToError,
    goToSuccess,
    retryLinking,
    navigateToBankConnection,
  };
}

function buildName(firstName?: string, lastName?: string, email?: string): string {
  const trimmedFirst = firstName?.trim();
  const trimmedLast = lastName?.trim();
  if (trimmedFirst && trimmedLast) return `${trimmedFirst} ${trimmedLast}`;
  if (trimmedFirst) return trimmedFirst;
  if (trimmedLast) return trimmedLast;
  return email ?? '';
}

function buildInitials(firstName?: string, lastName?: string, email?: string): string {
  const a = firstName?.trim()?.[0];
  const b = lastName?.trim()?.[0];
  if (a && b) return `${a}${b}`.toUpperCase();
  if (a) return a.toUpperCase();
  if (b) return b.toUpperCase();
  return (email?.[0] ?? '?').toUpperCase();
}
