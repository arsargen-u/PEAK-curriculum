// ============================================================
// Behavior Ally — Picture Library Data
// pictureLibraryData.js
//
// Usage:
//   import { PICTURE_LIBRARY, CATEGORIES, getVariants } from './pictureLibraryData';
//
// Each stimulus item has exactly 5 variants for treatment integrity.
// Shapes/Colors/Numbers/Letters use SVG (stable, no network).
// All other categories use Wikipedia article thumbnails.
// ============================================================

export const SHAPE_COLORS = [
  { id: 'coral',  label: 'Red-Orange', hex: '#D9674A' },
  { id: 'blue',   label: 'Blue',       hex: '#2563EB' },
  { id: 'green',  label: 'Green',      hex: '#5A8B3C' },
  { id: 'yellow', label: 'Yellow',     hex: '#CA8A04' },
  { id: 'purple', label: 'Purple',     hex: '#7C3AED' },
];

export const COLORS = [
  { id: 'red',    label: 'Red',    hex: '#DC2626' },
  { id: 'blue',   label: 'Blue',   hex: '#2563EB' },
  { id: 'yellow', label: 'Yellow', hex: '#CA8A04' },
  { id: 'green',  label: 'Green',  hex: '#16A34A' },
  { id: 'orange', label: 'Orange', hex: '#EA580C' },
  { id: 'purple', label: 'Purple', hex: '#7C3AED' },
  { id: 'pink',   label: 'Pink',   hex: '#DB2777' },
  { id: 'black',  label: 'Black',  hex: '#111827' },
  { id: 'white',  label: 'White',  hex: '#F9FAFB' },
  { id: 'brown',  label: 'Brown',  hex: '#92400E' },
  { id: 'gray',   label: 'Gray',   hex: '#6B7280' },
  { id: 'teal',   label: 'Teal',   hex: '#0F766E' },
];

// 5 real-world objects per color for association training
export const COLOR_VARIANTS = {
  red:    ['red apple','red fire truck','red barn','red rose','red strawberry'],
  blue:   ['blue sky','blue ocean','blue bluebird','blue balloon','blue jeans'],
  yellow: ['yellow banana','yellow school bus','yellow sunflower','yellow rubber duck','yellow corn'],
  green:  ['green grass','green frog','green broccoli','green lime fruit','green leaf'],
  orange: ['orange fruit','orange tiger','orange pumpkin','orange carrot','orange goldfish'],
  purple: ['purple grape','purple eggplant','purple iris flower','purple lavender','purple plum'],
  pink:   ['pink flamingo','pink pig','pink peony flower','pink salmon fish','pink cotton candy'],
  black:  ['black bear','black crow bird','black chalkboard','black tire wheel','black piano'],
  white:  ['white cloud','white polar bear','white milk glass','white daisy flower','white rabbit'],
  brown:  ['brown bear','brown tree bark','brown acorn','brown chocolate','brown bread loaf'],
  gray:   ['gray elephant','gray rock','gray dolphin','gray cat','gray storm cloud'],
  teal:   ['teal peacock','teal ocean','teal dragonfly','teal parakeet','teal gemstone'],
};

export const SHAPES = [
  'circle','square','triangle','rectangle','oval',
  'diamond','star','heart','pentagon','hexagon',
];

export const NUMBERS = Array.from({ length: 10 }, (_, i) => i + 1);
export const LETTERS = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

// NUMBER_VARIANTS: 5 representations per number
export const NUMBER_STYLES = [
  { id: 'numeral',  label: 'Numeral' },
  { id: 'word',     label: 'Word'    },
  { id: 'dots',     label: 'Dots'    },
  { id: 'tally',    label: 'Tally'   },
  { id: 'dice',     label: 'Dice'    },
];

export const NUMBER_WORDS = ['','one','two','three','four','five','six','seven','eight','nine','ten'];

