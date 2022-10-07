export type UUID = string;

interface IDBDates {
  createdAt?: string;
  updatedAt?: string;
  deleteddAt?: string;
}

export interface IContacts {
  email?: string;
  phone?: string;
  website?: string;
}

interface IAddress {
  zipCode?: string;
  state?: string;
  city?: string;
  district?: string;
  street?: string;
  number?: string;
  complement?: string;
}

export interface ProfileType extends IDBDates, IAddress, IContacts {
  profileID: UUID;
  name?: string;
  documenttype?: string;
  document?: string;
  logo?: string;
  map?: string;
  owners?: OwnerType[];
}

export interface OwnerType extends IDBDates, IContacts {
  ownerID: UUID;
  name: string;
}

export type CustomMessageResponse = {
  emailSubject: string;
  emailMessage: string;
}

export interface ReferralType extends IDBDates, IAddress, IContacts {
  referralID: UUID;
  code: string;
  company: string;
  contact: string;
}

export interface EventType extends IDBDates, IAddress, IContacts {
  eventID: UUID;
  profileID?: UUID;
  name: string;
  dates: string[];
  referralCode?: string;
  referral?: ReferralType;
  method: string;
  gift: number;
  giftDescription?: string;
  prizeDraw: number;
  prizeDrawDescription?: string;
  description?: string;
  map?: string;
  logo?: string;
}