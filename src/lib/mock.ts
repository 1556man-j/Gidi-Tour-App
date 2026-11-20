import type { Article, Destination, Faq, JobPosition, Review, SiteSettings, StoreProduct, Tour, Img } from './types';

const pic = {
  cairo: { local: require('../../assets/images/cairo.jpg') } as Img,
  cape: { local: require('../../assets/images/cape-town.jpg') } as Img,
  life: { local: require('../../assets/images/local-life.jpg') } as Img,
  crew: { local: require('../../assets/images/hero.jpg') } as Img,
};

const slug = (s: string) => ({ current: s });

export const mockTours: Tour[] = [
  {
    _id: 't1', title: 'Rock Star Abuja: Zuma at First Light', slug: slug('zuma-at-first-light'),
    country: 'Nigeria', countrySlug: 'nigeria', category: 'Adventure', image: pic.crew, gallery: [pic.crew, pic.life, pic.cairo],
    duration: '6 hours', groupSize: '2-12 guests', price: 130, rating: 4.9, reviewCount: 214, popular: true,
    summary: 'Zuma Rock rises out of flat farmland like a granite wave. We get there before the heat, walk the footpaths around its base with a Gbagyi guide who knows which stories are folklore and which are family history, then eat a late breakfast of yam and egg from a roadside stall.',
    highlights: ['Zuma Rock at sunrise', 'Gbagyi farming village', 'Roadside yam & egg breakfast', 'Local storyteller guide'],
    includes: ['Private transport', 'Local guide', 'Breakfast', 'Bottled water'],
  },
  {
    _id: 't2', title: 'Lagos After Dark: Food, Music & Island Nights', slug: slug('lagos-after-dark'),
    country: 'Nigeria', countrySlug: 'nigeria', category: 'City Break', image: pic.life, gallery: [pic.life, pic.crew],
    duration: '5 hours', groupSize: '4-14 guests', price: 95, rating: 4.8, reviewCount: 389, popular: true,
    summary: 'Suya on the mainland, highlife on the island. A night built around the people who feed and soundtrack Lagos, with a driver who knows which shortcut is actually a shortcut.',
    highlights: ['Suya at a legendary spot', 'Live highlife set', 'Lekki rooftop', 'Street-food tasting'],
    includes: ['Transport', 'Food tastings', 'Entry fees', 'Local host'],
  },
  {
    _id: 't3', title: 'Pyramids Without the Crowds', slug: slug('pyramids-without-the-crowds'),
    country: 'Egypt', countrySlug: 'egypt', category: 'Cultural', image: pic.cairo, gallery: [pic.cairo, pic.life],
    duration: 'Full day', groupSize: '2-10 guests', price: 185, rating: 4.9, reviewCount: 142, popular: true,
    summary: 'Giza before the buses, Saqqara after the guidebooks. An Egyptologist-led day that treats the pyramids as a story rather than a photo stop, ending with koshari in old Cairo.',
    highlights: ['Giza at opening time', 'Step Pyramid of Saqqara', 'Memphis open-air museum', 'Koshari lunch'],
    includes: ['Egyptologist guide', 'Private car', 'Tickets', 'Lunch'],
  },
  {
    _id: 't4', title: 'Cape Peninsula: Penguins & Edge-of-the-World Roads', slug: slug('cape-peninsula-penguins'),
    country: 'South Africa', countrySlug: 'south-africa', category: 'Coastal', image: pic.cape, gallery: [pic.cape, pic.crew],
    duration: 'Full day', groupSize: '2-8 guests', price: 160, rating: 4.7, reviewCount: 176,
    summary: 'Boulders Beach penguins, Chapman’s Peak and a lunch with the ocean at your feet. Slow stops, no rushing, and a guide who has driven the peninsula for twenty years.',
    highlights: ['Boulders Beach penguins', 'Chapman’s Peak Drive', 'Cape Point', 'Fish & chips on the harbour'],
    includes: ['Guide & driver', 'Park fees', 'Lunch'],
  },
  {
    _id: 't5', title: 'Accra Beyond the Beach: Jamestown & Kenkey', slug: slug('accra-beyond-the-beach'),
    country: 'Ghana', countrySlug: 'ghana', category: 'Cultural', image: pic.life, gallery: [pic.life, pic.crew],
    duration: '4 hours', groupSize: '2-10 guests', price: 85, rating: 4.8, reviewCount: 98, popular: true,
    summary: 'Walk Jamestown’s lighthouse streets, watch the fishermen haul nets and learn why kenkey is a love language. A morning that ends with fresh fish and a lot of laughing.',
    highlights: ['Jamestown lighthouse', 'Fishing harbour', 'Kenkey & fish', 'Street art walk'],
    includes: ['Local guide', 'Food tastings', 'Water'],
  },
  {
    _id: 't6', title: 'Maasai Mara by Sunrise', slug: slug('maasai-mara-by-sunrise'),
    country: 'Kenya', countrySlug: 'kenya', category: 'Safari', image: pic.crew, gallery: [pic.crew, pic.cape],
    duration: '3 days', groupSize: '2-6 guests', price: 640, rating: 5, reviewCount: 61, popular: true,
    summary: 'Three days on the plains with a guide who reads the grass like a newspaper. Dawn drives, bush breakfasts and an evening with a Maasai family in their boma.',
    highlights: ['Dawn game drives', 'Bush breakfast', 'Maasai boma visit', 'Mara River crossing'],
    includes: ['Lodge stay', 'All meals', 'Park fees', 'Safari vehicle'],
  },
  {
    _id: 't7', title: 'Marrakech Medina: Spices, Souks & Rooftops', slug: slug('marrakech-medina'),
    country: 'Morocco', countrySlug: 'morocco', category: 'Art', image: pic.cairo, gallery: [pic.cairo, pic.life],
    duration: '5 hours', groupSize: '2-10 guests', price: 110, rating: 4.8, reviewCount: 120,
    summary: 'Get pleasantly lost with someone who was born inside the walls. Spice merchants, tile workshops and the best mint tea on a rooftop above Jemaa el-Fna.',
    highlights: ['Spice souk', 'Zellige workshop', 'Rooftop mint tea', 'Hidden riads'],
    includes: ['Local guide', 'Tastings', 'Workshop visit'],
  },
  {
    _id: 't8', title: 'Zanzibar Spice & Stone Town', slug: slug('zanzibar-spice-and-stone-town'),
    country: 'Tanzania', countrySlug: 'tanzania', category: 'Coastal', image: pic.cape, gallery: [pic.cape, pic.life],
    duration: '6 hours', groupSize: '2-12 guests', price: 120, rating: 4.9, reviewCount: 87,
    summary: 'Spice farms in the morning, carved doors and Forodhani seafood at dusk. A slow day through the island’s layered history.',
    highlights: ['Spice farm tour', 'Stone Town doors', 'Forodhani night market', 'Dhow sunset'],
    includes: ['Guide', 'Spice tastings', 'Transport'],
  },
];