// LETTER_VARIANTS: uppercase, lowercase, two display colors
export const LETTER_STYLES = [
  { id: 'upper_coral',  label: 'Uppercase (A)',  case: 'upper', color: '#D9674A' },
  { id: 'lower_coral',  label: 'Lowercase (a)',  case: 'lower', color: '#D9674A' },
  { id: 'upper_green',  label: 'Uppercase (A)',  case: 'upper', color: '#5A8B3C' },
  { id: 'lower_green',  label: 'Lowercase (a)',  case: 'lower', color: '#5A8B3C' },
  { id: 'upper_blue',   label: 'Uppercase (A)',  case: 'upper', color: '#2563EB' },
];

// WIKI_VARIANTS: 5 real Wikipedia article titles per item.
// Must be exact article titles (not descriptive phrases) so the REST API finds them.
// The useWikiImg hook also falls back to OpenSearch for any that still miss.
export const WIKI_VARIANTS = {
  // ANIMALS — breed / species article titles
  dog:        ['Poodle', 'Bulldog', 'Labrador Retriever', 'Golden Retriever', 'Great Dane'],
  cat:        ['Persian cat', 'Siamese cat', 'Maine Coon', 'Tabby cat', 'Ragdoll cat'],
  bird:       ['American robin', 'Blue jay', 'Northern cardinal', 'Hummingbird', 'American crow'],
  fish:       ['Clownfish', 'Goldfish', 'Angelfish', 'Koi', 'Guppy'],
  horse:      ['Thoroughbred', 'Shetland pony', 'Arabian horse', 'Clydesdale horse', 'Appaloosa'],
  cow:        ['Holstein cattle', 'Jersey cattle', 'Highland cattle', 'Angus cattle', 'Brown Swiss cattle'],
  pig:        ['Domestic pig', 'Large White pig', 'Pot-bellied pig', 'Berkshire pig', 'Piglet'],
  duck:       ['Mallard', 'Pekin duck', 'Wood duck', 'Mandarin duck', 'Muscovy duck'],
  elephant:   ['African bush elephant', 'Asian elephant', 'African elephant', 'Elephant', 'Woolly mammoth'],
  lion:       ['Lion', 'Lioness', 'White lion', 'Asiatic lion', 'Mountain lion'],
  bear:       ['Brown bear', 'Polar bear', 'American black bear', 'Grizzly bear', 'Giant panda'],
  rabbit:     ['Domestic rabbit', 'Holland Lop', 'Rex rabbit', 'Angora rabbit', 'Cottontail rabbit'],
  frog:       ['Red-eyed tree frog', 'American bullfrog', 'Poison dart frog', 'Green tree frog', 'Dendrobatidae'],
  turtle:     ['Green sea turtle', 'Box turtle', 'Red-eared slider', 'Desert tortoise', 'Painted turtle'],
  butterfly:  ['Monarch butterfly', 'Blue morpho butterfly', 'Swallowtail butterfly', 'Painted lady butterfly', 'Cabbage white butterfly'],
  giraffe:    ['Giraffe', 'Reticulated giraffe', 'Masai giraffe', 'Northern giraffe', 'Okapi'],
  penguin:    ['Emperor penguin', 'African penguin', 'Rockhopper penguin', 'King penguin', 'Little penguin'],
  sheep:      ['Merino', 'Domestic sheep', 'Suffolk sheep', 'Dorset Horn', 'Lamb'],

  // FOOD — cultivar / food article titles
  apple:      ['Red Delicious', 'Granny Smith', 'Fuji apple', 'Honeycrisp', 'McIntosh apple'],
  banana:     ['Banana', 'Cavendish banana', 'Plantain', 'Red banana', 'Cooking banana'],
  orange:     ['Navel orange', 'Blood orange', 'Mandarin orange', 'Clementine', 'Valencia orange'],
  bread:      ['White bread', 'Whole wheat bread', 'Sourdough', 'Baguette', 'Rye bread'],
  milk:       ['Milk', 'Whole milk', 'Skimmed milk', 'Chocolate milk', 'Condensed milk'],
  egg:        ['Chicken egg', 'Hard-boiled egg', 'Scrambled eggs', 'Fried egg', 'Egg (food)'],
  carrot:     ['Carrot', 'Baby carrot', 'Purple carrot', 'Chantenay carrot', 'Danvers carrot'],
  cookie:     ['Chocolate chip cookie', 'Sugar cookie', 'Oatmeal cookie', 'Snickerdoodle', 'Shortbread'],
  pizza:      ['Pizza', 'Margherita pizza', 'Pepperoni pizza', 'Neapolitan pizza', 'Pizza Margherita'],
  grape:      ['Grape', 'Concord grape', 'Thompson Seedless', 'Muscat', 'Table grape'],
  strawberry: ['Strawberry', 'Wild strawberry', 'Garden strawberry', 'Alpine strawberry', 'Fragaria'],
  watermelon: ['Watermelon', 'Seedless watermelon', 'Citrullus lanatus', 'Sugar Baby watermelon', 'Watermelon (plant)'],
  cheese:     ['Cheddar cheese', 'Swiss cheese', 'Brie', 'Mozzarella', 'American cheese'],
  corn:       ['Maize', 'Sweet corn', 'Popcorn', 'Corn on the cob', 'Flint corn'],
  pear:       ['Bartlett pear', 'Asian pear', 'Pear', 'Bosc pear', 'Comice pear'],
  broccoli:   ['Broccoli', 'Romanesco broccoli', 'Broccolini', 'Broccoli rabe', 'Calabrese broccoli'],
  tomato:     ['Tomato', 'Cherry tomato', 'Heirloom tomato', 'Roma tomato', 'Beefsteak tomato'],

  // BODY PARTS — anatomy article titles (real Wikipedia pages with photos)
  hand:       ['Hand', 'Thumb', 'Index finger', 'Palm (anatomy)', 'Knuckle'],
  foot:       ['Foot', 'Toe', 'Heel', 'Sole (foot)', 'Arch of the foot'],
  nose:       ['Nose', 'Nostril', 'Nasal septum', 'Rhinoplasty', 'Nasal bridge'],
  eye:        ['Human eye', 'Iris (anatomy)', 'Pupil', 'Eyelid', 'Cornea'],
  ear:        ['Ear', 'Earlobe', 'Pinna (anatomy)', 'Ear canal', 'Eardrum'],
  mouth:      ['Mouth', 'Lip', 'Tooth', 'Tongue', 'Smile'],
  arm:        ['Arm', 'Forearm', 'Upper arm', 'Elbow', 'Biceps'],
  leg:        ['Leg', 'Thigh', 'Calf (leg)', 'Shin', 'Tibia'],
  finger:     ['Index finger', 'Thumb', 'Little finger', 'Ring finger', 'Fingernail'],
  shoulder:   ['Shoulder', 'Deltoid muscle', 'Rotator cuff', 'Clavicle', 'Scapula'],
  knee:       ['Knee', 'Patella', 'Patellar tendon', 'Quadriceps femoris muscle', 'Tibia'],
  hair:       ['Hair', 'Blond', 'Afro-textured hair', 'Red hair', 'Ponytail'],

  // CLOTHING — garment article titles
  'T-shirt':  ['T-shirt', 'Polo shirt', 'Tank top (clothing)', 'Long-sleeved shirt', 'Hoodie'],
  trousers:   ['Jeans', 'Sweatpants', 'Cargo pants', 'Chino trousers', 'Khaki'],
  shoe:       ['Sneakers', 'Sandal', 'Oxford shoe', 'Wellington boot', 'Slip-on shoe'],
  hat:        ['Baseball cap', 'Knit cap', 'Sun hat', 'Cowboy hat', 'Bucket hat'],
  sock:       ['Sock', 'Knee highs', 'Compression stockings', 'Ankle sock', 'Toe socks'],
  dress:      ['Dress', 'Sundress', 'Party dress', 'Sheath dress', 'Wrap dress'],
  coat:       ['Overcoat', 'Raincoat', 'Trench coat', 'Puffer jacket', 'Duffle coat'],
  scarf:      ['Scarf', 'Plaid', 'Pashmina', 'Balaclava', 'Neck gaiter'],
  boot:       ['Wellington boot', 'Snow boots', 'Chelsea boot', 'Ankle boot', 'Cowboy boot'],
  sweater:    ['Sweater', 'Pullover sweater', 'Cardigan (sweater)', 'Turtleneck', 'Crew neck'],
  backpack:   ['Backpack', 'Hiking backpack', 'School bag', 'Rucksack', 'Sling bag'],
  gloves:     ['Glove', 'Mitten', 'Rubber glove', 'Leather glove', 'Surgical glove'],

  // OBJECTS — article titles
  chair:      ['Chair', 'Rocking chair', 'Beanbag chair', 'Folding chair', 'Armchair'],
  table:      ['Table (furniture)', 'Coffee table', 'Picnic table', 'Desk', 'Dining table'],
  cup:        ['Cup', 'Mug', 'Teacup', 'Drinking glass', 'Thermos'],
  spoon:      ['Spoon', 'Wooden spoon', 'Ladle', 'Measuring spoon', 'Teaspoon'],
  fork:       ['Fork', 'Salad fork', 'Dessert fork', 'Serving fork', 'Chopsticks'],
  door:       ['Door', 'Screen door', 'Barn door', 'Sliding door', 'French doors'],
  bed:        ['Bed', 'Bunk bed', 'Toddler bed', 'Crib', 'Platform bed'],
  lamp:       ['Lamp', 'Table lamp', 'Floor lamp', 'Desk lamp', 'Night light'],
  book:       ['Book', 'Hardcover', 'Picture book', 'Textbook', 'Paperback'],
  ball:       ['Ball', 'Football', 'Basketball', 'Tennis ball', 'Beach ball'],
  pencil:     ['Pencil', 'Colored pencil', 'Mechanical pencil', 'Graphite', 'Ballpoint pen'],
  scissors:   ['Scissors', 'Pruning shears', 'Utility knife', 'Kitchen knife', 'Box cutter'],
  key:        ['Key (lock)', 'House key', 'Car key', 'Key ring', 'Skeleton key'],
  telephone:  ['Telephone', 'Rotary dial', 'Cordless telephone', 'Payphone', 'Desk telephone'],
  clock:      ['Clock', 'Alarm clock', 'Wall clock', 'Cuckoo clock', 'Pendulum clock'],
  umbrella:   ['Umbrella', 'Parasol', 'Golf umbrella', 'Compact umbrella', 'Folding umbrella'],

  // TRANSPORT — vehicle article titles
  car:        ['Automobile', 'Sedan (automobile)', 'Minivan', 'Taxicab', 'Electric car'],
  bus:        ['School bus', 'Double-decker bus', 'Transit bus', 'Minibus', 'Trolleybus'],
  truck:      ['Fire engine', 'Pickup truck', 'Dump truck', 'Delivery van', 'Monster truck'],
  airplane:   ['Airplane', 'Jet aircraft', 'Propeller aircraft', 'Paper airplane', 'Biplane'],
  boat:       ['Sailboat', 'Rowboat', 'Motorboat', 'Canoe', 'Kayak'],
  bicycle:    ['Bicycle', 'Mountain bike', 'Tricycle', 'BMX', 'Road bicycle'],
  train:      ['Steam locomotive', 'Passenger train', 'High-speed rail', 'Model train', 'Freight train'],
  motorcycle: ['Motorcycle', 'Dirt bike', 'Motor scooter', 'Cruiser motorcycle', 'Moped'],
  helicopter: ['Helicopter', 'Search and rescue helicopter', 'Military helicopter', 'Autogyro', 'Helicopter rotor'],
  tractor:    ['Tractor', 'John Deere', 'Farm tractor', 'Compact tractor', 'Agricultural machinery'],

  // NATURE — article titles
  sun:        ['Sun', 'Sunrise', 'Sunset', 'Solar eclipse', 'Solar flare'],
  moon:       ['Moon', 'Full moon', 'Crescent moon', 'Lunar eclipse', 'Supermoon'],
  cloud:      ['Cloud', 'Cumulus cloud', 'Cumulonimbus cloud', 'Cirrus cloud', 'Fog'],
  tree:       ['Oak', 'Pine', 'Apple tree', 'Palm tree', 'Maple'],
  flower:     ['Sunflower', 'Rose', 'Daisy', 'Tulip', 'Wildflower meadow'],
  grass:      ['Grass', 'Lawn', 'Meadow', 'Prairie', 'Pasture'],
  rock:       ['Rock (geology)', 'Pebble', 'Boulder', 'Rock formation', 'Gemstone'],
  mountain:   ['Mountain', 'Rocky Mountains', 'Alps', 'Volcano', 'Hill'],
  ocean:      ['Ocean', 'Beach', 'Coral reef', 'Sea', 'Tide'],
  rain:       ['Rain', 'Thunderstorm', 'Drizzle', 'Monsoon', 'Flood'],
  rainbow:    ['Rainbow', 'Double rainbow', 'Fogbow', 'Prism', 'Optical phenomenon'],
  leaf:       ['Leaf', 'Maple leaf', 'Autumn leaf color', 'Tropical vegetation', 'Deciduous'],
};

