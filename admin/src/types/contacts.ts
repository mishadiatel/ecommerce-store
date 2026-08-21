export interface ProductionAddress {
  city: string;
  postcode: string;
  address: string;
}

export interface Contacts {
  _id?: string;
  language: string;
  salesTitle: string;
  phones: string[];
  emails: string[];
  productionTitle: string;
  productionAddresses: ProductionAddress[];
  socialTitle: string;
  facebookUrl: string;
  instagramUrl: string;
  formTitle: string;
}
