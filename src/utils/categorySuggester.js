const KEYWORD_MAP = {
  // ── Food & Drink ──────────────────────────────────────────────
  starbucks: 'Food', coffee: 'Food', cafe: 'Food', restaurant: 'Food',
  lunch: 'Food', dinner: 'Food', breakfast: 'Food', brunch: 'Food',
  pizza: 'Food', mcdonalds: 'Food', mcdonald: 'Food', subway: 'Food',
  sushi: 'Food', doordash: 'Food', ubereats: 'Food', grubhub: 'Food',
  chipotle: 'Food', burger: 'Food', grocery: 'Food', groceries: 'Food',
  supermarket: 'Food', bakery: 'Food', tims: 'Food', timhortons: 'Food',
  wendys: 'Food', kfc: 'Food', tacobell: 'Food', taco: 'Food',
  burrito: 'Food', dominos: 'Food', papajohns: 'Food', harveys: 'Food',
  diner: 'Food', noodles: 'Food', pho: 'Food', ramen: 'Food',
  smoothie: 'Food', juice: 'Food', boba: 'Food', bubble: 'Food',
  bar: 'Food', pub: 'Food', wings: 'Food', ihop: 'Food',
  dennys: 'Food', applebees: 'Food', panera: 'Food',
  safeway: 'Food', sobeys: 'Food', loblaws: 'Food', freshco: 'Food',
  foodland: 'Food', metro: 'Food', nofrills: 'Food', walmart: 'Food',
  costco: 'Food', skip: 'Food', skipthedishes: 'Food',
  soda: 'Food', snacks: 'Food', meal: 'Food', eat: 'Food', food: 'Food',

  // ── Transport ─────────────────────────────────────────────────
  uber: 'Transport', lyft: 'Transport', taxi: 'Transport', parking: 'Transport',
  fuel: 'Transport', transit: 'Transport', train: 'Transport', flight: 'Transport',
  airline: 'Transport', bus: 'Transport', toll: 'Transport',
  gas: 'Transport', gasoline: 'Transport', petrol: 'Transport',
  shell: 'Transport', esso: 'Transport', mobil: 'Transport', bp: 'Transport',
  carwash: 'Transport', rental: 'Transport', zipcar: 'Transport',
  bike: 'Transport', scooter: 'Transport', subway: 'Transport',
  ttc: 'Transport', oc: 'Transport', translink: 'Transport',

  // ── Entertainment ─────────────────────────────────────────────
  netflix: 'Entertainment', spotify: 'Entertainment', hulu: 'Entertainment',
  disney: 'Entertainment', cinema: 'Entertainment', movie: 'Entertainment',
  theater: 'Entertainment', concert: 'Entertainment', gaming: 'Entertainment',
  steam: 'Entertainment', youtube: 'Entertainment', twitch: 'Entertainment',
  prime: 'Entertainment', hbo: 'Entertainment', max: 'Entertainment',
  paramount: 'Entertainment', peacock: 'Entertainment', crunchyroll: 'Entertainment',
  tidal: 'Entertainment', soundcloud: 'Entertainment', audible: 'Entertainment',
  roblox: 'Entertainment', xbox: 'Entertainment', playstation: 'Entertainment',
  nintendo: 'Entertainment', tickets: 'Entertainment', event: 'Entertainment',
  escape: 'Entertainment', arcade: 'Entertainment', bowling: 'Entertainment',
  recroom: 'Entertainment', rec: 'Entertainment',

  // ── Utilities ─────────────────────────────────────────────────
  electricity: 'Utilities', internet: 'Utilities', wifi: 'Utilities',
  hydro: 'Utilities', water: 'Utilities', electric: 'Utilities',
  phone: 'Utilities', mobile: 'Utilities', bill: 'Utilities',
  rogers: 'Utilities', bell: 'Utilities', telus: 'Utilities',
  shaw: 'Utilities', fido: 'Utilities', virgin: 'Utilities', koodo: 'Utilities',
  enmax: 'Utilities', fortis: 'Utilities', insurance: 'Utilities',

  // ── Rent ──────────────────────────────────────────────────────
  rent: 'Rent', mortgage: 'Rent', lease: 'Rent',

  // ── Shopping ──────────────────────────────────────────────────
  amazon: 'Shopping', target: 'Shopping',
  clothing: 'Shopping', clothes: 'Shopping', shoes: 'Shopping',
  ikea: 'Shopping', bestbuy: 'Shopping', homedepot: 'Shopping',
  canadiantire: 'Shopping', sportchek: 'Shopping',
  lululemon: 'Shopping', zara: 'Shopping', hm: 'Shopping',
  gap: 'Shopping', oldnavy: 'Shopping', urbanplanet: 'Shopping',
  urban: 'Shopping', planet: 'Shopping',
  winners: 'Shopping', marshalls: 'Shopping', forever21: 'Shopping',
  aritzia: 'Shopping', indigo: 'Shopping', chapters: 'Shopping',
  shein: 'Shopping', fashion: 'Shopping', outfit: 'Shopping',

  // ── Health & Fitness ──────────────────────────────────────────
  gym: 'Health', fitness: 'Health', goodlife: 'Health', anytime: 'Health',
  doctor: 'Health', dentist: 'Health', pharmacy: 'Health',
  drugstore: 'Health', shoppers: 'Health', rexall: 'Health',
  cvs: 'Health', walgreens: 'Health', medical: 'Health', clinic: 'Health',
  hospital: 'Health', prescription: 'Health', vitamins: 'Health',
  supplements: 'Health', therapy: 'Health', massage: 'Health',
  physiotherapy: 'Health', optometrist: 'Health', eyecare: 'Health',

  // ── Personal Care ─────────────────────────────────────────────
  haircut: 'Personal Care', hair: 'Personal Care', salon: 'Personal Care',
  barber: 'Personal Care', spa: 'Personal Care', nails: 'Personal Care',
  waxing: 'Personal Care', manicure: 'Personal Care', pedicure: 'Personal Care',
  beauty: 'Personal Care', skincare: 'Personal Care', makeup: 'Personal Care',
  sephora: 'Personal Care', ulta: 'Personal Care',

  // ── Travel ────────────────────────────────────────────────────
  hotel: 'Travel', airbnb: 'Travel', vrbo: 'Travel', hostel: 'Travel',
  expedia: 'Travel', booking: 'Travel', vacation: 'Travel',
  resort: 'Travel', cruise: 'Travel', passport: 'Travel', visa: 'Travel',
  luggage: 'Travel', suitcase: 'Travel',

  // ── Education ─────────────────────────────────────────────────
  tuition: 'Education', school: 'Education', university: 'Education',
  college: 'Education', course: 'Education', udemy: 'Education',
  coursera: 'Education', textbook: 'Education', books: 'Education',
  book: 'Education', study: 'Education', supplies: 'Education',
};

export function suggestCategory(title) {
  if (!title || typeof title !== 'string') return null;
  const words = title.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
  for (const word of words) {
    if (word && KEYWORD_MAP[word]) return KEYWORD_MAP[word];
  }
  return null;
}