export const CATEGORIES = [
  { id: 'shapes',    label: 'Shapes',     type: 'svg',  count: SHAPES.length },
  { id: 'colors',    label: 'Colors',     type: 'svg',  count: COLORS.length },
  { id: 'numbers',   label: 'Numbers',    type: 'svg',  count: NUMBERS.length },
  { id: 'letters',   label: 'Letters',    type: 'svg',  count: LETTERS.length },
  { id: 'animals',   label: 'Animals',    type: 'wiki', count: 18 },
  { id: 'food',      label: 'Food',       type: 'wiki', count: 17 },
  { id: 'body',      label: 'Body Parts', type: 'wiki', count: 12 },
  { id: 'clothing',  label: 'Clothing',   type: 'wiki', count: 12 },
  { id: 'objects',   label: 'Objects',    type: 'wiki', count: 16 },
  { id: 'transport', label: 'Transport',  type: 'wiki', count: 10 },
  { id: 'nature',    label: 'Nature',     type: 'wiki', count: 12 },
];

export const WIKI_CATEGORIES = {
  animals:   ['dog','cat','bird','fish','horse','cow','pig','duck','elephant','lion','bear','rabbit','frog','turtle','butterfly','giraffe','penguin','sheep'],
  food:      ['apple','banana','orange','bread','milk','egg','carrot','cookie','pizza','grape','strawberry','watermelon','cheese','corn','pear','broccoli','tomato'],
  body:      ['hand','foot','nose','eye','ear','mouth','arm','leg','finger','shoulder','knee','hair'],
  clothing:  ['T-shirt','trousers','shoe','hat','sock','dress','coat','scarf','boot','sweater','backpack','gloves'],
  objects:   ['chair','table','cup','spoon','fork','door','bed','lamp','book','ball','pencil','scissors','key','telephone','clock','umbrella'],
  transport: ['car','bus','truck','airplane','boat','bicycle','train','motorcycle','helicopter','tractor'],
  nature:    ['sun','moon','cloud','tree','flower','grass','rock','mountain','ocean','rain','rainbow','leaf'],
};

/**
 * Returns the 5 variants for a given stimulus item.
 * @param {string} category - Category id (e.g. 'animals', 'shapes')
 * @param {string|number} itemId - Item identifier
 * @returns {Array} Array of 5 variant descriptors
 */
export function getVariants(category, itemId) {
  if (category === 'shapes') {
    return SHAPE_COLORS.map(c => ({ type: 'shape', shape: itemId, color: c.hex, label: c.label }));
  }
  if (category === 'colors') {
    const variants = COLOR_VARIANTS[itemId] || [];
    return variants.map(term => ({ type: 'wiki', term, label: term }));
  }
  if (category === 'numbers') {
    return NUMBER_STYLES.map(s => ({ type: 'number', style: s.id, value: itemId, label: s.label }));
  }
  if (category === 'letters') {
    return LETTER_STYLES.map(s => ({ type: 'letter', style: s.id, value: itemId, case: s.case, color: s.color, label: s.label }));
  }
  // Wiki categories
  const variants = WIKI_VARIANTS[itemId] || [];
  return variants.map(term => ({ type: 'wiki', term, label: term }));
}

export default { CATEGORIES, WIKI_CATEGORIES, WIKI_VARIANTS, COLORS, SHAPES, NUMBERS, LETTERS, getVariants };
