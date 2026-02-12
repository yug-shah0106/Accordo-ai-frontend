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

export const COUNTRIES = [
  { value: 'India', label: 'India' },
  { value: 'USA', label: 'United States' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'Canada', label: 'Canada' },
  { value: 'Australia', label: 'Australia' },
  { value: 'Other', label: 'Other' },
];

export const INDIAN_STATES = [
  { value: 'Andhra Pradesh', label: 'Andhra Pradesh' },
  { value: 'Arunachal Pradesh', label: 'Arunachal Pradesh' },
  { value: 'Assam', label: 'Assam' },
  { value: 'Bihar', label: 'Bihar' },
  { value: 'Chhattisgarh', label: 'Chhattisgarh' },
  { value: 'Goa', label: 'Goa' },
  { value: 'Gujarat', label: 'Gujarat' },
  { value: 'Haryana', label: 'Haryana' },
  { value: 'Himachal Pradesh', label: 'Himachal Pradesh' },
  { value: 'Jharkhand', label: 'Jharkhand' },
  { value: 'Karnataka', label: 'Karnataka' },
  { value: 'Kerala', label: 'Kerala' },
  { value: 'Madhya Pradesh', label: 'Madhya Pradesh' },
  { value: 'Maharashtra', label: 'Maharashtra' },
  { value: 'Manipur', label: 'Manipur' },
  { value: 'Meghalaya', label: 'Meghalaya' },
  { value: 'Mizoram', label: 'Mizoram' },
  { value: 'Nagaland', label: 'Nagaland' },
  { value: 'Odisha', label: 'Odisha' },
  { value: 'Punjab', label: 'Punjab' },
  { value: 'Rajasthan', label: 'Rajasthan' },
  { value: 'Sikkim', label: 'Sikkim' },
  { value: 'Tamil Nadu', label: 'Tamil Nadu' },
  { value: 'Telangana', label: 'Telangana' },
  { value: 'Tripura', label: 'Tripura' },
  { value: 'Uttar Pradesh', label: 'Uttar Pradesh' },
  { value: 'Uttarakhand', label: 'Uttarakhand' },
  { value: 'West Bengal', label: 'West Bengal' },
  { value: 'Delhi', label: 'Delhi' },
  { value: 'Chandigarh', label: 'Chandigarh' },
  { value: 'Puducherry', label: 'Puducherry' },
];

export const US_STATES = [
  { value: 'Alabama', label: 'Alabama' },
  { value: 'Alaska', label: 'Alaska' },
  { value: 'Arizona', label: 'Arizona' },
  { value: 'Arkansas', label: 'Arkansas' },
  { value: 'California', label: 'California' },
  { value: 'Colorado', label: 'Colorado' },
  { value: 'Connecticut', label: 'Connecticut' },
  { value: 'Delaware', label: 'Delaware' },
  { value: 'Florida', label: 'Florida' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Hawaii', label: 'Hawaii' },
  { value: 'Idaho', label: 'Idaho' },
  { value: 'Illinois', label: 'Illinois' },
  { value: 'Indiana', label: 'Indiana' },
  { value: 'Iowa', label: 'Iowa' },
  { value: 'Kansas', label: 'Kansas' },
  { value: 'Kentucky', label: 'Kentucky' },
  { value: 'Louisiana', label: 'Louisiana' },
  { value: 'Maine', label: 'Maine' },
  { value: 'Maryland', label: 'Maryland' },
  { value: 'Massachusetts', label: 'Massachusetts' },
  { value: 'Michigan', label: 'Michigan' },
  { value: 'Minnesota', label: 'Minnesota' },
  { value: 'Mississippi', label: 'Mississippi' },
  { value: 'Missouri', label: 'Missouri' },
  { value: 'Montana', label: 'Montana' },
  { value: 'Nebraska', label: 'Nebraska' },
  { value: 'Nevada', label: 'Nevada' },
  { value: 'New Hampshire', label: 'New Hampshire' },
  { value: 'New Jersey', label: 'New Jersey' },
  { value: 'New Mexico', label: 'New Mexico' },
  { value: 'New York', label: 'New York' },
  { value: 'North Carolina', label: 'North Carolina' },
  { value: 'North Dakota', label: 'North Dakota' },
  { value: 'Ohio', label: 'Ohio' },
  { value: 'Oklahoma', label: 'Oklahoma' },
  { value: 'Oregon', label: 'Oregon' },
  { value: 'Pennsylvania', label: 'Pennsylvania' },
  { value: 'Rhode Island', label: 'Rhode Island' },
  { value: 'South Carolina', label: 'South Carolina' },
  { value: 'South Dakota', label: 'South Dakota' },
  { value: 'Tennessee', label: 'Tennessee' },
  { value: 'Texas', label: 'Texas' },
  { value: 'Utah', label: 'Utah' },
  { value: 'Vermont', label: 'Vermont' },
  { value: 'Virginia', label: 'Virginia' },
  { value: 'Washington', label: 'Washington' },
  { value: 'West Virginia', label: 'West Virginia' },
  { value: 'Wisconsin', label: 'Wisconsin' },
  { value: 'Wyoming', label: 'Wyoming' },
];

export const UK_REGIONS = [
  { value: 'England', label: 'England' },
  { value: 'Scotland', label: 'Scotland' },
  { value: 'Wales', label: 'Wales' },
  { value: 'Northern Ireland', label: 'Northern Ireland' },
];

export const CANADA_PROVINCES = [
  { value: 'Alberta', label: 'Alberta' },
  { value: 'British Columbia', label: 'British Columbia' },
  { value: 'Manitoba', label: 'Manitoba' },
  { value: 'New Brunswick', label: 'New Brunswick' },
  { value: 'Newfoundland and Labrador', label: 'Newfoundland and Labrador' },
  { value: 'Nova Scotia', label: 'Nova Scotia' },
  { value: 'Ontario', label: 'Ontario' },
  { value: 'Prince Edward Island', label: 'Prince Edward Island' },
  { value: 'Quebec', label: 'Quebec' },
  { value: 'Saskatchewan', label: 'Saskatchewan' },
];

export const AUSTRALIA_STATES = [
  { value: 'New South Wales', label: 'New South Wales' },
  { value: 'Victoria', label: 'Victoria' },
  { value: 'Queensland', label: 'Queensland' },
  { value: 'Western Australia', label: 'Western Australia' },
  { value: 'South Australia', label: 'South Australia' },
  { value: 'Tasmania', label: 'Tasmania' },
  { value: 'Australian Capital Territory', label: 'Australian Capital Territory' },
  { value: 'Northern Territory', label: 'Northern Territory' },
];

export const getStatesForCountry = (country: string): { value: string; label: string }[] => {
  switch (country) {
    case 'India':
      return INDIAN_STATES;
    case 'USA':
      return US_STATES;
    case 'UK':
      return UK_REGIONS;
    case 'Canada':
      return CANADA_PROVINCES;
    case 'Australia':
      return AUSTRALIA_STATES;
    default:
      return [];
  }
};
