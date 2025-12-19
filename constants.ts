import { Character, Ethnicity, ArtStyle, AgeGroup, Theme } from './types';

export const THEMES_DATA = [
  { id: Theme.CHRISTMAS, icon: '🎄', label: 'Christmas', description: 'Festive holiday magic' },
  { id: Theme.EASTER, icon: '🐰', label: 'Easter', description: 'Spring celebration' },
  { id: Theme.SUMMER, icon: '🏖️', label: 'Summer Fun', description: 'Beach & adventure' },
  { id: Theme.BIRTHDAY, icon: '🎉', label: 'Birthday', description: 'Party celebration' },
  { id: Theme.FANTASY, icon: '✨', label: 'Fantasy', description: 'Magical worlds' },
  { id: Theme.EVERYDAY, icon: '🎈', label: 'Everyday Fun', description: 'Daily joy & play' },
];

export const CHARACTER_LOCATIONS: Record<Character, string[]> = {
  [Character.SANTA]: ['Workshop with elves', 'Sleigh with reindeer', 'Fireplace with tree', 'Snow cabin'],
  [Character.EASTER_BUNNY]: ['Spring meadow', 'Egg hunt garden', 'Bunny warren', 'Basket workshop'],
  [Character.SUPERHERO]: ['City skyline', 'HQ', 'Flying through clouds', 'Saving the day'],
  [Character.FAIRY]: ['Enchanted forest', 'Fairy garden', 'Mushroom circle', 'Starlit castle'],
  [Character.DRAGON]: ['Mountain cave treasure', 'Flying over castle', 'Training grounds'],
  [Character.UNICORN]: ['Rainbow meadow', 'Castle grounds', 'Magical forest', 'Cloud kingdom'],
  [Character.PRINCESS]: ['Ballroom', 'Royal garden', 'Throne room', 'Tower balcony'],
  [Character.KNIGHT]: ['Castle courtyard', 'Dragon quest', 'Tournament', 'Medieval village'],
  [Character.PIRATE]: ['Ship deck', 'Treasure island', 'Secret cove', 'Shipwreck'],
  [Character.MERMAID]: ['Coral reef', 'Grotto palace', 'Ocean rock', 'Sunken treasure'],
  [Character.ROBOT]: ['Futuristic lab', 'Space station', 'Robot factory', 'Cyber city'],
  [Character.DINOSAUR]: ['Jurassic jungle', 'Volcano', 'Prehistoric swamp', 'Nest'],
  [Character.JUNGLE_ANIMAL]: ['Rainforest', 'Treehouse', 'Safari', 'Waterfall'],
  [Character.BARBIE]: ['Dreamhouse', 'Fashion Runway', 'Pink Convertible', 'Malibu Beach'],
  [Character.SPACE_EXPLORER]: ['Moon Base', 'Rocket Ship', 'Alien Planet', 'Space Station'],
  [Character.DISNEY_PRINCESS]: ['Magic Castle', 'Enchanted Garden', 'Royal Ballroom', 'Wishing Well'],
  [Character.LEGO]: ['Lego City', 'Brick Castle', 'Construction Site', 'Lego Park'],
  [Character.MINECRAFT]: ['Block World', 'Diamond Mine', 'Village', 'Nether Portal'],
  [Character.ROBLOX]: ['Obby Course', 'Blox City', 'Pet World', 'Theme Park'],
  [Character.MARIO]: ['Mushroom Kingdom', 'Rainbow Road', 'Peach\'s Castle', 'Pipe World'],
  [Character.PAW_PATROL]: ['Lookout Tower', 'Adventure Bay', 'Fire Station', 'Jungle Rescue'],
};

export const CHARACTER_POSES: Record<Character, string[]> = {
  [Character.SANTA]: ['Reading wish list', 'High-five', 'Sitting on lap', 'Decorating tree'],
  [Character.SUPERHERO]: ['Flying together', 'Power pose', 'High-five', 'Team-up stance'],
  [Character.PRINCESS]: ['Royal wave', 'Dancing at ball', 'Crown ceremony', 'Tea party'],
  [Character.EASTER_BUNNY]: ['Holding basket', 'Painting eggs', 'Hiding behind bush', 'Jumping'],
  [Character.FAIRY]: ['Casting spell', 'Flying', 'Sitting on flower', 'Waving wand'],
  [Character.DRAGON]: ['Roaring', 'Flying', 'Sleeping', 'Guarding treasure'],
  [Character.UNICORN]: ['Galloping', 'Rearing', 'Grazing', 'Magic sparkle'],
  [Character.KNIGHT]: ['Sword salute', 'Riding horse', 'Guarding', 'Kneeling'],
  [Character.PIRATE]: ['Looking through telescope', 'Holding map', 'Sword fight', 'Digging'],
  [Character.MERMAID]: ['Swimming', 'Sitting on rock', 'Playing harp', 'Talking to fish'],
  [Character.ROBOT]: ['Scanning', 'Building', 'Processing', 'Hovering'],
  [Character.DINOSAUR]: ['Roaring', 'Stomping', 'Eating leaves', 'Running'],
  [Character.JUNGLE_ANIMAL]: ['Climbing', 'Running', 'Sleeping', 'Playing'],
  [Character.BARBIE]: ['Strike a pose', 'Waving', 'Holding shopping bags', 'Petting dog'],
  [Character.SPACE_EXPLORER]: ['Floating in zero-g', 'Planting flag', 'Saluting', 'Looking at stars'],
  [Character.DISNEY_PRINCESS]: ['Singing with birds', 'Dancing', 'Holding flower', 'Curtsy'],
  [Character.LEGO]: ['Building', 'Standing stiff', 'Waving', 'Holding tool'],
  [Character.MINECRAFT]: ['Mining', 'Holding sword', 'Building block', 'Taming wolf'],
  [Character.ROBLOX]: ['Jumping', 'Dancing', 'Waving', 'Running'],
  [Character.MARIO]: ['Jumping punch', 'Peace sign', 'Running', 'Driving kart'],
  [Character.PAW_PATROL]: ['On the case', 'Sliding down', 'High paw', 'Sitting good'],
};

export const CHARACTERS_LIST = Object.values(Character);
export const ETHNICITIES_LIST = Object.values(Ethnicity);
export const ART_STYLES_LIST = Object.values(ArtStyle);
export const AGE_GROUPS_LIST = Object.values(AgeGroup);