import { useProfile as useRealProfile } from '../contexts/ProfileContext';

export const useProfile = () => useRealProfile();

export type { UserProfile } from '../contexts/ProfileContext';
