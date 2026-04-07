import { Request, Response, NextFunction } from 'express';
import passport from '../passport';
import { User, UserRole } from '../entity/User';

export type AuthUser = User & { jti: string };

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  passport.authenticate('jwt', { session: false }, (err: unknown, user: AuthUser | false) => {
    if (err) return next(err);
    if (!user) { res.status(401).json({ error: 'Unauthorized' }); return; }
    req.user = user;
    next();
  })(req, res, next);
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  passport.authenticate('jwt', { session: false }, (err: unknown, user: AuthUser | false) => {
    if (err) return next(err);
    if (!user) { res.status(401).json({ error: 'Unauthorized' }); return; }
    if ((user as AuthUser).role !== UserRole.ADMIN) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    req.user = user;
    next();
  })(req, res, next);
};

export const requireCustomer = (req: Request, res: Response, next: NextFunction): void => {
  passport.authenticate('jwt', { session: false }, (err: unknown, user: AuthUser | false) => {
    if (err) return next(err);
    if (!user) { res.status(401).json({ error: 'Unauthorized' }); return; }
    if ((user as AuthUser).role !== UserRole.CUSTOMER) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    req.user = user;
    next();
  })(req, res, next);
};
