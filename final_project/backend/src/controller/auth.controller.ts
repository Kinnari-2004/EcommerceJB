import { Request, Response } from 'express';
import { COOKIE_NAME } from '../passport';
import type { AuthUser } from '../middleware/auth';
import {
  isValidEmail, isStrongPassword,
  registerUser, loginUser, logoutUser,
  generatePasswordResetCode, resetUserPassword, changeUserPassword,
} from '../service/auth.service';

export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body as Record<string, unknown>;
  if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
    res.status(400).json({ error: 'Name, email, and password are required' }); return;
  }
  const trimmedName = name.trim();
  const trimmedEmail = email.trim().toLowerCase();
  if (!trimmedName || !isValidEmail(trimmedEmail)) {
    res.status(400).json({ error: 'Invalid name or email' }); return;
  }
  if (!isStrongPassword(password)) {
    res.status(400).json({ error: 'Password must be at least 6 characters' }); return;
  }
  try {
    await registerUser(trimmedName, trimmedEmail, password);
    res.status(201).json({ message: 'Registered successfully' });
  } catch (e: any) { res.status(e.status || 500).json({ error: e.message }); }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as Record<string, unknown>;
  if (typeof email !== 'string' || typeof password !== 'string') {
    res.status(400).json({ error: 'Email and password are required' }); return;
  }
  try {
    const result = await loginUser(
      email.trim().toLowerCase(), password,
      req.headers['user-agent'] || 'Unknown',
      req.ip || 'Unknown'
    );
    res.cookie(result.cookieName, result.token, {
      httpOnly: true, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ message: 'Logged in', role: result.role, name: result.name });
  } catch (e: any) { res.status(e.status || 500).json({ error: e.message }); }
};

export const logout = (req: Request, res: Response): void => {
  const user = req.user as AuthUser;
  logoutUser(user.id, user.jti);
  res.clearCookie(COOKIE_NAME);
  res.json({ message: 'Logged out' });
};

export const getMe = (req: Request, res: Response): void => {
  const user = req.user as AuthUser;
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body as Record<string, unknown>;
  if (typeof email !== 'string') { res.status(400).json({ error: 'Email required' }); return; }
  const code = await generatePasswordResetCode(email.trim().toLowerCase());
  res.json({ message: 'If that email is registered, a code has been generated.', code });
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { email, code, newPassword } = req.body as Record<string, unknown>;
  if (typeof email !== 'string' || typeof code !== 'string' || typeof newPassword !== 'string') {
    res.status(400).json({ error: 'Email, code, and new password required' }); return;
  }
  if (!isStrongPassword(newPassword)) {
    res.status(400).json({ error: 'Password must be at least 6 characters' }); return;
  }
  try {
    await resetUserPassword(email.trim().toLowerCase(), code, newPassword);
    res.clearCookie(COOKIE_NAME);
    res.json({ message: 'Password reset successful. Please log in.' });
  } catch (e: any) { res.status(e.status || 500).json({ error: e.message }); }
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  const user = req.user as AuthUser;
  const { currentPassword, newPassword } = req.body as Record<string, unknown>;
  if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
    res.status(400).json({ error: 'Current and new password required' }); return;
  }
  if (!isStrongPassword(newPassword)) {
    res.status(400).json({ error: 'Password must be at least 6 characters' }); return;
  }
  try {
    await changeUserPassword(user.id, user.jti, currentPassword, newPassword);
    res.json({ message: 'Password changed successfully' });
  } catch (e: any) { res.status(e.status || 500).json({ error: e.message }); }
};
