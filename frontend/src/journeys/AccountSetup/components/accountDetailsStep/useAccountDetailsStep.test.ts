import { validate } from './useAccountDetailsStep';

describe('useAccountDetailsStep / validate', () => {
  it('flags missing postcode and ref', () => {
    expect(validate({ postcode: '', accountRef: '' })).toEqual({
      postcode: 'Postcode is required',
      accountRef: 'Account reference is required',
    });
  });

  it('flags an invalid UK postcode format', () => {
    expect(validate({ postcode: 'NOTREAL', accountRef: '12345' })).toEqual({
      postcode: 'Please enter a valid UK postcode',
    });
  });

  it('accepts a valid UK postcode with a space', () => {
    expect(validate({ postcode: 'SW1A 1AA', accountRef: '12345' })).toEqual({});
  });

  it('accepts a valid UK postcode without a space', () => {
    expect(validate({ postcode: 'SW1A1AA', accountRef: '12345' })).toEqual({});
  });

  it('flags an account reference that is too short', () => {
    expect(validate({ postcode: 'SW1A 1AA', accountRef: '123' })).toEqual({
      accountRef: 'Please enter your full account reference',
    });
  });

  it('trims whitespace before validating', () => {
    expect(validate({ postcode: '  SW1A 1AA  ', accountRef: '  12345  ' })).toEqual({});
  });
});
