export const getAuthHomePath = (user) => {
  if (user?.role === 'hr') {
    return '/hr/dashboard';
  }

  if (user?.isGuest) {
    return '/user/analyze-resume';
  }

  return '/user/dashboard';
};
