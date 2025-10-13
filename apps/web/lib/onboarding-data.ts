export interface OnboardingSlideData {
  id: string;
  title: string;
  subtitle: string;
  description?: string;
  image: string;
  icon: string;
  ctaText?: string;
  isLast?: boolean;
}

export const onboardingSlides: OnboardingSlideData[] = [
  {
    id: 'welcome',
    title: 'Bienvenue sur Guémou2 !',
    subtitle: 'L\'application qui connecte les passionnés de jeux de société',
    description: 'Découvrez un monde de jeux passionnants et rencontrez des joueurs près de chez vous.',
    image: '/images/onboarding/welcome.png',
    icon: '🎲'
  },
  {
    id: 'events',
    title: 'Organisez des événements',
    subtitle: 'Créez et rejoignez des soirées jeux près de chez vous',
    description: 'Trouvez des partenaires de jeu, organisez des tournois et créez des souvenirs inoubliables.',
    image: '/images/onboarding/events.png',
    icon: '📅',
    ctaText: 'Suivant'
  },
  {
    id: 'community',
    title: 'Rejoignez la communauté',
    subtitle: 'Échangez avec des passionnés et trouvez des partenaires de jeu',
    description: 'Discutez avec d\'autres joueurs, partagez vos expériences et créez des liens durables.',
    image: '/images/onboarding/community.png',
    icon: '💬',
    ctaText: 'Suivant'
  },
  {
    id: 'marketplace',
    title: 'Échangez vos jeux',
    subtitle: 'Vendez, achetez et échangez vos jeux de société',
    description: 'Donnez une seconde vie à vos jeux et découvrez de nouveaux trésors cachés.',
    image: '/images/onboarding/marketplace.png',
    icon: '🛒',
    ctaText: 'Suivant'
  },
  {
    id: 'join',
    title: 'Prêt à commencer ?',
    subtitle: 'Créez votre compte gratuitement et découvrez un monde de jeux passionnants',
    description: 'Rejoignez plus de 2,500 joueurs actifs et participez à plus de 850 événements organisés !',
    image: '/images/onboarding/join.png',
    icon: '🚀',
    ctaText: 'S\'inscrire',
    isLast: true
  }
];

export const onboardingConfig = {
  autoAdvance: false,
  showProgress: true,
  allowSkip: true,
  skipText: 'Passer l\'introduction',
  completeText: 'Commencer l\'aventure'
};