export const mockDestinations: Destination[] = [
  {
    _id: 'd1', name: 'Nigeria', slug: slug('nigeria'), region: 'West Africa', heroImage: pic.crew,
    intro: 'Loud, generous, endlessly inventive. Nigeria is where the music, the food and the humour are all turned up, and where every stranger somehow becomes a host.',
    bestTime: 'Nov – Mar', duration: '5–10 days', priceFrom: '£85',
    cities: [
      { name: 'Lagos', blurb: 'The beating heart. Beaches, nightlife, art and traffic stories.', image: pic.life },
      { name: 'Abuja', blurb: 'Planned, calm and surrounded by dramatic rock.', image: pic.crew },
    ],
    thingsToDo: ['Eat suya at midnight', 'Catch live highlife', 'Visit Zuma Rock', 'Browse Lekki Arts Market'],
    food: [{ name: 'Jollof rice', desc: 'The great West African debate, best settled by tasting.' }, { name: 'Suya', desc: 'Spiced grilled beef with yaji pepper.' }, { name: 'Pounded yam & egusi' }],
    travelTips: ['Carry small notes for markets', 'Book intercity travel in daylight', 'Greet before you ask'],
    experiences: [],
  },
  {
    _id: 'd2', name: 'Egypt', slug: slug('egypt'), region: 'North Africa', heroImage: pic.cairo,
    intro: 'Five thousand years of stories, still being told on every corner. Go for the pyramids, stay for the tea and the people.',
    bestTime: 'Oct – Apr', duration: '7–10 days', priceFrom: '£185',
    cities: [{ name: 'Cairo', blurb: 'Chaotic, ancient, unforgettable.', image: pic.cairo }, { name: 'Luxor', blurb: 'The world’s greatest open-air museum.', image: pic.life }],
    thingsToDo: ['Giza at sunrise', 'Felucca on the Nile', 'Khan el-Khalili bazaar'],
    food: [{ name: 'Koshari', desc: 'Rice, lentils, pasta and crispy onions.' }, { name: 'Ful medames' }],
    travelTips: ['Dress modestly at religious sites', 'Haggle with a smile'], experiences: [],
  },
  {
    _id: 'd3', name: 'South Africa', slug: slug('south-africa'), region: 'Southern Africa', heroImage: pic.cape,
    intro: 'Mountains that fall into oceans, vineyards, townships full of music and a coastline that never gets old.',
    bestTime: 'Nov – Mar', duration: '7–12 days', priceFrom: '£160',
    cities: [{ name: 'Cape Town', blurb: 'Table Mountain, penguins and sunsets.', image: pic.cape }],
    thingsToDo: ['Boulders Beach penguins', 'Table Mountain hike', 'Winelands day'],
    food: [{ name: 'Braai' }, { name: 'Bunny chow' }], travelTips: ['Layer up, weather swings fast'], experiences: [],
  },
  {
    _id: 'd4', name: 'Ghana', slug: slug('ghana'), region: 'West Africa', heroImage: pic.life,
    intro: 'Warm, proud and welcoming. Castles, kente, kenkey and a coastline made for slow days.',
    bestTime: 'Nov – Mar', duration: '5–8 days', priceFrom: '£85',
    cities: [{ name: 'Accra', blurb: 'Creative, coastal, fun.', image: pic.life }],
    thingsToDo: ['Jamestown walk', 'Cape Coast Castle', 'Kakum canopy'],
    food: [{ name: 'Waakye' }, { name: 'Kenkey & fish' }], travelTips: ['Try the local mobile-money apps'], experiences: [],
  },
  {
    _id: 'd5', name: 'Kenya', slug: slug('kenya'), region: 'East Africa', heroImage: pic.crew,
    intro: 'Savannah, Swahili coast and some of the best guides on earth.',
    bestTime: 'Jul – Oct', duration: '7–10 days', priceFrom: '£640',
    cities: [{ name: 'Nairobi', blurb: 'A city with a national park inside it.', image: pic.crew }],
    thingsToDo: ['Maasai Mara safari', 'Diani Beach', 'Nairobi National Park'],
    food: [{ name: 'Nyama choma' }, { name: 'Ugali' }], travelTips: ['Pack neutral colours for safari'], experiences: [],
  },
];

