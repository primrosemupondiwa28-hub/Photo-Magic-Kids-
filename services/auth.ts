import { User } from '../types';

const STORAGE_KEY_USERS = 'pmk_users';
const STORAGE_KEY_SESSION = 'pmk_session';

// Simulate a database delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getUsers = (): any[] => {
  try {
    const usersStr = localStorage.getItem(STORAGE_KEY_USERS);
    return usersStr ? JSON.parse(usersStr) : [];
  } catch (e) {
    console.error("User storage corrupted, resetting.", e);
    localStorage.removeItem(STORAGE_KEY_USERS);
    return [];
  }
};

export const getCurrentUser = (): User | null => {
  try {
    const sessionStr = localStorage.getItem(STORAGE_KEY_SESSION);
    if (!sessionStr) return null;
    return JSON.parse(sessionStr);
  } catch {
    localStorage.removeItem(STORAGE_KEY_SESSION);
    return null;
  }
};

export const login = async (email: string, password: string): Promise<User> => {
  await delay(800); // Fake network delay

  const normalizedEmail = email.toLowerCase().trim();
  const cleanPassword = password; // Don't trim password on login to allow legacy passwords with spaces if any
  
  const users = getUsers();

  // Check case-insensitively for email
  const user = users.find((u: any) => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    console.warn(`Login failed: User not found for email ${normalizedEmail}`);
    throw new Error("Invalid email or password");
  }

  if (user.password !== cleanPassword) {
    console.warn(`Login failed: Password mismatch for ${normalizedEmail}`);
    throw new Error("Invalid email or password");
  }

  const sessionUser: User = { id: user.id, name: user.name, email: user.email };
  localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(sessionUser));
  return sessionUser;
};

export const signup = async (name: string, email: string, password: string): Promise<User> => {
  await delay(1000);

  const normalizedEmail = email.toLowerCase().trim();
  const cleanPassword = password.trim(); // Trim password on signup to prevent accidental spaces

  if (!normalizedEmail || !cleanPassword) {
      throw new Error("Email and password are required");
  }

  const users = getUsers();

  // Check if user already exists (case-insensitive)
  if (users.find((u: any) => u.email.toLowerCase() === normalizedEmail)) {
    throw new Error("User with this email already exists");
  }

  const newUser = {
    id: Date.now().toString(),
    name: name.trim(),
    email: normalizedEmail,
    password: cleanPassword
  };

  users.push(newUser);
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));

  const sessionUser: User = { id: newUser.id, name: newUser.name, email: newUser.email };
  localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(sessionUser));
  
  return sessionUser;
};

export const logout = async (): Promise<void> => {
  await delay(200);
  localStorage.removeItem(STORAGE_KEY_SESSION);
};