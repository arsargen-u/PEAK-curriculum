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

// WIKI_VARIANTS: 5 specific Wikipedia search terms per item
// Format: { [itemId]: [wikiTerm1, wikiTerm2, wikiTerm3, wikiTerm4, wikiTerm5] }
export const WIKI_VARIANTS = {
  // ANIMALS
  dog:        ['poodle','bulldog','labrador retriever','golden retriever','great dane'],
  cat:        ['persian cat','siamese cat','maine coon','tabby cat','ragdoll cat'],
  bird:       ['american robin','blue jay bird','cardinal bird','hummingbird','crow bird'],
  fish:       ['clownfish','goldfish','angelfish','koi fish','guppy fish'],
  horse:      ['thoroughbred horse','shetland pony','arabian horse','clydesdale horse','appaloosa horse'],
  cow:        ['holstein cattle','jersey cow','highland cattle','angus cattle','brown swiss cow'],
  pig:        ['domestic pig','yorkshire pig','pot-bellied pig','berkshire pig','piglet'],
  duck:       ['mallard duck','pekin duck','wood duck','mandarin duck','muscovy duck'],
  elephant:   ['african bush elephant','asian elephant','baby elephant','elephant herd','elephant tusks'],
  lion:       ['lion male mane','lioness','lion cub','white lion','lion pride Africa'],
  bear:       ['brown bear','polar bear','american black bear','grizzly bear','giant panda'],
  rabbit:     ['white domestic rabbit','holland lop rabbit','rex rabbit','angora rabbit','cottontail rabbit'],
  frog:       ['red-eyed tree frog','american bullfrog','poison dart frog','green tree frog','pacific tree frog'],
  turtle:     ['green sea turtle','box turtle','red-eared slider','desert tortoise','painted turtle'],
  butterfly:  ['monarch butterfly','blue morpho butterfly','swallowtail butterfly','painted lady butterfly','cabbage white butterfly'],
  giraffe:    ['giraffe standing','reticulated giraffe','baby giraffe','giraffe eating leaves','masai giraffe'],
  penguin:    ['emperor penguin','african penguin','rockhopper penguin','king penguin','little blue penguin'],
  sheep:      ['merino sheep','lamb young sheep','suffolk sheep','dorset sheep','sheep herd field'],

  // FOOD
  apple:       ['red delicious apple','granny smith apple','fuji apple','honeycrisp apple','apple sliced'],
  banana:      ['yellow banana','banana bunch','green banana','plantain banana','baby banana'],
  orange:      ['navel orange','blood orange','mandarin orange','clementine orange','orange sliced'],
  bread:       ['white bread loaf','whole wheat bread','sourdough bread','baguette bread','bread slice'],
  milk:        ['glass of milk','milk jug','milk bottle','milk carton','milk pouring'],
  egg:         ['chicken egg white','egg carton','hard-boiled egg','cracked egg','brown egg'],
  carrot:      ['orange carrot','carrot bunch','baby carrot','carrot sliced','purple carrot'],
  cookie:      ['chocolate chip cookie','sugar cookie','oatmeal raisin cookie','snickerdoodle cookie','shortbread cookie'],
  pizza:       ['cheese pizza','pepperoni pizza','margherita pizza','pizza slice','mini pizza'],
  grape:       ['red grape cluster','green grape cluster','grape vine','concord grape','grape bunch'],
  strawberry:  ['red strawberry','strawberry plant','strawberry sliced','wild strawberry','strawberry basket'],
  watermelon:  ['whole watermelon','watermelon slice','watermelon cubes','seedless watermelon','mini watermelon'],
  cheese:      ['cheddar cheese block','swiss cheese','brie cheese','mozzarella cheese','american cheese slice'],
  corn:        ['corn on the cob','corn field','sweet corn','corn kernel','popcorn'],
  pear:        ['bartlett pear','asian pear','red anjou pear','green pear','pear sliced'],
  broccoli:    ['broccoli head','broccoli floret','broccoli bunch','raw broccoli','broccoli plant'],
  tomato:      ['red tomato','cherry tomato','heirloom tomato','roma tomato','tomato sliced'],

  // BODY PARTS
  hand:        ['human hand open','baby hand','hand palm','hand fingers spread','hand fist'],
  foot:        ['human foot bottom','baby foot','foot toes','bare foot','foot side view'],
  nose:        ['human nose front','nose side profile','child nose','cartoon nose drawing','nose close-up'],
  eye:         ['brown human eye','blue human eye','green human eye','child eye','eye close-up'],
  ear:         ['human ear side','baby ear','ear close-up','ear anatomy','child ear'],
  mouth:       ['smiling mouth teeth','open mouth','closed lips mouth','child mouth','mouth side view'],
  arm:         ['human arm','child arm','arm bent elbow','arm raised','forearm'],
  leg:         ['human leg standing','child leg','leg bent knee','bare leg','leg side view'],
  finger:      ['pointing finger','index finger','all five fingers','child finger','finger tip close-up'],
  shoulder:    ['human shoulder','shoulder anatomy','bare shoulder','shoulder side view','shoulder muscle'],
  knee:        ['human knee front','knee bent','knee anatomy','child knee','knee side view'],
  hair:        ['blonde hair child','brown hair','curly hair child','straight hair','red hair child'],

  // CLOTHING
  'T-shirt':   ['white t-shirt','red t-shirt','blue striped t-shirt','graphic t-shirt','yellow t-shirt'],
  trousers:    ['blue jeans','khaki pants','black trousers','gray sweatpants','cargo pants'],
  shoe:        ['white sneaker','red sandal','black oxford shoe','rain boot','slip-on shoe'],
  hat:         ['red baseball cap','winter knit hat','straw sun hat','cowboy hat','bucket hat'],
  sock:        ['white ankle sock','striped sock','knee-high sock','wool sock','colorful sock'],
  dress:       ['blue sundress','floral dress','red party dress','striped dress','polka dot dress'],
  coat:        ['red winter coat','yellow raincoat','tan trench coat','blue puffer coat','wool coat'],
  scarf:       ['red knit scarf','plaid scarf','striped scarf','colorful scarf','long winter scarf'],
  boot:        ['rubber rain boot','snow boot','brown leather boot','ankle boot','cowboy boot'],
  sweater:     ['red knit sweater','blue pullover sweater','striped sweater','cardigan sweater','turtleneck sweater'],
  backpack:    ['red school backpack','blue hiking backpack','colorful kids backpack','black backpack','mini backpack'],
  gloves:      ['winter mittens','knit gloves','rubber gloves','leather gloves','colorful gloves'],

  // OBJECTS
  chair:       ['wooden dining chair','red plastic chair','rocking chair','beanbag chair','folding chair'],
  table:       ['wooden dining table','round coffee table','plastic kids table','picnic table','school desk table'],
  cup:         ['red plastic cup','white coffee mug','ceramic teacup','clear glass cup','sippy cup'],
  spoon:       ['metal dinner spoon','wooden spoon','plastic spoon','measuring spoon','baby spoon'],
  fork:        ['metal dinner fork','plastic fork','toddler fork','serving fork','salad fork'],
  door:        ['red front door','wooden door brown','glass door','screen door','barn door'],
  bed:         ['single bed white','bunk bed children','toddler bed','crib baby bed','bed with pillows'],
  lamp:        ['white table lamp','yellow floor lamp','desk lamp blue','bedside lamp','night light lamp'],
  book:        ['open hardcover book','stack of books','children picture book','colorful books','library book'],
  ball:        ['soccer ball','basketball orange','red bouncy ball','tennis ball','beach ball'],
  pencil:      ['yellow pencil','red colored pencil','mechanical pencil','pencil set colorful','sharpened pencil'],
  scissors:    ['metal scissors','orange craft scissors','child safety scissors','kitchen scissors','small scissors'],
  key:         ['silver house key','gold key','old skeleton key','car key','key ring set'],
  telephone:   ['black desk telephone','red rotary telephone','cordless phone','toy telephone','office telephone'],
  clock:       ['round wall clock','alarm clock red','digital clock','wooden cuckoo clock','analog clock'],
  umbrella:    ['red rain umbrella','colorful polka dot umbrella','yellow umbrella','child umbrella','folding umbrella'],

  // TRANSPORT
  car:         ['red sedan car','blue minivan','yellow taxi car','green electric car','toy car red'],
  bus:         ['yellow school bus','red double decker bus','city transit bus','minibus van','toy bus yellow'],
  truck:       ['red fire truck','blue pickup truck','yellow dump truck','delivery truck white','monster truck toy'],
  airplane:    ['commercial jet airplane','small propeller airplane','red toy airplane','paper airplane','biplane airplane'],
  boat:        ['white sailboat','wooden rowboat','motorboat red','toy boat bath','canoe boat paddle'],
  bicycle:     ['red children bicycle','mountain bicycle','tricycle toddler','BMX bicycle','vintage bicycle'],
  train:       ['steam locomotive train','toy train set','passenger train','red train toy','model train'],
  motorcycle:  ['red motorcycle','dirt bike motorcycle','scooter moped','motorcycle toy','cruiser motorcycle'],
  helicopter:  ['red rescue helicopter','toy helicopter','blue helicopter','military helicopter','model helicopter'],
  tractor:     ['red farm tractor','green toy tractor','john deere tractor','small tractor','tractor field'],

  // NATURE
  sun:         ['bright sun sky','sun drawing simple','sunrise sun','sun cartoon illustration','sun rays yellow'],
  moon:        ['full moon night','crescent moon sky','moon illustration simple','moon cartoon','moon stars night'],
  cloud:       ['white fluffy cloud','dark storm cloud','cloud drawing simple','cartoon cloud','cloud blue sky'],
  tree:        ['oak tree green','pine christmas tree','apple tree fruit','palm tree beach','cartoon tree drawing'],
  flower:      ['sunflower yellow','red rose flower','white daisy','pink tulip','purple wildflower'],
  grass:       ['green grass lawn','grass blades close','grass field meadow','grass cartoon simple','fresh grass morning'],
  rock:        ['smooth gray rock','colorful pebble rocks','rock stack nature','large rock boulder','small rock collection'],
  mountain:    ['snow capped mountain','green mountain hill','mountain cartoon simple','rocky mountain peak','mountain landscape'],
  ocean:       ['ocean blue waves','ocean beach shore','calm ocean surface','ocean cartoon simple','ocean sunset'],
  rain:        ['rain drops window','rain puddle splash','rain illustration simple','rain cartoon clouds','rain storm'],
  rainbow:     ['rainbow sky clouds','rainbow cartoon colorful','double rainbow','rainbow simple illustration','rainbow nature'],
  leaf:        ['green maple leaf','autumn orange leaf','tropical large leaf','simple leaf drawing','leaf collection autumn'],
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
