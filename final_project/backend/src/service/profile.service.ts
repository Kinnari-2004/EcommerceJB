import { AppDataSource } from '../data-source';
import { User } from '../entity/User';

export async function getUserById(id: number): Promise<User | null> {
  return AppDataSource.getRepository(User).findOneBy({ id });
}

export async function updateUser(id: number, data: { name?: string; email?: string }): Promise<User> {
  const repo = AppDataSource.getRepository(User);
  const user = await repo.findOneBy({ id });
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 });

  if (data.name?.trim()) user.name = data.name.trim();
  if (data.email?.trim()) {
    const existing = await repo.findOneBy({ email: data.email.trim() });
    if (existing && existing.id !== id) {
      throw Object.assign(new Error('Email already in use'), { status: 409 });
    }
    user.email = data.email.trim();
  }

  return repo.save(user);
}
