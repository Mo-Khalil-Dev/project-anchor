import AWS from 'aws-sdk';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import type { AuthTokens, AuthUser } from '../../types/auth.types';
import { AuthenticationError, InvalidTokenError, ProviderConfigError } from '../../application/errors';
import { IAuthProvider } from '@/features/auth/application/services/IAuthProvider';

interface CognitoConfig {
  userPoolId: string;
  clientId: string;
  region: string;
}

export class CognitoAuthProvider implements IAuthProvider {
  private config: CognitoConfig;
  private userPoolRegion: string;
  private cognitoIdp: AWS.CognitoIdentityServiceProvider;

  constructor(config: CognitoConfig) {
    if (!config.userPoolId || !config.clientId) {
      throw new ProviderConfigError('userPoolId and clientId are required for CognitoAuthProvider');
    }

    this.config = config;
    this.userPoolRegion = config.region;
    this.cognitoIdp = new AWS.CognitoIdentityServiceProvider({ region: config.region });
  }

  async initiateLogin(redirectUri: string): Promise<{ loginUrl: string; state: string }> {
    const state = Math.random().toString(36).substring(7);
    const loginUrl = `https://${this.config.userPoolId}.auth.${this.userPoolRegion}.amazoncognito.com/oauth2/authorize?` +
      `client_id=${this.config.clientId}&` +
      `response_type=code&` +
      `scope=openid+email+profile&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `state=${encodeURIComponent(state)}`;

    return { loginUrl, state };
  }

  async handleCallback(code: string, _state: string, redirectUri: string): Promise<AuthTokens & { user: AuthUser }> {
    try {
      const tokenUrl = `https://${this.config.userPoolId}.auth.${this.userPoolRegion}.amazoncognito.com/oauth2/token`;

      const tokenResponse = await axios.post(
        tokenUrl,
        {
          grant_type: 'authorization_code',
          client_id: this.config.clientId,
          code,
          redirect_uri: redirectUri,
        },
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
      );

      const { access_token, id_token, expires_in } = tokenResponse.data;

      const decoded = jwt.decode(id_token) as any;

      if (!decoded || !decoded.sub) {
        throw new AuthenticationError('Invalid ID token from Cognito');
      }

      const user: AuthUser = {
        id: decoded.sub,
        email: decoded.email,
        firstName: decoded.given_name,
        lastName: decoded.family_name,
        externalId: decoded.sub,
      };

      return {
        accessToken: access_token,
        refreshToken: tokenResponse.data.refresh_token || '',
        expiresIn: expires_in,
        user,
      };
    } catch (error) {
      if (error instanceof AuthenticationError) throw error;
      throw new AuthenticationError(`Failed to exchange code for tokens: ${error}`);
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const tokenUrl = `https://${this.config.userPoolId}.auth.${this.userPoolRegion}.amazoncognito.com/oauth2/token`;

      const tokenResponse = await axios.post(
        tokenUrl,
        {
          grant_type: 'refresh_token',
          client_id: this.config.clientId,
          refresh_token: refreshToken,
        },
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
      );

      return {
        accessToken: tokenResponse.data.access_token,
        refreshToken: tokenResponse.data.refresh_token || refreshToken,
        expiresIn: tokenResponse.data.expires_in,
      };
    } catch (error) {
      throw new InvalidTokenError('Failed to refresh token with Cognito');
    }
  }

  async validateAccessToken(token: string): Promise<AuthUser> {
    try {
      const response = await this.cognitoIdp.getUser({ AccessToken: token }).promise();

      const emailAttr = response.UserAttributes?.find((attr: AWS.CognitoIdentityServiceProvider.AttributeType) => attr.Name === 'email');
      const firstNameAttr = response.UserAttributes?.find((attr: AWS.CognitoIdentityServiceProvider.AttributeType) => attr.Name === 'given_name');
      const lastNameAttr = response.UserAttributes?.find((attr: AWS.CognitoIdentityServiceProvider.AttributeType) => attr.Name === 'family_name');

      return {
        id: response.Username || '',
        email: emailAttr?.Value || '',
        firstName: firstNameAttr?.Value,
        lastName: lastNameAttr?.Value,
        externalId: response.Username || '',
      };
    } catch (error) {
      throw new InvalidTokenError('Invalid access token');
    }
  }

  async revokeRefreshToken(refreshToken: string): Promise<void> {
    try {
      const tokenUrl = `https://${this.config.userPoolId}.auth.${this.userPoolRegion}.amazoncognito.com/oauth2/revoke`;

      await axios.post(
        tokenUrl,
        {
          client_id: this.config.clientId,
          token: refreshToken,
        },
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
      );
    } catch (error) {
      throw new Error(`Failed to revoke refresh token: ${error}`);
    }
  }
}
