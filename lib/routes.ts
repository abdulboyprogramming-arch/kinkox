export const routes = {
  home: '/',
  dashboard: '/dashboard',
  deposit: '/deposit',
  history: '/history',
  profile: '/profile',
  refer: '/refer',
  settings: '/settings',
};

export const navigation = [
  { name: 'Dashboard', href: routes.dashboard, icon: 'LayoutDashboard' },
  { name: 'Deposit', href: routes.deposit, icon: 'ArrowDownCircle' },
  { name: 'Transaction History', href: routes.history, icon: 'History' },
  { name: 'Profile', href: routes.profile, icon: 'User' },
  { name: 'Refer & Earn', href: routes.refer, icon: 'Users' },
];

export const apiEndpoints = {
  telegram: '/api/telegram',
  report: '/api/report',
  analytics: '/api/analytics',
};
