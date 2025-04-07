export interface Provider {
  id: string;
  name: string;
  category: ProviderCategory;
  description: string;
  price: number;
  rating: number;
  image: string;
}

export enum ProviderCategory {
  VENUE = 'Venue',
  CATERING = 'Catering',
  MUSIC = 'Music',
  PHOTOGRAPHY = 'Photography',
  DECORATION = 'Decoration',
  TRANSPORTATION = 'Transportation',
  LIGHTING = 'Lighting',
  ENTERTAINMENT = 'Entertainment',
  FLOWERS = 'Flowers',
}

export const providers: Provider[] = [
  // Venues
  {
    id: 'venue-1',
    name: 'Grand Ballroom',
    category: ProviderCategory.VENUE,
    description: 'Elegant ballroom with capacity for up to 300 guests',
    price: 5000,
    rating: 4.8,
    image: 'https://images.pexels.com/photos/169190/pexels-photo-169190.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 'venue-2',
    name: 'Seaside Resort',
    category: ProviderCategory.VENUE,
    description: 'Beautiful beachfront venue with stunning ocean views',
    price: 7500,
    rating: 4.9,
    image: 'https://images.pexels.com/photos/1179156/pexels-photo-1179156.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 'venue-3',
    name: 'Urban Loft',
    category: ProviderCategory.VENUE,
    description: 'Modern industrial space in the heart of downtown',
    price: 3500,
    rating: 4.6,
    image: 'https://images.pexels.com/photos/1170412/pexels-photo-1170412.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  
  // Catering
  {
    id: 'catering-1',
    name: 'Gourmet Delights',
    category: ProviderCategory.CATERING,
    description: 'Fine dining experience with international cuisine options',
    price: 85,
    rating: 4.7,
    image: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 'catering-2',
    name: 'Comfort Cuisine',
    category: ProviderCategory.CATERING,
    description: 'Homestyle favorites with a gourmet twist',
    price: 65,
    rating: 4.5,
    image: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 'catering-3',
    name: 'Global Tastes',
    category: ProviderCategory.CATERING,
    description: 'Fusion cuisine featuring dishes from around the world',
    price: 75,
    rating: 4.6,
    image: 'https://images.pexels.com/photos/5175537/pexels-photo-5175537.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  
  // Music
  {
    id: 'music-1',
    name: 'Classic Strings Quartet',
    category: ProviderCategory.MUSIC,
    description: 'Elegant classical music performed by professional musicians',
    price: 1200,
    rating: 4.8,
    image: 'https://images.pexels.com/photos/111287/pexels-photo-111287.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 'music-2',
    name: 'Party Rockers Band',
    category: ProviderCategory.MUSIC,
    description: 'High-energy band covering top hits from all decades',
    price: 2500,
    rating: 4.9,
    image: 'https://images.pexels.com/photos/2444860/pexels-photo-2444860.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 'music-3',
    name: 'DJ Mixtape',
    category: ProviderCategory.MUSIC,
    description: 'Professional DJ with state-of-the-art equipment',
    price: 1000,
    rating: 4.7,
    image: 'https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  
  // Photography
  {
    id: 'photo-1',
    name: 'Moment Capturers',
    category: ProviderCategory.PHOTOGRAPHY,
    description: 'Award-winning photography team specializing in candid moments',
    price: 2200,
    rating: 4.8,
    image: 'https://images.pexels.com/photos/3379943/pexels-photo-3379943.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 'photo-2',
    name: 'Visual Storytellers',
    category: ProviderCategory.PHOTOGRAPHY,
    description: 'Photography and videography package with drone footage',
    price: 3000,
    rating: 4.9,
    image: 'https://images.pexels.com/photos/212372/pexels-photo-212372.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  
  // Decoration
  {
    id: 'decor-1',
    name: 'Elegant Arrangements',
    category: ProviderCategory.DECORATION,
    description: 'Sophisticated décor tailored to your event theme',
    price: 1800,
    rating: 4.7,
    image: 'https://images.pexels.com/photos/1616113/pexels-photo-1616113.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 'decor-2',
    name: 'Whimsical Designs',
    category: ProviderCategory.DECORATION,
    description: 'Creative and playful decorations for a memorable event',
    price: 1500,
    rating: 4.6,
    image: 'https://images.pexels.com/photos/6044227/pexels-photo-6044227.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  
  // Transportation
  {
    id: 'transport-1',
    name: 'Luxury Limos',
    category: ProviderCategory.TRANSPORTATION,
    description: 'Fleet of luxury vehicles with professional chauffeurs',
    price: 800,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1515876305430-f06edab8282a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  },
  {
    id: 'transport-2',
    name: 'Vintage Wheels',
    category: ProviderCategory.TRANSPORTATION,
    description: 'Classic cars for a timeless entrance and exit',
    price: 1200,
    rating: 4.8,
    image: 'https://images.pexels.com/photos/4037050/pexels-photo-4037050.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  
  // Lighting
  {
    id: 'light-1',
    name: 'Ambient Illumination',
    category: ProviderCategory.LIGHTING,
    description: 'Customized lighting design to enhance your event atmosphere',
    price: 1200,
    rating: 4.7,
    image: 'https://images.pexels.com/photos/2121799/pexels-photo-2121799.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 'light-2',
    name: 'Dynamic Light Show',
    category: ProviderCategory.LIGHTING,
    description: 'Synchronized lighting effects for an unforgettable experience',
    price: 1800,
    rating: 4.9,
    image: 'https://images.pexels.com/photos/1549326/pexels-photo-1549326.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  
  // Entertainment
  {
    id: 'entertain-1',
    name: 'Magic Moments',
    category: ProviderCategory.ENTERTAINMENT,
    description: 'Close-up magician to amaze and entertain your guests',
    price: 950,
    rating: 4.8,
    image: 'https://images.pexels.com/photos/9857215/pexels-photo-9857215.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 'entertain-2',
    name: 'Carnival Fun',
    category: ProviderCategory.ENTERTAINMENT,
    description: 'Interactive games and activities for all ages',
    price: 1500,
    rating: 4.6,
    image: 'https://images.pexels.com/photos/2701570/pexels-photo-2701570.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  
  // Flowers
  {
    id: 'flowers-1',
    name: 'Blossoming Beauty',
    category: ProviderCategory.FLOWERS,
    description: 'Custom floral arrangements designed for your specific event',
    price: 1400,
    rating: 4.9,
    image: 'https://images.pexels.com/photos/2303781/pexels-photo-2303781.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 'flowers-2',
    name: 'Natural Elegance',
    category: ProviderCategory.FLOWERS,
    description: 'Seasonal flowers arranged with a modern aesthetic',
    price: 1100,
    rating: 4.7,
    image: 'https://images.pexels.com/photos/6913636/pexels-photo-6913636.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
]; 