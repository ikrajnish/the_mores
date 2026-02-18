import { MetadataRoute } from 'next';
import dbConnect from '@/lib/db';
import ServiceCategory from '@/models/ServiceCategory';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://themores.com';
  
  // Static Routes
  const routes = [
    '',
    '/services',
    '/gallery',
    '/products',
    '/memberships',
    '/book',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Dynamic Routes from DB
  let categoryRoutes: MetadataRoute.Sitemap = [];
  try {
    await dbConnect();
    const categories = await ServiceCategory.find({}).select('name updatedAt').lean();
    
    categoryRoutes = categories.map((cat: any) => ({
      url: `${baseUrl}/services?category=${encodeURIComponent(cat.name)}`,
      lastModified: new Date(cat.updatedAt || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.warn('Sitemap generation: Could not fetch dynamic routes', error);
  }

  return [...routes, ...categoryRoutes];
}
