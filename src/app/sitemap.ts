import type { MetadataRoute } from 'next';

const BASE = 'https://cybersage.vercel.app';
const NOW  = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE,                    lastModified: NOW, changeFrequency: 'monthly', priority: 1.0 },
    { url: `${BASE}/#narrative`,    lastModified: NOW, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/#audit`,        lastModified: NOW, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/#bento`,        lastModified: NOW, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/#intel`,        lastModified: NOW, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/#uplink`,       lastModified: NOW, changeFrequency: 'monthly', priority: 0.7 },
  ];
}
