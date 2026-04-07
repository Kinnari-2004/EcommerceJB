import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { AppDataSource } from '../data-source';
import { User, UserRole } from '../entity/User';
import { PasswordResetCode } from '../entity/PasswordResetCode';
import { sessionStore } from '../store/sessionStore';
import { JWT_SECRET, COOKIE_NAME } from '../passport';

export function isValidEmail(e: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

export function isStrongPassword(p: string): boolean {
  return p.length >= 6;
}

export async function registerUser(name: string, email: string, password: string): Promise<User> {
  const repo = AppDataSource.getRepository(User);
  const existing = await repo.findOneBy({ email });
  if (existing) throw Object.assign(new Error('Email already registered'), { status: 409 });

  const user = repo.create({
    name,
    email,
    passwordHash: await bcrypt.hash(password, 12),
    role: UserRole.CUSTOMER,
  });
  return repo.save(user);
}

export async function loginUser(
  email: string,
  password: string,
  userAgent: string,
  ip: string
): Promise<{ token: string; cookieName: string; role: string; name: string }> {
  const user = await AppDataSource.getRepository(User).findOneBy({ email });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw Object.assign(new Error('Invalid credentials'), { status: 401 });
  }
  if (user.isLocked) {
    throw Object.assign(new Error('Account is locked. Contact support.'), { status: 403 });
  }

  const jti = randomUUID();
  const token = jwt.sign({ sub: user.id, jti, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

  sessionStore.create(jti, { userId: user.id, role: user.role, createdAt: new Date(), userAgent, ip });

  return { token, cookieName: COOKIE_NAME, role: user.role, name: user.name };
}

export function logoutUser(userId: number, jti: string): void {
  sessionStore.delete(jti);
}

export async function generatePasswordResetCode(email: string): Promise<string | null> {
  const user = await AppDataSource.getRepository(User).findOneBy({ email });
  if (!user) return null;

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  const repo = AppDataSource.getRepository(PasswordResetCode);
  await repo.delete({ email: user.email });
  await repo.save(repo.create({ email: user.email, code, expiresAt }));

  return code;
}

export async function resetUserPassword(email: string, code: string, newPassword: string): Promise<void> {
  const codeRepo = AppDataSource.getRepository(PasswordResetCode);
  const entry = await codeRepo.findOneBy({ email, code, used: false });

  if (!entry) throw Object.assign(new Error('Invalid or expired code'), { status: 400 });
  if (new Date() > entry.expiresAt) throw Object.assign(new Error('Code has expired'), { status: 400 });

  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOneBy({ email: entry.email });
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 });

  user.passwordHash = await bcrypt.hash(newPassword, 12);
  await userRepo.save(user);

  entry.used = true;
  await codeRepo.save(entry);

  sessionStore.deleteAllForUser(user.id);
}

export async function changeUserPassword(
  userId: number,
  currentJti: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const repo = AppDataSource.getRepository(User);
  const user = await repo.findOneBy({ id: userId });
  if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
    throw Object.assign(new Error('Current password is incorrect'), { status: 401 });
  }

  user.passwordHash = await bcrypt.hash(newPassword, 12);
  await repo.save(user);

  for (const s of sessionStore.getForUser(userId)) {
    if (s.jti !== currentJti) sessionStore.delete(s.jti);
  }
}
