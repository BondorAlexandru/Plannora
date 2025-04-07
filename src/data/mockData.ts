export interface Offer {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  popular?: boolean;
}

export interface Provider {
  id: string;
  name: string;
  category: ProviderCategory;
  description: string;
  longDescription?: string;
  price: number; // Base price
  rating: number;
  image: string;
  gallery?: string[];
  offers?: Offer[];
  contactInfo?: {
    phone?: string;
    email?: string;
    website?: string;
    address?: string;
  };
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

// Helper function to get offer by ID
export function getOfferById(providerId: string, offerId: string): Offer | undefined {
  const provider = providers.find(p => p.id === providerId);
  if (!provider || !provider.offers) return undefined;
  return provider.offers.find(o => o.id === offerId);
}

export const providers: Provider[] = [
  // Venues
  {
    id: 'venue-1',
    name: 'Grand Ballroom',
    category: ProviderCategory.VENUE,
    description: 'Elegant ballroom with capacity for up to 300 guests',
    longDescription: 'Our Grand Ballroom is the perfect setting for your special event. With soaring ceilings, crystal chandeliers, and a spacious dance floor, this venue offers timeless elegance and sophistication. The space can be customized to suit your specific vision, with flexible seating arrangements and state-of-the-art lighting and sound systems.',
    price: 5000,
    rating: 4.8,
    image: 'https://images.pexels.com/photos/169190/pexels-photo-169190.jpeg?auto=compress&cs=tinysrgb&w=600',
    gallery: [
      'https://images.pexels.com/photos/3037454/pexels-photo-3037454.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/1709134/pexels-photo-1709134.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/4373896/pexels-photo-4373896.jpeg?auto=compress&cs=tinysrgb&w=600'
    ],
    offers: [
      {
        id: 'venue-1-basic',
        name: 'Basic Package',
        description: 'Venue rental for 8 hours with basic setup',
        price: 5000,
        features: [
          '8-hour venue rental',
          'Basic tables and chairs setup',
          'Cleaning service',
          'Parking for up to 100 cars'
        ]
      },
      {
        id: 'venue-1-premium',
        name: 'Premium Package',
        description: 'Full-service venue rental with enhanced amenities',
        price: 7500,
        features: [
          '10-hour venue rental',
          'Premium table settings and chairs',
          'Dedicated event coordinator',
          'Basic lighting package',
          'Bridal suite access',
          'Extended parking'
        ],
        popular: true
      },
      {
        id: 'venue-1-complete',
        name: 'Complete Experience',
        description: 'All-inclusive luxury venue experience',
        price: 10000,
        features: [
          '12-hour venue rental',
          'Luxury tables, linens, and chiavari chairs',
          'Custom floor plan design',
          'Advanced lighting package',
          'Bridal and groom suite access',
          'Complimentary champagne toast',
          'Security personnel',
          'Valet parking'
        ]
      }
    ],
    contactInfo: {
      phone: '(555) 123-4567',
      email: 'events@grandballroom.com',
      website: 'www.grandballroom.com',
      address: '123 Elegant Avenue, Cityville'
    }
  },
  {
    id: 'venue-2',
    name: 'Seaside Resort',
    category: ProviderCategory.VENUE,
    description: 'Beautiful beachfront venue with stunning ocean views',
    longDescription: 'Experience the magic of a beachfront celebration at our exclusive Seaside Resort. With panoramic ocean views, pristine sandy beaches, and breathtaking sunsets, our venue offers a romantic and unforgettable setting for your special day. The sound of gentle waves creates a natural soundtrack for your event, while our experienced staff ensures every detail is perfect.',
    price: 7500,
    rating: 4.9,
    image: 'https://images.pexels.com/photos/1179156/pexels-photo-1179156.jpeg?auto=compress&cs=tinysrgb&w=600',
    gallery: [
      'https://images.pexels.com/photos/1024967/pexels-photo-1024967.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=600'
    ],
    offers: [
      {
        id: 'venue-2-basic',
        name: 'Beach Ceremony',
        description: 'Intimate beach ceremony setup',
        price: 5000,
        features: [
          'Beachfront ceremony setup',
          'White garden chairs',
          'Bamboo arch',
          'Sound system for ceremony',
          '2-hour rental'
        ]
      },
      {
        id: 'venue-2-premium',
        name: 'Seaside Celebration',
        description: 'Ceremony and reception package',
        price: 8500,
        features: [
          'Beachfront ceremony setup',
          'Reception in oceanview pavilion',
          'Tables and chairs with linens',
          'Basic decoration package',
          'Sound system',
          '6-hour rental'
        ],
        popular: true
      },
      {
        id: 'venue-2-complete',
        name: 'Resort Buyout',
        description: 'Exclusive use of entire resort facilities',
        price: 15000,
        features: [
          'Exclusive access to entire resort',
          'Multiple ceremony and reception locations',
          'Luxury accommodation for couple',
          'Beach and garden photo locations',
          'Custom setup and decoration',
          'Full-day rental'
        ]
      }
    ]
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
    longDescription: 'Gourmet Delights brings the restaurant experience to your event with our team of professional chefs and servers. We specialize in creating customized menus that combine international flavors with local ingredients. Our presentation is as exquisite as our taste, ensuring your guests receive a truly memorable dining experience.',
    price: 85,
    rating: 4.7,
    image: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=600',
    gallery: [
      'https://images.pexels.com/photos/5695880/pexels-photo-5695880.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/541216/pexels-photo-541216.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/760681/pexels-photo-760681.jpeg?auto=compress&cs=tinysrgb&w=600'
    ],
    offers: [
      {
        id: 'catering-1-basic',
        name: 'Classic Menu',
        description: 'Traditional three-course plated dinner',
        price: 75,
        features: [
          'Choice of 2 appetizers',
          'Choice of 3 main courses',
          'Classic dessert selection',
          'Coffee and tea service',
          'Professional serving staff'
        ]
      },
      {
        id: 'catering-1-premium',
        name: 'Gourmet Experience',
        description: 'Premium four-course plated dinner',
        price: 95,
        features: [
          'Selection of passed hors d\'oeuvres',
          'Gourmet appetizer course',
          'Premium entrée options',
          'Artisanal dessert station',
          'Wine pairing recommendations',
          'Full service staff'
        ],
        popular: true
      },
      {
        id: 'catering-1-buffet',
        name: 'International Buffet',
        description: 'Global cuisine stations',
        price: 85,
        features: [
          'Multiple cuisine stations',
          'Carving station',
          'Made-to-order pasta station',
          'Dessert display',
          'Nonalcoholic beverage package',
          'Staffed service'
        ]
      },
      {
        id: 'catering-1-cocktail',
        name: 'Cocktail Reception',
        description: 'Elegant passed appetizers and stations',
        price: 65,
        features: [
          'Selection of 8 passed hors d\'oeuvres',
          '2 food stations',
          'Dessert bites',
          'Professional serving staff',
          'Chef attendant'
        ]
      }
    ],
    contactInfo: {
      phone: '(555) 987-6543',
      email: 'events@gourmetdelights.com',
      website: 'www.gourmetdelights.com'
    }
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