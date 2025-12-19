export enum AppView {
  HOME = 'HOME',
  PHOTO_MAGIC = 'PHOTO_MAGIC',
  STORY_CREATOR = 'STORY_CREATOR',
  COLORING_BOOK = 'COLORING_BOOK',
  PUZZLES = 'PUZZLES'
}

export enum Theme {
  CHRISTMAS = 'Christmas',
  EASTER = 'Easter',
  SUMMER = 'Summer Fun',
  BIRTHDAY = 'Birthday',
  FANTASY = 'Fantasy',
  EVERYDAY = 'Everyday Fun'
}

export enum Character {
  SANTA = 'Santa',
  EASTER_BUNNY = 'Easter Bunny',
  SUPERHERO = 'Superhero',
  FAIRY = 'Fairy',
  DRAGON = 'Dragon',
  UNICORN = 'Unicorn',
  PRINCESS = 'Princess',
  KNIGHT = 'Knight',
  PIRATE = 'Pirate',
  MERMAID = 'Mermaid',
  ROBOT = 'Robot',
  DINOSAUR = 'Dinosaur',
  JUNGLE_ANIMAL = 'Jungle Animal',
  BARBIE = 'Barbie',
  SPACE_EXPLORER = 'Space Explorer',
  DISNEY_PRINCESS = 'Disney Princess',
  LEGO = 'Lego Character',
  MINECRAFT = 'Minecraft Character',
  ROBLOX = 'Roblox Character',
  MARIO = 'Super Mario',
  PAW_PATROL = 'Paw Patrol'
}

export enum Ethnicity {
  CLASSIC = 'Classic / Traditional',
  AFRICAN_AMERICAN = 'African American',
  ASIAN = 'Asian',
  HISPANIC = 'Hispanic',
  BIRACIAL = 'Biracial / Mixed',
  INDIAN = 'Indian / South Asian',
  MIDDLE_EASTERN = 'Middle Eastern'
}

export enum ArtStyle {
  REALISTIC = 'Natural/Realistic',
  VINTAGE = 'Vintage 1950s',
  PIXAR = '3D Pixar-style',
  WATERCOLOR = 'Watercolor',
  OIL_PAINTING = 'Oil Painting',
  CARTOON = 'Cartoon'
}

export enum AgeGroup {
  TODDLER = 'Toddler (2-3)',
  PRESCHOOL = 'Preschool (4-5)',
  EARLY_READER = 'Early Reader (6-8)'
}

export interface StoryPage {
  text: string;
  illustrationPrompt: string;
  image?: string; // Base64 or URL
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  type: 'photo' | 'coloring' | 'sticker';
  timestamp: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
}