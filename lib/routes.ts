export const ROUTES = {
  HOME: '/',
  DEPOSIT: '/deposit',
  DASHBOARD: '/dashboard',
  WITHDRAW: '/withdraw',
  SETTINGS: '/settings',
  PROFILE: '/profile',
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY_2FA: '/verify-2fa',
  SETUP_PASSKEY: '/setup-passkey',
} as const;

export const NAV_ITEMS = [
  { label: 'Home', href: ROUTES.HOME, requiresAuth: false },
  { label: 'Deposit', href: ROUTES.DEPOSIT, requiresAuth: true },
  { label: 'Dashboard', href: ROUTES.DASHBOARD, requiresAuth: true },
  { label: 'Withdraw', href: ROUTES.WITHDRAW, requiresAuth: true },
  { label: 'Settings', href: ROUTES.SETTINGS, requiresAuth: true },
] as const;
