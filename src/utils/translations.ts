interface Translations {
  [key: string]: {
    EN: string;
    FR: string;
  };
}

export const translations: Translations = {
  // Header
  hello: {
    EN: "Hello",
    FR: "Bonjour"
  },
  auditees: {
    EN: "Auditees", 
    FR: "Audités"
  },
  evidenceTuning: {
    EN: "Evidence Tuning",
    FR: "Réglage des preuves"
  },
  inviteStaff: {
    EN: "Invite Staff",
    FR: "Inviter le personnel"
  },
  signOut: {
    EN: "Sign Out",
    FR: "Se déconnecter"
  },
  // Sidebar
  framework: {
    EN: "Framework",
    FR: "Cadre"
  },
  documentation: {
    EN: "Documentation", 
    FR: "Documentation"
  },
  audit: {
    EN: "Audit",
    FR: "Audit" 
  },
  fineTuning: {
    EN: "Fine Tuning",
    FR: "Réglage fin"
  },
  logOut: {
    EN: "Log out",
    FR: "Se déconnecter"
  },
  // Languages
  english: {
    EN: "English",
    FR: "Anglais"
  },
  french: {
    EN: "Français", 
    FR: "Français"
  }
};

export const getTranslation = (key: string, language: 'EN' | 'FR'): string => {
  return translations[key]?.[language] || translations[key]?.EN || key;
};