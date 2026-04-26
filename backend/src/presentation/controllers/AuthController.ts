import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/authenticateRequest';
import type { InitiateLoginUseCase } from '../../application/use-cases/auth/InitiateLoginUseCase';
import type { HandleAuthCallbackUseCase } from '../../application/use-cases/auth/HandleAuthCallbackUseCase';
import type { RefreshAccessTokenUseCase } from '../../application/use-cases/auth/RefreshAccessTokenUseCase';
import type { LogoutUseCase } from '../../application/use-cases/auth/LogoutUseCase';
import type { GetRedirectToJourneyUseCase } from '../../application/use-cases/auth/GetRedirectToJourneyUseCase';

export class AuthController {
  constructor(
    private initiateLoginUseCase: InitiateLoginUseCase,
    private handleAuthCallbackUseCase: HandleAuthCallbackUseCase,
    private refreshAccessTokenUseCase: RefreshAccessTokenUseCase,
    private logoutUseCase: LogoutUseCase,
    private getRedirectToJourneyUseCase: GetRedirectToJourneyUseCase
  ) {}

  async initiateLogin(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
      const redirectUri = `${backendUrl}/api/auth/callback`;

      const result = await this.initiateLoginUseCase.execute({ redirectUri });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to initiate login',
      });
    }
  }

  async handleCallback(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { code, state } = req.query;

      if (!code || !state || typeof code !== 'string' || typeof state !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Missing or invalid code/state parameters',
        });
        return;
      }

      const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
      const redirectUri = `${backendUrl}/api/auth/callback`;

      const result = await this.handleAuthCallbackUseCase.execute({
        code,
        state,
        redirectUri,
      });

      // Set httpOnly cookie with refresh token (not sent in response body)
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Return only accessToken and user (not refreshToken)
      res.json({
        success: true,
        data: {
          accessToken: result.accessToken,
          expiresIn: result.expiresIn,
          user: result.user,
        },
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to handle auth callback',
      });
    }
  }

  async refreshToken(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (!refreshToken || typeof refreshToken !== 'string') {
        res.status(401).json({
          success: false,
          error: 'Missing or invalid refresh token cookie',
        });
        return;
      }

      const result = await this.refreshAccessTokenUseCase.execute({ refreshToken });

      // Set new refresh token cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Return only accessToken (not refreshToken)
      res.json({
        success: true,
        data: {
          accessToken: result.accessToken,
          expiresIn: result.expiresIn,
        },
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to refresh token',
      });
    }
  }

  async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { refreshToken, allSessions } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated',
        });
        return;
      }

      await this.logoutUseCase.execute({
        userId,
        refreshToken: refreshToken as string | undefined,
        allSessions: allSessions as boolean | undefined,
      });

      res.json({
        success: true,
        data: { message: 'Logged out successfully' },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to logout',
      });
    }
  }

  async getCurrentUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated',
        });
        return;
      }

      res.json({
        success: true,
        data: req.user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get current user',
      });
    }
  }

  async getRedirectToJourney(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated',
        });
        return;
      }

      const result = await this.getRedirectToJourneyUseCase.execute({
        userId: req.user.id,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to determine redirect',
      });
    }
  }

  async mockLogin(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { state, redirect_uri } = req.query;

    if (!state || !redirect_uri || typeof state !== 'string' || typeof redirect_uri !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Missing or invalid state/redirect_uri parameters',
      });
      return;
    }

    // For mock auth, return an HTML form that auto-submits with a test email
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Mock Login - PROJECT BRIDGE</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: #f4f5f9;
            margin: 0;
          }
          .container {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 1px 4px rgba(0,0,0,0.1);
            max-width: 400px;
            width: 100%;
            text-align: center;
          }
          h1 { font-size: 24px; margin: 0 0 10px 0; color: #0d0f14; }
          p { color: #5a5f72; margin: 0 0 20px 0; }
          input {
            width: 100%;
            padding: 10px;
            margin: 10px 0;
            border: 1px solid rgba(0,0,0,0.08);
            border-radius: 6px;
            font-size: 14px;
            box-sizing: border-box;
          }
          button {
            width: 100%;
            padding: 12px;
            background: #3b52ff;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            margin-top: 10px;
          }
          button:hover { background: #2a3dd4; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>PROJECT BRIDGE</h1>
          <p>Mock Login (Development Only)</p>
          <form id="mockForm" method="POST" action="${redirect_uri.replace(/"/g, '&quot;')}">
            <input type="text" id="email" placeholder="test@example.com" value="test@example.com" style="display: none;">
            <input type="hidden" name="code" id="code">
            <input type="hidden" name="state" value="${state.replace(/"/g, '&quot;')}">
            <p style="text-align: left; font-size: 12px;">Email: <strong id="emailDisplay">test@example.com</strong></p>
            <button type="button" onclick="submitForm()">Continue</button>
          </form>
        </div>
        <script>
          function submitForm() {
            const email = document.getElementById('email').value || 'test@example.com';
            const code = btoa(email); // Base64 encode the email as "code"
            document.getElementById('code').value = code;
            document.getElementById('emailDisplay').textContent = email;
            document.getElementById('mockForm').submit();
          }
          // Auto-submit on page load
          window.addEventListener('load', () => {
            setTimeout(() => submitForm(), 500);
          });
        </script>
      </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  }
}
