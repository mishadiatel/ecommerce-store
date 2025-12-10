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
    title: string;
    text: string;
    image: string;
    buttonText: string;
    buttonLink: string;
    order: number;
  }>
}