export const mockProducts: StoreProduct[] = [
  { _id: 'p1', category: 'magazine', title: 'Gidi Tour Magazine · Issue 01', slug: slug('issue-01'), image: pic.crew, description: 'Our debut issue: 120 pages on the food, music and people of West Africa, with city guides and photo essays.', isFree: true, issueNumber: '01', publishDate: '2026-03-01', popular: true },
  { _id: 'p2', category: 'magazine', title: 'Gidi Tour Magazine · Issue 02', slug: slug('issue-02'), image: pic.cairo, description: 'North Africa special: Cairo after dark, Marrakech rooftops and the Nile by felucca.', price: 8, issueNumber: '02', publishDate: '2026-07-01' },
  { _id: 'p3', category: 'merchandise', title: 'Gidi Explorer Tote', slug: slug('explorer-tote'), image: pic.life, description: 'Heavy canvas tote with the Gidi mark. Fits a laptop, a camera and a market haul.', price: 22, popular: true, stock: 40 },
  { _id: 'p4', category: 'merchandise', title: 'Leaf Green Cap', slug: slug('leaf-green-cap'), image: pic.cape, description: 'Washed cotton cap in Gidi green with an embroidered palm mark.', price: 18, variants: [{ label: 'One size', stock: 20 }] },
  { _id: 'p5', category: 'merchandise', title: 'Passport Travel Wallet', slug: slug('passport-wallet'), image: pic.crew, description: 'Vegan leather wallet for passports, boarding passes and a pen.', price: 28, stock: 12 },
  { _id: 'p6', category: 'merchandise', title: 'Gidi Tour Tee', slug: slug('gidi-tee'), image: pic.life, description: 'Soft organic-cotton tee with our palm and plane print.', price: 25, variants: [{ label: 'S', stock: 10 }, { label: 'M', stock: 10 }, { label: 'L', stock: 10 }, { label: 'XL', stock: 0 }] },
];

const body = (...paras: string[]) =>
  paras.map((text, i) => ({ _type: 'block', _key: `k${i}`, style: i === 1 ? 'h2' : 'normal', children: [{ _type: 'span', text }] }));

