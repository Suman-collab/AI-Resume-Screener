export const getUserId = (user) => user?._id || user?.id || '';

export const getUserRoute = (user, suffix = '/dashboard') => {
  const normalizedSuffix = suffix.startsWith('/') ? suffix : `/${suffix}`;
  const userId = getUserId(user);

  if (!userId) {
    return `/user${normalizedSuffix}`;
  }

  return `/user=${userId}${normalizedSuffix}`;
};

export const isUserScopedPath = (pathname, suffix = '') => {
  const normalizedSuffix = suffix.startsWith('/') || !suffix ? suffix : `/${suffix}`;
  const escapedSuffix = normalizedSuffix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^/user=[^/]+${escapedSuffix}$`).test(pathname);
};
