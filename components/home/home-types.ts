export interface HomeLinkItem {
  href: string;
  title: string;
  body: string;
}

export interface HomeLogicGameLink extends HomeLinkItem {
  game: string;
}

export interface HomeFeatureItem {
  icon: string;
  title: string;
  description: string;
}

export interface HomeFaqItem {
  question: string;
  answer: string;
}
