export type ProfileType = {
  profileID: string;
  email: string;
  phone?: string;
  name?: string;
  documenttype?: string;
  document?: string;
  zipCode?: string;
  state?: string;
  city?: string;
  district?: string;
  street?: string;
  number?: string;
  complement?: string;
  website?: string;
  logo?: string;
  map?: string;
  owners?: OwnerType[];
  createdAt?: string;
  updatedAt?: string;
}

export type OwnerType = {
  ownerID: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

export type CustomMessageResponse = {
  emailSubject: string;
  emailMessage: string;
}