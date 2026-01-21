export interface Block<T> {
  _id: string;
  pages: string[];
  languages: string[];
  order: number;
  blockType: string;
  visible: boolean;
  blockData: T;
  updatedAt: string;
  createdAt: string;
}


export interface HeroBlockData {
  items: Array<{
    _id: string;
    title: string;
    text: string;
    image: string;
    buttonText: string;
    buttonLink: string;
    order: number;
  }>
}

export interface NotFoundBlockData {
  text: string;
  buttonText: string;
  backgroundImage: string;
}

export interface RunningLineBlockData {
  items: Array<{
    _id: string;
    text: string;
  }>
}

export interface StickyCardBlockData {
  title: string;
  items: Array<{
    _id: string;
    title: string;
    text: string;
    icon: string;
    order: number;
  }>
}

export interface FaqItem {
  _id: string;
  title: string;
  text: string;
  order: number;
}

export interface FaqSmallBlockData {
  title: string;
  items: FaqItem[];
}

export interface FaqCategory {
  _id: string;
  title: string;
  items: FaqItem[];
}

export interface FaqComplexBlockData {
  items: FaqCategory[]
}

export interface InstaItem {
  _id: string;
  image: string;
  order: number;
}

export interface InstaBlockData {
  title?: string;
  items: InstaItem[];
}