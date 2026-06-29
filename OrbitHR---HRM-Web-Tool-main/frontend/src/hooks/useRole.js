import { useAuth } from './useAuth';

export function useRole() {
  const { user } = useAuth();
  return user?.role || null;
}
