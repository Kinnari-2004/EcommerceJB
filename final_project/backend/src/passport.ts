import passport from 'passport';
import { Strategy as JwtStrategy } from 'passport-jwt';
import { Request } from 'express';
import { AppDataSource } from './data-source';
import { User } from './entity/User';
import { sessionStore } from './store/sessionStore';

export const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
export const COOKIE_NAME = 'token';

const cookieExtractor = (req: Request): string | null =>
  req?.cookies?.[COOKIE_NAME] ?? null;

passport.use(
  new JwtStrategy(
    { jwtFromRequest: cookieExtractor, secretOrKey: JWT_SECRET },
    async (payload: { sub: number; jti: string }, done) => {
      try {
        const session = sessionStore.get(payload.jti);
        if (!session) return done(null, false);

        const user = await AppDataSource.getRepository(User).findOneBy({ id: payload.sub });
        if (!user) return done(null, false);

        // Enforce account lock immediately
        if (user.isLocked) {
          sessionStore.delete(payload.jti);
          return done(null, false);
        }

        return done(null, { ...user, jti: payload.jti });
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

export default passport;
