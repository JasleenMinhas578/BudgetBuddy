// Maps keywords to semantic intents (not user-visible category names).
// This lets us match against whatever category names the user actually created.
const KEYWORD_MAP = {
  // ── Food & Drink ──────────────────────────────────────────────
  starbucks: 'food', coffee: 'food', cafe: 'food', restaurant: 'food',
  lunch: 'food', dinner: 'food', breakfast: 'food', brunch: 'food',
  pizza: 'food', mcdonalds: 'food', mcdonald: 'food', subway: 'food',
  sushi: 'food', doordash: 'food', ubereats: 'food', grubhub: 'food',
  chipotle: 'food', burger: 'food', grocery: 'food', groceries: 'food',
  supermarket: 'food', bakery: 'food', tims: 'food', timhortons: 'food',
  wendys: 'food', kfc: 'food', tacobell: 'food', taco: 'food',
  burrito: 'food', dominos: 'food', papajohns: 'food', harveys: 'food',
  diner: 'food', noodles: 'food', pho: 'food', ramen: 'food',
  smoothie: 'food', juice: 'food', boba: 'food', bubble: 'food',
  bar: 'food', pub: 'food', wings: 'food', ihop: 'food',
  dennys: 'food', applebees: 'food', panera: 'food',
  safeway: 'food', sobeys: 'food', loblaws: 'food', freshco: 'food',
  foodland: 'food', metro: 'food', nofrills: 'food', walmart: 'food',
  costco: 'food', skip: 'food', skipthedishes: 'food',
  soda: 'food', snacks: 'food', meal: 'food', eat: 'food', food: 'food',

  // ── Transport ─────────────────────────────────────────────────
  uber: 'transport', lyft: 'transport', taxi: 'transport', parking: 'transport',
  fuel: 'transport', transit: 'transport', train: 'transport', flight: 'transport',
  airline: 'transport', bus: 'transport', toll: 'transport',
  gas: 'transport', gasoline: 'transport', petrol: 'transport',
  shell: 'transport', esso: 'transport', mobil: 'transport', bp: 'transport',
  carwash: 'transport', rental: 'transport', zipcar: 'transport',
  bike: 'transport', scooter: 'transport',
  ttc: 'transport', oc: 'transport', translink: 'transport',

  // ── Entertainment ─────────────────────────────────────────────
  netflix: 'entertainment', spotify: 'entertainment', hulu: 'entertainment',
  disney: 'entertainment', cinema: 'entertainment', movie: 'entertainment',
  theater: 'entertainment', concert: 'entertainment', gaming: 'entertainment',
  steam: 'entertainment', youtube: 'entertainment', twitch: 'entertainment',
  prime: 'entertainment', hbo: 'entertainment', max: 'entertainment',
  paramount: 'entertainment', peacock: 'entertainment', crunchyroll: 'entertainment',
  tidal: 'entertainment', soundcloud: 'entertainment', audible: 'entertainment',
  roblox: 'entertainment', xbox: 'entertainment', playstation: 'entertainment',
  nintendo: 'entertainment', tickets: 'entertainment', event: 'entertainment',
  escape: 'entertainment', arcade: 'entertainment', bowling: 'entertainment',
  recroom: 'entertainment', rec: 'entertainment',

  // ── Utilities ─────────────────────────────────────────────────
  electricity: 'utilities', internet: 'utilities', wifi: 'utilities',
  hydro: 'utilities', water: 'utilities', electric: 'utilities',
  phone: 'utilities', mobile: 'utilities', bill: 'utilities',
  rogers: 'utilities', bell: 'utilities', telus: 'utilities',
  shaw: 'utilities', fido: 'utilities', virgin: 'utilities', koodo: 'utilities',
  enmax: 'utilities', fortis: 'utilities', insurance: 'utilities',

  // ── Rent ──────────────────────────────────────────────────────
  rent: 'rent', mortgage: 'rent', lease: 'rent',

  // ── Shopping ──────────────────────────────────────────────────
  amazon: 'shopping', target: 'shopping',
  clothing: 'shopping', clothes: 'shopping', shoes: 'shopping',
  ikea: 'shopping', bestbuy: 'shopping', homedepot: 'shopping',
  canadiantire: 'shopping', sportchek: 'shopping',
  lululemon: 'shopping', zara: 'shopping', hm: 'shopping',
  gap: 'shopping', oldnavy: 'shopping', urbanplanet: 'shopping',
  urban: 'shopping', planet: 'shopping',
  winners: 'shopping', marshalls: 'shopping', forever21: 'shopping',
  aritzia: 'shopping', indigo: 'shopping', chapters: 'shopping',
  shein: 'shopping', fashion: 'shopping', outfit: 'shopping',
  drugstore: 'shopping', shoppers: 'shopping',
  massage: 'shopping', haircut: 'shopping', hair: 'shopping',
  luggage: 'shopping', suitcase: 'shopping',

  // ── Health & Fitness ──────────────────────────────────────────
  gym: 'health', fitness: 'health', goodlife: 'health', anytime: 'health',
  doctor: 'health', dentist: 'health', pharmacy: 'health',
  rexall: 'health', cvs: 'health', walgreens: 'health',
  medical: 'health', clinic: 'health', hospital: 'health',
  prescription: 'health', vitamins: 'health', supplements: 'health',
  therapy: 'health', physiotherapy: 'health', optometrist: 'health', eyecare: 'health',

  // ── Personal Care ─────────────────────────────────────────────
  salon: 'personal-care', barber: 'personal-care', spa: 'personal-care',
  nails: 'personal-care', waxing: 'personal-care', manicure: 'personal-care',
  pedicure: 'personal-care', beauty: 'personal-care', skincare: 'personal-care',
  makeup: 'personal-care', sephora: 'personal-care', ulta: 'personal-care',

  // ── Travel ────────────────────────────────────────────────────
  hotel: 'travel', airbnb: 'travel', vrbo: 'travel', hostel: 'travel',
  expedia: 'travel', booking: 'travel', vacation: 'travel',
  resort: 'travel', cruise: 'travel',
  passport: 'other', visa: 'other',

  // ── Education ─────────────────────────────────────────────────
  tuition: 'education', school: 'education', university: 'education',
  college: 'education', course: 'education', udemy: 'education',
  coursera: 'education', textbook: 'education', books: 'education',
  book: 'education', study: 'education', supplies: 'education',
};

