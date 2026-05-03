import gocardless, { Environments, GoCardlessClient } from 'gocardless-nodejs';

export function initGoCardlessClient(accessToken: string): GoCardlessClient {
  return gocardless(accessToken, Environments.Sandbox);
}
