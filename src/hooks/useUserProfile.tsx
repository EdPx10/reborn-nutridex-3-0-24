
import { useState, useEffect } from 'react';
import { UserProfile } from '@/types';

const DEFAULT_PROFILE: UserProfile = {
  id: 'default',
  name: 'Edgar',
  gender: 'homme',
  weight: 70,
  height: 175,
  age: 35,
  goals: {
    glucides: { current: 0, goal: 275, unit: 'g' },
    proteines: { current: 0, goal: 55, unit: 'g' },
    lipides: { current: 0, goal: 78, unit: 'g' },
    fibres: { current: 0, goal: 30, unit: 'g' },
    vitamines: {
      c: { current: 0, goal: 90, unit: 'mg' },
      d: { current: 0, goal: 20, unit: 'µg' },
      b12: { current: 0, goal: 2.4, unit: 'µg' },
      a: { current: 0, goal: 900, unit: 'µg' },
    },
    mineraux: {
      calcium: { current: 0, goal: 1000, unit: 'mg' },
      fer: { current: 0, goal: 8, unit: 'mg' },
      magnesium: { current: 0, goal: 420, unit: 'mg' },
    },
    oligoelements: {
      zinc: { current: 0, goal: 11, unit: 'mg' },
      selenium: { current: 0, goal: 55, unit: 'µg' },
      iode: { current: 0, goal: 150, unit: 'µg' },
    }
  },
  isActive: true,
};

export const useUserProfile = () => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Charger les profils depuis localStorage
    const storedProfiles = localStorage.getItem('nutridex-profiles');
    
    if (storedProfiles) {
      const parsedProfiles = JSON.parse(storedProfiles);
      setProfiles(parsedProfiles);
      
      // Trouver le profil actif
      const active = parsedProfiles.find((p: UserProfile) => p.isActive);
      setActiveProfile(active || null);
    } else {
      // Créer un profil par défaut si aucun n'existe
      setProfiles([DEFAULT_PROFILE]);
      setActiveProfile(DEFAULT_PROFILE);
      localStorage.setItem('nutridex-profiles', JSON.stringify([DEFAULT_PROFILE]));
    }
  }, []);

  const createProfile = (profile: Omit<UserProfile, 'id' | 'isActive'>) => {
    const newProfile: UserProfile = {
      ...profile,
      id: `profile-${Date.now()}`,
      isActive: true,
    };
    
    const updatedProfiles = profiles.map(p => ({
      ...p,
      isActive: false
    })).concat(newProfile);
    
    setProfiles(updatedProfiles);
    setActiveProfile(newProfile);
    localStorage.setItem('nutridex-profiles', JSON.stringify(updatedProfiles));
  };

  const updateProfile = (profile: UserProfile) => {
    const updatedProfiles = profiles.map(p => 
      p.id === profile.id ? profile : p
    );
    
    setProfiles(updatedProfiles);
    if (profile.isActive) {
      setActiveProfile(profile);
    }
    
    localStorage.setItem('nutridex-profiles', JSON.stringify(updatedProfiles));
  };

  const setActiveProfileById = (profileId: string) => {
    const updatedProfiles = profiles.map(p => ({
      ...p,
      isActive: p.id === profileId
    }));
    
    const newActiveProfile = updatedProfiles.find(p => p.id === profileId) || null;
    
    setProfiles(updatedProfiles);
    setActiveProfile(newActiveProfile);
    localStorage.setItem('nutridex-profiles', JSON.stringify(updatedProfiles));
  };

  // Nouvelle fonction pour mettre à jour les apports nutritionnels
  const updateNutrientIntake = (nutrients: {
    glucides?: number;
    proteines?: number;
    lipides?: number;
    fibres?: number;
    vitamines?: Record<string, number>;
    mineraux?: Record<string, number>;
    oligoelements?: Record<string, number>;
  }) => {
    if (!activeProfile) return;

    const updatedProfile = { ...activeProfile };
    
    // Mise à jour des macronutriments
    if (nutrients.glucides !== undefined) updatedProfile.goals.glucides.current = nutrients.glucides;
    if (nutrients.proteines !== undefined) updatedProfile.goals.proteines.current = nutrients.proteines;
    if (nutrients.lipides !== undefined) updatedProfile.goals.lipides.current = nutrients.lipides;
    if (nutrients.fibres !== undefined) updatedProfile.goals.fibres.current = nutrients.fibres;
    
    // Mise à jour des vitamines
    if (nutrients.vitamines) {
      Object.entries(nutrients.vitamines).forEach(([key, value]) => {
        if (updatedProfile.goals.vitamines[key]) {
          updatedProfile.goals.vitamines[key].current = value;
        }
      });
    }
    
    // Mise à jour des minéraux
    if (nutrients.mineraux) {
      Object.entries(nutrients.mineraux).forEach(([key, value]) => {
        if (updatedProfile.goals.mineraux[key]) {
          updatedProfile.goals.mineraux[key].current = value;
        }
      });
    }
    
    // Mise à jour des oligo-éléments
    if (nutrients.oligoelements && updatedProfile.goals.oligoelements) {
      Object.entries(nutrients.oligoelements).forEach(([key, value]) => {
        if (updatedProfile.goals.oligoelements?.[key]) {
          updatedProfile.goals.oligoelements[key].current = value;
        }
      });
    }
    
    // Met à jour le profile
    updateProfile(updatedProfile);
  };

  return {
    profiles,
    activeProfile,
    createProfile,
    updateProfile,
    setActiveProfileById,
    updateNutrientIntake,
  };
};
