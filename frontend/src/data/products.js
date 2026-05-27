// Placeholder product data — replace with API calls when backend is ready

export const PRODUCTS = [
  {
    id: '1',
    title: 'The Ultimate Notion Productivity Pack',
    creator: 'Notion Architects',
    price: '29.99',
    type: 'Template',
    category: 'Templates',
    description:
      'A comprehensive collection of Notion templates to supercharge your productivity. Includes personal dashboards, project management systems, goal trackers, and habit builders — all designed with a clean, minimal aesthetic.',
    thumbnail:
      'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&q=80',
    contents: ['Personal Dashboard', 'Project Management System', 'Goal Tracker', 'Habit Builder', 'Weekly Review Template', 'Meeting Notes Template'],
    sales: 142,
    fileSize: '2.4 MB',
    format: 'ZIP',
    downloads: 0,
  },
  {
    id: '2',
    title: 'Figma UI Kit 2025',
    creator: 'Design Systems Co.',
    price: '49.00',
    type: 'Asset',
    category: 'Templates',
    description:
      'A production-ready Figma UI Kit with 200+ components, 4 colour themes, and a comprehensive design token system. Built for modern SaaS products and marketplaces.',
    thumbnail:
      'https://images.unsplash.com/photo-1558655146-364adaf1fcc9?w=600&q=80',
    contents: ['200+ UI Components', '4 Color Themes', 'Design Token Library', 'Icon Set (500+)', 'Responsive Grids', 'Interactive Prototypes'],
    sales: 89,
    fileSize: '18.7 MB',
    format: 'Figma',
    downloads: 0,
  },
  {
    id: '3',
    title: 'Instagram Growth Masterclass',
    creator: 'Sarah Digital',
    price: '99.00',
    type: 'Course',
    category: 'Courses',
    description:
      'A step-by-step video course covering every aspect of Instagram growth — from profile optimisation and content strategy to monetisation and brand partnerships. Grow from 0 to 10k followers in 90 days.',
    thumbnail:
      'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&q=80',
    contents: ['12 Video Modules', 'Content Calendar Templates', 'Hashtag Research Guide', 'Brand Deal Playbook', 'Analytics Dashboard', 'Private Community Access'],
    sales: 203,
    fileSize: '1.2 GB',
    format: 'MP4',
    downloads: 0,
  },
  {
    id: '4',
    title: 'Financial Freedom Ebook',
    creator: 'Wealth Foundry',
    price: '14.99',
    type: 'PDF',
    category: 'Ebooks',
    description:
      'A practical guide to achieving financial independence through smart saving, investing, and side-income strategies. Written for millennials navigating high costs of living and volatile markets.',
    thumbnail:
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80',
    contents: ['200 Pages', 'Budget Spreadsheet', 'Investment Tracker', 'Side-Hustle Directory', 'Checklist Templates'],
    sales: 412,
    fileSize: '3.1 MB',
    format: 'PDF',
    downloads: 0,
  },
  {
    id: '5',
    title: 'Logo Design Templates',
    creator: 'Studio Mark',
    price: '35.00',
    type: 'Vector',
    category: 'Templates',
    description:
      'A collection of 50 professionally designed logo templates in SVG and AI formats. Each logo is fully editable and includes multiple colour variations. Perfect for startups, agencies, and freelancers.',
    thumbnail:
      'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&q=80',
    contents: ['50 Logo Templates', 'SVG + AI Formats', 'Colour Variations', 'Brand Guidelines PDF', 'Font Recommendations'],
    sales: 67,
    fileSize: '45.2 MB',
    format: 'ZIP',
    downloads: 0,
  },
  {
    id: '6',
    title: 'Social Media Strategy Guide',
    creator: 'Content King',
    price: '19.99',
    type: 'Guide',
    category: 'Ebooks',
    description:
      'The definitive guide to building a cross-platform social media presence. Covers content pillars, posting schedules, analytics interpretation, and community management across Instagram, TikTok, Twitter and LinkedIn.',
    thumbnail:
      'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=600&q=80',
    contents: ['150-page PDF Guide', 'Content Calendar (Notion)', 'Platform Cheat Sheets', 'Analytics Templates', 'Caption Swipe File'],
    sales: 178,
    fileSize: '5.8 MB',
    format: 'PDF',
    downloads: 0,
  },
]

export const CATEGORIES = ['All', 'Ebooks', 'Courses', 'Templates', 'Coaching', 'Software']

export function getProductById(id) {
  return PRODUCTS.find((p) => p.id === id)
}
