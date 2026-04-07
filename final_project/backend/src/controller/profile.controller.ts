import { Request, Response } from 'express';
import type { AuthUser } from '../middleware/auth';
import { getUserById, updateUser } from '../service/profile.service';

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  const user = await getUserById((req.user as AuthUser).id);
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt });
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  const { name, email } = req.body as Record<string, unknown>;
  try {
    const user = await updateUser((req.user as AuthUser).id, {
      name: typeof name === 'string' ? name : undefined,
      email: typeof email === 'string' ? email.trim().toLowerCase() : undefined,
    });
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (e: any) { res.status(e.status || 500).json({ error: e.message }); }
};
