export interface JobType {
  id: string;
  name: string;
  basePrice: number;
  serviceCharge: number;
}

export interface Subcategory {
  id: string;
  name: string;
  jobs: JobType[];
}

export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  subcategories: Subcategory[];
}

export const CATEGORIES: ServiceCategory[] = [
  {
    id: 'queue',
    name: 'Queue Holding',
    icon: '⏳',
    color: '#8B5CF6',
    subcategories: [
      {
        id: 'govt',
        name: 'Government Services',
        jobs: [
          { id: 'passport', name: 'Passport office queue', basePrice: 150, serviceCharge: 30 },
        ],
      },
      {
        id: 'banking',
        name: 'Banking',
        jobs: [
          { id: 'bank_queue', name: 'Bank queue', basePrice: 100, serviceCharge: 20 },
        ],
      },
      {
        id: 'healthcare_q',
        name: 'Healthcare',
        jobs: [
          { id: 'hospital_q', name: 'Hospital queue', basePrice: 120, serviceCharge: 25 },
        ],
      },
    ],
  },
  {
    id: 'delivery',
    name: 'Delivery',
    icon: '📦',
    color: '#F59E0B',
    subcategories: [
      {
        id: 'docs',
        name: 'Documents',
        jobs: [
          { id: 'doc_delivery', name: 'Document delivery', basePrice: 200, serviceCharge: 40 },
        ],
      },
      {
        id: 'parcels',
        name: 'Parcels',
        jobs: [
          { id: 'parcel_delivery', name: 'Parcel delivery', basePrice: 250, serviceCharge: 50 },
        ],
      },
      {
        id: 'shopping_pu',
        name: 'Shopping Pickup',
        jobs: [
          { id: 'store_pu', name: 'Store pickup', basePrice: 180, serviceCharge: 35 },
        ],
      },
    ],
  },
  {
    id: 'home_help',
    name: 'Home Help',
    icon: '🏠',
    color: '#10B981',
    subcategories: [
      {
        id: 'cleaning',
        name: 'Cleaning',
        jobs: [
          { id: 'apt_clean', name: 'Apartment cleaning', basePrice: 500, serviceCharge: 75 },
          { id: 'car_wash', name: 'Car wash', basePrice: 300, serviceCharge: 50 },
        ],
      },
      {
        id: 'laundry',
        name: 'Laundry',
        jobs: [
          { id: 'laundry_help', name: 'Laundry help', basePrice: 200, serviceCharge: 35 },
          { id: 'shoe_clean', name: 'Shoe cleaning', basePrice: 120, serviceCharge: 25 },
        ],
      },
      {
        id: 'moving',
        name: 'Moving',
        jobs: [
          { id: 'furniture_move', name: 'Furniture moving help', basePrice: 600, serviceCharge: 90 },
        ],
      },
      {
        id: 'electrical',
        name: 'Electrical',
        jobs: [
          { id: 'socket_repair', name: 'Socket repair', basePrice: 350, serviceCharge: 60 },
          { id: 'light_install', name: 'Light fixture installation', basePrice: 300, serviceCharge: 50 },
          { id: 'circuit_check', name: 'Circuit breaker check', basePrice: 400, serviceCharge: 65 },
          { id: 'stove_fix', name: 'Stove fix', basePrice: 450, serviceCharge: 70 },
          { id: 'boiler_fix', name: 'Boiler fix', basePrice: 500, serviceCharge: 75 },
          { id: 'washing_clean', name: 'Washing machine cleaning', basePrice: 400, serviceCharge: 65 },
        ],
      },
      {
        id: 'plumbing',
        name: 'Plumbing',
        jobs: [
          { id: 'pipe_leak', name: 'Pipe leak repair', basePrice: 400, serviceCharge: 65 },
          { id: 'sink_unclog', name: 'Sink unclogging', basePrice: 300, serviceCharge: 50 },
          { id: 'toilet_repair', name: 'Toilet repair', basePrice: 350, serviceCharge: 60 },
        ],
      },
      {
        id: 'gardening',
        name: 'Gardening',
        jobs: [
          { id: 'lone_morning', name: 'Lone morning', basePrice: 250, serviceCharge: 45 },
          { id: 'tree_cutting', name: 'Tree cutting', basePrice: 450, serviceCharge: 70 },
        ],
      },
      {
        id: 'cook',
        name: 'Cook',
        jobs: [
          { id: 'food_cook', name: 'Food cook', basePrice: 400, serviceCharge: 65 },
          { id: 'injera_cook', name: 'Injera and bread cook', basePrice: 350, serviceCharge: 60 },
        ],
      },
    ],
  },
  {
    id: 'care',
    name: 'Care Support',
    icon: '❤️',
    color: '#EC4899',
    subcategories: [
      {
        id: 'medical',
        name: 'Medical Support',
        jobs: [
          { id: 'clinic_accomp', name: 'Clinic accompaniment', basePrice: 300, serviceCharge: 50 },
        ],
      },
      {
        id: 'family',
        name: 'Family Support',
        jobs: [
          { id: 'school_pu', name: 'School pickup support', basePrice: 200, serviceCharge: 40 },
        ],
      },
      {
        id: 'elder',
        name: 'Elder Care',
        jobs: [
          { id: 'elder_visit', name: 'Elder assistance visit', basePrice: 350, serviceCharge: 60 },
        ],
      },
    ],
  },
  {
    id: 'errands',
    name: 'Errands',
    icon: '🛍️',
    color: '#F97316',
    subcategories: [
      {
        id: 'shopping',
        name: 'Shopping',
        jobs: [
          { id: 'grocery', name: 'Grocery shopping', basePrice: 250, serviceCharge: 45 },
        ],
      },
      {
        id: 'health_errand',
        name: 'Health',
        jobs: [
          { id: 'pharmacy', name: 'Pharmacy run', basePrice: 150, serviceCharge: 30 },
        ],
      },
      {
        id: 'bills',
        name: 'Bills & Admin',
        jobs: [
          { id: 'utility_pay', name: 'Utility payment errand', basePrice: 100, serviceCharge: 25 },
        ],
      },
    ],
  },
  {
    id: 'vehicle',
    name: 'Vehicle Aid',
    icon: '🚗',
    color: '#6366F1',
    subcategories: [
      {
        id: 'tow',
        name: 'Tow Truck',
        jobs: [
          { id: 'tow_truck', name: 'Tow truck', basePrice: 800, serviceCharge: 120 },
        ],
      },
      {
        id: 'car_rental',
        name: 'Car Rental',
        jobs: [
          { id: 'car_rent', name: 'Car rental', basePrice: 1200, serviceCharge: 150 },
        ],
      },
      {
        id: 'moving_truck',
        name: 'Moving Truck',
        jobs: [
          { id: 'moving_t', name: 'Moving truck', basePrice: 1000, serviceCharge: 130 },
        ],
      },
    ],
  },
];

export function getCategoryById(id: string): ServiceCategory | undefined {
  return CATEGORIES.find(c => c.id === id);
}

export function getSubcategoryById(categoryId: string, subcategoryId: string): Subcategory | undefined {
  const cat = getCategoryById(categoryId);
  return cat?.subcategories.find(s => s.id === subcategoryId);
}

export function getJobById(categoryId: string, subcategoryId: string, jobId: string): JobType | undefined {
  const sub = getSubcategoryById(categoryId, subcategoryId);
  return sub?.jobs.find(j => j.id === jobId);
}
