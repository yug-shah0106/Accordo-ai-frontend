import { Country, State, City } from 'country-state-city';

export interface AddressData {
  id?: number;
  label: string;
  customLabel?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
  _delete?: boolean;
}

export const ADDRESS_LABELS = [
  { value: 'Head Office', label: 'Head Office' },
  { value: 'Branch Office', label: 'Branch Office' },
  { value: 'Warehouse', label: 'Warehouse' },
  { value: 'Factory', label: 'Factory' },
  { value: 'Custom', label: 'Custom' },
];

export const getCountries = (): { value: string; label: string; isoCode: string }[] => {
  return Country.getAllCountries().map((c) => ({
    value: c.name,
    label: c.name,
    isoCode: c.isoCode,
  }));
};

export const getCountryIsoCode = (countryName: string): string => {
  const country = Country.getAllCountries().find((c) => c.name === countryName);
  return country?.isoCode || '';
};

export const getStatesForCountry = (countryName: string): { value: string; label: string; isoCode: string }[] => {
  const isoCode = getCountryIsoCode(countryName);
  if (!isoCode) return [];
  return State.getStatesOfCountry(isoCode).map((s) => ({
    value: s.name,
    label: s.name,
    isoCode: s.isoCode,
  }));
};

export const getStateIsoCode = (countryName: string, stateName: string): string => {
  const countryIso = getCountryIsoCode(countryName);
  if (!countryIso) return '';
  const state = State.getStatesOfCountry(countryIso).find((s) => s.name === stateName);
  return state?.isoCode || '';
};

export const getCitiesForState = (countryName: string, stateName: string): { value: string; label: string }[] => {
  const countryIso = getCountryIsoCode(countryName);
  const stateIso = getStateIsoCode(countryName, stateName);
  if (!countryIso || !stateIso) return [];
  return City.getCitiesOfState(countryIso, stateIso).map((c) => ({
    value: c.name,
    label: c.name,
  }));
};
