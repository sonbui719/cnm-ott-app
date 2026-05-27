export type RegisterDraft = {
  phone: string;
  fullName: string;
  email: string;
  password: string;
  gender: string;
  birthday: string;
  address: string;
  city: string;
  country: string;
};

let currentDraft: RegisterDraft = {
  phone: "",
  fullName: "",
  email: "",
  password: "",
  gender: "",
  birthday: "",
  address: "",
  city: "",
  country: "",
};

export function setRegisterDraft(payload: Partial<RegisterDraft>) {
  currentDraft = {
    ...currentDraft,
    ...payload,
  };
}

export function getRegisterDraft() {
  return currentDraft;
}

export function clearRegisterDraft() {
  currentDraft = {
    phone: "",
    fullName: "",
    email: "",
    password: "",
    gender: "",
    birthday: "",
    address: "",
    city: "",
    country: "",
  };
}