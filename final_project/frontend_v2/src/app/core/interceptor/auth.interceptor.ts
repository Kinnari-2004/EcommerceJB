import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. Identify "Public" routes that should NEVER have a token
  const isPublicRoute = req.url.includes('/api/auth/forgot-password') || 
                        req.url.includes('/api/auth/reset-password') ||
                        req.url.includes('/api/auth/login');

  if (isPublicRoute) {
    // Send the request exactly as is, with NO Authorization header
    return next(req); 
  }

  // 2. For all other routes, add the token and credentials
  const token = localStorage.getItem('token');
  const authReq = req.clone({
    withCredentials: true,
    setHeaders: token ? { Authorization: `Bearer ${token}` } : {}
  });

  return next(authReq);
};