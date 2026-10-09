export interface SampleImage {
  id: string;
  title: string;
  description: string;
  category: string;
  url: string;
}

export const SAMPLE_IMAGES: SampleImage[] = [
  {
    id: 'workspace',
    title: 'Modern Workspace Desk',
    description: 'Contains laptop, computer mouse, coffee cup, and chair',
    category: 'Office & Tech',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'living-room',
    title: 'Living Room with Dog',
    description: 'Contains dog, couch, chair, and potted plant',
    category: 'Home & Pets',
    url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'city-street',
    title: 'Urban Street Traffic',
    description: 'Contains cars, pedestrians, traffic lights, and bicycle',
    category: 'Urban & Transport',
    url: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'coffee-table',
    title: 'Cafe Table Setup',
    description: 'Contains cup, bottle, book, and cell phone',
    category: 'Still Life',
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
  }
];
