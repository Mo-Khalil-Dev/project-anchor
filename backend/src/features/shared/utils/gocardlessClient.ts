import gocardless from 'gocardless-nodejs';

export function initGoCardlessClient(accessToken: string): typeof gocardless {
  return gocardless({
    accessToken,
    environment: 'sandbox',
  });
}
