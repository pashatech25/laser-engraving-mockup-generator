# Laser Engraving Mockup Generator

A React/Vite web application for creating laser engraving mockups with text layers and image positioning.

## Features

- **Product Management**: Add products with mockup images and engraving boundaries
- **Image Processing**: Convert uploaded images to black & white with surface tone options
- **Design Editor**: Position images and add text layers within engraving boundaries
- **Text Layers**: Add, edit, and style text with fonts, sizes, colors, and effects
- **Mockup Generation**: Create complete mockups with user designs
- **Admin Panel**: Manage products, orders, and download assets
- **Supabase Database**: Cloud-based data persistence

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Supabase Database Setup

1. **Create a Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Create Database Tables**:

Run these SQL commands in your Supabase SQL editor:

```sql
-- Products table
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  images TEXT[] NOT NULL,
  surfaceTone TEXT NOT NULL CHECK (surfaceTone IN ('light', 'dark')),
  mockupImage TEXT NOT NULL,
  engravingBoundary JSONB NOT NULL,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Jobs table
CREATE TABLE jobs (
  id TEXT PRIMARY KEY,
  customerName TEXT NOT NULL,
  customerEmail TEXT NOT NULL,
  customerPhone TEXT NOT NULL,
  product JSONB NOT NULL,
  uploadedImage TEXT NOT NULL,
  processedImage TEXT NOT NULL,
  mockupImage TEXT NOT NULL,
  imagePosition JSONB NOT NULL,
  textLayers JSONB NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (optional)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust as needed)
CREATE POLICY "Allow public read access to products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public insert to jobs" ON jobs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read access to jobs" ON jobs FOR SELECT USING (true);
```

3. **Environment Variables**:

Create a `.env.local` file in your project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3. Run the Application

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Usage

### For Users

1. **Select Product**: Choose from available products
2. **Upload Image**: Upload an image for engraving
3. **Design**: Position your image and add text layers within the engraving boundary
4. **Submit Order**: Fill out contact information and submit

### For Admins

1. **Login**: Access admin panel with admin credentials
2. **Manage Products**: Add/edit products with mockup images and boundaries
3. **View Orders**: See all submitted jobs
4. **Download Assets**: Download original images, processed images, mockups, and text as SVG

## Technical Details

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **State Management**: React Context + Supabase real-time
- **Image Processing**: HTML5 Canvas API
- **Text Rendering**: SVG generation for vector downloads

## File Structure

```
src/
├── components/
│   ├── admin/          # Admin panel components
│   ├── ui/             # Reusable UI components
│   └── ...             # Main app components
├── contexts/            # React context providers
├── lib/                 # External library configurations
├── pages/               # Main page components
├── types/               # TypeScript type definitions
└── utils/               # Utility functions
```

## Database Schema

### Products Table
- `id`: Unique identifier
- `name`: Product name
- `description`: Product description
- `price`: Product price
- `images`: Array of product image URLs
- `surfaceTone`: Light or dark surface
- `mockupImage`: Mockup image URL
- `engravingBoundary`: JSON with x, y, width, height percentages
- `createdAt`: Creation timestamp

### Jobs Table
- `id`: Unique identifier
- `customerName`: Customer's name
- `customerEmail`: Customer's email
- `customerPhone`: Customer's phone
- `product`: JSON object of the selected product
- `uploadedImage`: Original uploaded image URL
- `processedImage`: Processed black & white image URL
- `mockupImage`: Final mockup with design URL
- `imagePosition`: JSON with x, y, scale, rotation
- `textLayers`: Array of text layer objects
- `status`: Order status
- `createdAt`: Creation timestamp

## Troubleshooting

### Common Issues

1. **Supabase Connection Error**: Check your environment variables
2. **Build Errors**: Ensure all dependencies are installed
3. **Image Upload Issues**: Check file size and format
4. **Canvas Rendering**: Ensure browser supports HTML5 Canvas

### Development

- Use `npm run dev` for development
- Use `npm run build` to build for production
- Check browser console for errors
- Verify Supabase connection in Network tab

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
