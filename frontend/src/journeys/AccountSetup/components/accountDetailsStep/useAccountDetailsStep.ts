import { useState } from 'react';

const UK_POSTCODE_REGEX = /^[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}$/i;

export interface AccountDetailsFormErrors {
  postcode?: string | null;
  accountRef?: string | null;
}

export interface SubmittedDetails {
  postcode: string;
  accountRef: string;
}

interface UseAccountDetailsStepArgs {
  onSubmit: (details: SubmittedDetails) => void;
}

export function useAccountDetailsStep({ onSubmit }: UseAccountDetailsStepArgs) {
  const [postcode, setPostcode] = useState('');
  const [accountRef, setAccountRef] = useState('');
  const [errors, setErrors] = useState<AccountDetailsFormErrors>({});

  const handlePostcodeChange = (value: string) => {
    setPostcode(value.toUpperCase());
    if (errors.postcode) setErrors((p) => ({ ...p, postcode: null }));
  };

  const handleAccountRefChange = (value: string) => {
    setAccountRef(value);
    if (errors.accountRef) setErrors((p) => ({ ...p, accountRef: null }));
  };

  const handleSubmit = () => {
    const validationErrors = validate({ postcode, accountRef });
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSubmit({ postcode: postcode.trim(), accountRef: accountRef.trim() });
  };

  return { postcode, accountRef, errors, handlePostcodeChange, handleAccountRefChange, handleSubmit };
}

export function validate({ postcode, accountRef }: SubmittedDetails): AccountDetailsFormErrors {
  const errors: AccountDetailsFormErrors = {};
  const trimmedPostcode = postcode.trim();
  const trimmedRef = accountRef.trim();
  if (!trimmedPostcode) errors.postcode = 'Postcode is required';
  else if (!UK_POSTCODE_REGEX.test(trimmedPostcode)) errors.postcode = 'Please enter a valid UK postcode';
  if (!trimmedRef) errors.accountRef = 'Account reference is required';
  else if (trimmedRef.length < 5) errors.accountRef = 'Please enter your full account reference';
  return errors;
}
