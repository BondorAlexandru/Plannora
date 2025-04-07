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
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  },
  {
    id: 'venue-2',
    name: 'Seaside Resort',
    category: ProviderCategory.VENUE,
    description: 'Beautiful beachfront venue with stunning ocean views',
    price: 7500,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1439539698758-ba2680ecadb9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  },
  {
    id: 'venue-3',
    name: 'Urban Loft',
    category: ProviderCategory.VENUE,
    description: 'Modern industrial space in the heart of downtown',
    price: 3500,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  },
  
  // Catering
  {
    id: 'catering-1',
    name: 'Gourmet Delights',
    category: ProviderCategory.CATERING,
    description: 'Fine dining experience with international cuisine options',
    price: 85,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1555244162-803834f70033?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  },
  {
    id: 'catering-2',
    name: 'Comfort Cuisine',
    category: ProviderCategory.CATERING,
    description: 'Homestyle favorites with a gourmet twist',
    price: 65,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  },
  {
    id: 'catering-3',
    name: 'Global Tastes',
    category: ProviderCategory.CATERING,
    description: 'Fusion cuisine featuring dishes from around the world',
    price: 75,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  },
  
  // Music
  {
    id: 'music-1',
    name: 'Classic Strings Quartet',
    category: ProviderCategory.MUSIC,
    description: 'Elegant classical music performed by professional musicians',
    price: 1200,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1465471759010-b9f5ea5ca2c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  },
  {
    id: 'music-2',
    name: 'Party Rockers Band',
    category: ProviderCategory.MUSIC,
    description: 'High-energy band covering top hits from all decades',
    price: 2500,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1501612780327-45045538702b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  },
  {
    id: 'music-3',
    name: 'DJ Mixtape',
    category: ProviderCategory.MUSIC,
    description: 'Professional DJ with state-of-the-art equipment',
    price: 1000,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1571266752264-ac3598b8a6c7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  },
  
  // Photography
  {
    id: 'photo-1',
    name: 'Moment Capturers',
    category: ProviderCategory.PHOTOGRAPHY,
    description: 'Award-winning photography team specializing in candid moments',
    price: 2200,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  },
  {
    id: 'photo-2',
    name: 'Visual Storytellers',
    category: ProviderCategory.PHOTOGRAPHY,
    description: 'Photography and videography package with drone footage',
    price: 3000,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1557106577-5399664f6e24?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  },
  
  // Decoration
  {
    id: 'decor-1',
    name: 'Elegant Arrangements',
    category: ProviderCategory.DECORATION,
    description: 'Sophisticated décor tailored to your event theme',
    price: 1800,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1478146059778-26028b07395a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  },
  {
    id: 'decor-2',
    name: 'Whimsical Designs',
    category: ProviderCategory.DECORATION,
    description: 'Creative and playful decorations for a memorable event',
    price: 1500,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1464699788549-dd2f27efb73d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
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
    image: 'https://images.unsplash.com/photo-1513311068348-19c8fbdc0bb6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  },
  
  // Lighting
  {
    id: 'light-1',
    name: 'Ambient Illumination',
    category: ProviderCategory.LIGHTING,
    description: 'Customized lighting design to enhance your event atmosphere',
    price: 1200,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1545972154-9bb223aac798?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  },
  {
    id: 'light-2',
    name: 'Dynamic Light Show',
    category: ProviderCategory.LIGHTING,
    description: 'Synchronized lighting effects for an unforgettable experience',
    price: 1800,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1519608425089-7f3bfa6f6bb8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  },
  
  // Entertainment
  {
    id: 'entertain-1',
    name: 'Magic Moments',
    category: ProviderCategory.ENTERTAINMENT,
    description: 'Close-up magician to amaze and entertain your guests',
    price: 950,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1620410523244-b9a8220bff88?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  },
  {
    id: 'entertain-2',
    name: 'Carnival Fun',
    category: ProviderCategory.ENTERTAINMENT,
    description: 'Interactive games and activities for all ages',
    price: 1500,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1534364432531-5696aa975d4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  },
  
  // Flowers
  {
    id: 'flowers-1',
    name: 'Blossoming Beauty',
    category: ProviderCategory.FLOWERS,
    description: 'Custom floral arrangements designed for your specific event',
    price: 1400,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1562690868-60bbe7293e94?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  },
  {
    id: 'flowers-2',
    name: 'Natural Elegance',
    category: ProviderCategory.FLOWERS,
    description: 'Seasonal flowers arranged with a modern aesthetic',
    price: 1100,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  },
]; 