// Fallback category name per intent — used when no user category matches.
// Uses descriptive names so the suggestion is meaningful; ExpenseForm will
// auto-create the category if it doesn't exist when the user accepts it.
const INTENT_DEFAULT = {
  food: 'Food',
  transport: 'Transport',
  entertainment: 'Entertainment',
  utilities: 'Utilities',
  rent: 'Rent',
  shopping: 'Shopping',
  health: 'Health',
  'personal-care': 'Personal Care',
  travel: 'Travel',
  education: 'Education',
  other: 'Other',
};

// Normalises a string to bare lowercase letters for fuzzy matching.
function bare(s) {
  return s.toLowerCase().replace(/[^a-z]/g, '');
}

// Returns a suggested category name for the given expense title.
// Pass the user's full category list (array of { name: string }) so custom
// categories like "Health & Fitness" or "Personal Care" are matched first.
export function suggestCategory(title, categories = []) {
  if (!title || typeof title !== 'string') return null;
  const words = title.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);

  for (const word of words) {
    const intent = word && KEYWORD_MAP[word];
    if (!intent) continue;

    // Try to find a user category whose name contains the intent words.
    // e.g. intent 'health' matches "Health & Fitness", "My Health", etc.
    // intent 'personal-care' matches "Personal Care", "PersonalCare", etc.
    if (categories.length > 0) {
      const intentTokens = intent.split('-'); // ['personal', 'care']
      const match = categories.find(cat =>
        intentTokens.every(token => bare(cat.name).includes(token))
      );
      if (match) return match.name;
    }

    return INTENT_DEFAULT[intent] ?? 'Other';
  }
  return null;
}
