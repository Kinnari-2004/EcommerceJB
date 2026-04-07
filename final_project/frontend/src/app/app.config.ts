import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { AuthService } from './core/services/auth.service';
import { CartService } from './core/services/cart.service';
import { authGuard, adminGuard, customerGuard, guestGuard } from './core/guards/auth.guard';
import { catchError, of } from 'rxjs';

function initApp(auth: AuthService, cart: CartService) {
  return () => auth.init().pipe(
    catchError(() => of(null))
  ).toPromise().then(() => {
    if (auth.isCustomer()) cart.load();
  });
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter([
      { path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
      { path: 'product/:id', loadComponent: () => import('./pages/product-detail/product-detail.component').then(m => m.ProductDetailComponent) },
      { path: 'products', loadComponent: () => import('./pages/products/products.component').then(m => m.ProductsComponent) },
      { path: 'login', canActivate: [guestGuard], loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
      { path: 'register', canActivate: [guestGuard], loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent) },
      { path: 'forgot-password', loadComponent: () => import('./pages/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) },
      { path: 'cart', canActivate: [customerGuard], loadComponent: () => import('./pages/cart/cart.component').then(m => m.CartComponent) },
      { path: 'checkout', canActivate: [customerGuard], loadComponent: () => import('./pages/checkout/checkout.component').then(m => m.CheckoutComponent) },
      { path: 'order-confirmation/:id', canActivate: [customerGuard], loadComponent: () => import('./pages/order-confirmation/order-confirmation.component').then(m => m.OrderConfirmationComponent) },
      { path: 'orders', canActivate: [customerGuard], loadComponent: () => import('./pages/order-history/order-history.component').then(m => m.OrderHistoryComponent) },
      { path: 'orders/:id', canActivate: [customerGuard], loadComponent: () => import('./pages/order-detail/order-detail.component').then(m => m.OrderDetailComponent) },
      { path: 'products', loadComponent: () => import('./pages/products/products.component').then(m => m.ProductsComponent) },
      { path: 'profile', canActivate: [authGuard], loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent) },
      {
        path: 'admin', canActivate: [adminGuard],
        loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES)
      },
      { path: '**', redirectTo: '' },
    ]),
    provideHttpClient(withFetch()),
    {
      provide: APP_INITIALIZER,
      useFactory: initApp,
      deps: [AuthService, CartService],
      multi: true,
    },
  ],
};