export const mockArticles: Article[] = [
  { _id: 'a1', title: 'Zanzibar in a weekend, without rushing', slug: slug('zanzibar-weekend'), image: pic.cape, excerpt: 'Stone Town in a day, the coast in two more: a realistic weekend itinerary that doesn’t rush it.', category: 'Itineraries', destination: 'Tanzania', readTime: 6, date: '2026-09-02', featured: true, body: body('Land early and drop your bags. Zanzibar rewards people who slow down.', 'Day one: Stone Town', 'Start in the lanes behind the old fort, where carved doors tell you who built each house. Lunch is Forodhani seafood, eaten standing up.', 'Day two: the coast', 'Take a spice farm in the morning and the beach all afternoon. Resist the urge to pack the itinerary. Fewer stops, more time at each, is the whole philosophy here.') },
  { _id: 'a2', title: 'How to eat your way through Lagos', slug: slug('eat-lagos'), image: pic.life, excerpt: 'From mama-put lunches to midnight suya: a field guide to the city’s tastiest corners.', category: 'Food', destination: 'Nigeria', readTime: 5, date: '2026-08-14', body: body('Lagos runs on food.', 'Start with breakfast', 'Akara and pap from a roadside stall is the great equaliser. Everyone queues, everyone talks.') },
  { _id: 'a3', title: 'Seven greetings that change how people treat you', slug: slug('greetings'), image: pic.crew, excerpt: 'A handful of local greetings goes much further than you’d think.', category: 'Culture', readTime: 4, date: '2026-07-20', body: body('Learn the greeting before the thank-you.', 'Why it works', 'Greeting properly is a sign of respect almost everywhere on the continent.') },
  { _id: 'a4', title: 'Giza before the buses', slug: slug('giza-early'), image: pic.cairo, excerpt: 'The best hour at the pyramids is the first one. Here’s how to get it.', category: 'Travel tips', destination: 'Egypt', readTime: 3, date: '2026-06-11', body: body('Be at the gate before it opens.', 'Plan the morning', 'Book a guide the night before and ask for the early slot.') },
];

export const mockReviews: Review[] = [
  { _id: 'r1', name: 'Amara O.', location: 'London, UK', rating: 5, title: 'Felt like travelling with a friend', comment: 'Our guide knew everyone and every story. We ate things I could never have found alone. Already planning the next one.', createdAt: '2026-09-04', tour: { title: 'Lagos After Dark', slug: 'lagos-after-dark' } },
  { _id: 'r2', name: 'David K.', location: 'Toronto, Canada', rating: 5, title: 'Best day of the trip', comment: 'Zero crowds at the pyramids and the guide made it come alive. Worth every penny.', createdAt: '2026-08-21', tour: { title: 'Pyramids Without the Crowds', slug: 'pyramids-without-the-crowds' } },
  { _id: 'r3', name: 'Zainab M.', location: 'Abuja, Nigeria', rating: 4, title: 'Beautiful and well organised', comment: 'Smooth pickup, lovely small group and a breakfast I still think about.', createdAt: '2026-07-30', tour: { title: 'Zuma at First Light', slug: 'zuma-at-first-light' } },
];

export const mockFaqs: Faq[] = [
  { _id: 'f1', question: 'How do I book a tour?', answer: 'Pick a tour, choose your dates and group size, and pay securely in the app. You’ll get an email confirmation straight away.', page: 'general' },
  { _id: 'f2', question: 'Can I change or cancel my booking?', answer: 'Yes. See our cancellation and refund policy, or message our team and we’ll help you move your dates.', page: 'general' },
  { _id: 'f3', question: 'Which currencies can I pay in?', answer: 'Prices are shown in your local currency where we support it. Everyone else pays in GBP.', page: 'general' },
  { _id: 'f4', question: 'Are tours private?', answer: 'Most tours are small groups. You can book any tour privately; choose “Private / Custom” as your trip type.', page: 'general' },
];

export const mockPositions: JobPosition[] = [
  { _id: 'j1', title: 'Local Experience Designer, Lagos', slug: slug('experience-designer-lagos'), team: 'Experiences', location: 'Lagos, Nigeria', commitment: 'Full-time', summary: 'Design and test tours with local guides, from first idea to the first group.', isOpen: true },
  { _id: 'j2', title: 'Customer Happiness Lead', slug: slug('customer-happiness'), team: 'Support', location: 'Remote', commitment: 'Full-time', summary: 'Be the friendly voice travellers hear before, during and after their trip.', isOpen: true },
];

export const mockSettings: SiteSettings = {
  siteName: 'Gidi Tour',
  tagline: 'Travel that feels like coming home.',
  email: 'support@giditour.com',
  phone: '+44 20 0000 0000',
  whatsapp: '+2340000000000',
  address: 'Lagos · London',
  socials: [
    { platform: 'instagram', url: 'https://instagram.com/giditour' },
    { platform: 'x', url: 'https://x.com/giditour' },
  ],
};
