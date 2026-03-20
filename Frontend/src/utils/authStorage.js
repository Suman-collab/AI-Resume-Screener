const USER_INFO_KEY = 'userInfo';

const parseStoredUser = (value) => {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    console.error('Failed to parse stored user info:', error);
    return null;
  }
};

const getStorageForUser = (user) => (user?.isGuest ? window.sessionStorage : window.localStorage);

export const getStoredUser = () => {
  const guestUser = parseStoredUser(window.sessionStorage.getItem(USER_INFO_KEY));
  if (guestUser) {
    return guestUser;
  }

  const savedUser = parseStoredUser(window.localStorage.getItem(USER_INFO_KEY));
  if (savedUser) {
    return savedUser;
  }

  window.sessionStorage.removeItem(USER_INFO_KEY);
  window.localStorage.removeItem(USER_INFO_KEY);
  return null;
};

export const setStoredUser = (user) => {
  const storage = getStorageForUser(user);
  const otherStorage = storage === window.localStorage ? window.sessionStorage : window.localStorage;

  otherStorage.removeItem(USER_INFO_KEY);
  storage.setItem(USER_INFO_KEY, JSON.stringify(user));
};

export const clearStoredUser = () => {
  window.sessionStorage.removeItem(USER_INFO_KEY);
  window.localStorage.removeItem(USER_INFO_KEY);
};
