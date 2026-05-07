import AWS from 'aws-sdk';

export async function fetchSecretsFromManager(
  secretName: string,
  region: string
): Promise<Record<string, string>> {
  const client = new AWS.SecretsManager({ region });

  const response = await client.getSecretValue({ SecretId: secretName }).promise();

  if (!response.SecretString) {
    throw new Error(`Secret '${secretName}' is not a string secret`);
  }

  try {
    return JSON.parse(response.SecretString) as Record<string, string>;
  } catch {
    throw new Error(`Secret '${secretName}' is not valid JSON`);
  }
}
