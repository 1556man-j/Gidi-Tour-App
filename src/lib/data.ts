export interface CountryDial { name: string; code: string; dialCode: string }

// Same list the website's signup form uses.
export const countryDialCodes: CountryDial[] = [
  { name: 'Nigeria', code: 'NG', dialCode: '+234' },
  { name: 'Ghana', code: 'GH', dialCode: '+233' },
  { name: 'Kenya', code: 'KE', dialCode: '+254' },
  { name: 'Tanzania', code: 'TZ', dialCode: '+255' },
  { name: 'Rwanda', code: 'RW', dialCode: '+250' },
  { name: 'Egypt', code: 'EG', dialCode: '+20' },
  { name: 'Morocco', code: 'MA', dialCode: '+212' },
  { name: 'South Africa', code: 'ZA', dialCode: '+27' },
  { name: 'United Kingdom', code: 'GB', dialCode: '+44' },
  { name: 'United States', code: 'US', dialCode: '+1' },
  { name: 'Canada', code: 'CA', dialCode: '+1' },
  { name: 'Australia', code: 'AU', dialCode: '+61' },
  { name: 'Germany', code: 'DE', dialCode: '+49' },
  { name: 'France', code: 'FR', dialCode: '+33' },
  { name: 'Spain', code: 'ES', dialCode: '+34' },
  { name: 'Italy', code: 'IT', dialCode: '+39' },
];

export const tripTypes = [
  { id: 'solo', label: 'Solo', blurb: 'Just me' },
  { id: 'couple', label: 'Couple', blurb: 'Two of us' },
  { id: 'family', label: 'Family', blurb: 'All ages' },
  { id: 'group', label: 'Group / Friends', blurb: 'The squad' },
  { id: 'private', label: 'Private / Custom', blurb: 'Tailor-made' },
] as const;

export const addOnOptions = [
  { id: 'transfers', label: 'Airport transfers', desc: 'Pickup and drop-off arranged for you.' },
  { id: 'accommodation', label: 'Accommodation', desc: 'Hotels and stays picked by our local team.' },
  { id: 'food', label: 'Food & culture experiences', desc: 'Add tastings, cooking classes and local dining.' },
  { id: 'photo', label: 'Photography', desc: 'Capture your trip with a local photographer.' },
  { id: 'special', label: 'Special occasion', desc: 'Birthdays, honeymoons, proposals, we’ll make it memorable.' },
  { id: 'custom', label: 'Something else', desc: 'Tell us what you would like us to arrange.' },
] as const;
