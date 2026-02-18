

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface GalleryImage {
  id: string | number;
  title?: string;
  src?: string;
  alt: string;
  url?: string;
}

interface GalleryProps {
  images?: GalleryImage[];
}

export default function Gallery({ images: initialImages }: GalleryProps) {
  const [images, setImages] = useState<GalleryImage[]>(initialImages || []);
  const [loading, setLoading] = useState(!initialImages);

  // Default gallery images as fallback
  const defaultImages = [
    { id: '1', title: 'McLaren 570S', url: '/images/gallery/component1.jpg', alt: 'McLaren 570S' },
    { id: '2', title: 'Ferrari SF90', url: '/images/gallery/component2.jpg', alt: 'Ferrari SF90' },
    { id: '3', title: 'Porsche 911 GT3', url: '/images/gallery/component3.jpg', alt: 'Porsche 911 GT3' },
    { id: '4', title: 'Lamborghini Urus', url: '/images/gallery/component4.jpg', alt: 'Lamborghini Urus' },
    { id: '5', title: 'Rolls Royce Cullinan', url: '/images/gallery/component5.jpg', alt: 'Rolls Royce Cullinan' },
    { id: '6', title: 'Aston Martin DBX', url: '/images/gallery/component6.jpg', alt: 'Aston Martin DBX' },
    { id: '7', title: 'BMW X7', url: '/images/gallery/component7.jpg', alt: 'BMW X7' },
    { id: '8', title: 'Range Rover', url: '/images/gallery/component8.jpg', alt: 'Range Rover' },
    { id: '9', title: 'Bentley Flying Spur', url: '/images/gallery/component9.jpg', alt: 'Bentley Flying Spur' },
    { id: '10', title: 'Audi Q8', url: '/images/gallery/component10.jpg', alt: 'Audi Q8' },
    { id: '11', title: 'Lexus RX', url: '/images/gallery/component11.jpg', alt: 'Lexus RX' },
    { id: '12', title: 'BMW M8', url: '/images/gallery/component12.jpg', alt: 'BMW M8' }
  ];

  useEffect(() => {
    const fetchGalleryImages = async () => {
      try {
        const response = await fetch('/api/admin/gallery');
        if (response.ok) {
          const data = await response.json();
          // Use database images if available, otherwise use defaults
          const displayImages = data.length > 0 ? data : defaultImages;
          setImages(displayImages);
        } else {
          setImages(defaultImages);
        }
      } catch (error) {
        console.error('Error fetching gallery images:', error);
        // Fallback to default images on error
        setImages(defaultImages);
      } finally {
        setLoading(false);
      }
    };

    if (!initialImages) {
      fetchGalleryImages();
    }
  }, [initialImages]);

  // Use provided images or fetched images or defaults
  const displayImages = (images || defaultImages).slice(0, 12);

  if (loading) {
    return (
      <section className="w-full bg-white pt-24 pb-36">
        <div className="max-w-[1240px] mx-auto px-4">
          <h2 className="text-6xl font-semibold mb-6 text-black">GALLERY</h2>
          <div className="text-center py-12 text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p>Loading gallery...</p>
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section className="w-full bg-white pt-24 pb-36">
      <div className="max-w-[1240px] mx-auto px-4">
        <h2 className="text-6xl font-semibold mb-6 text-black">GALLERY</h2>
      
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {displayImages.map((image) => {
          const imageUrl = image.url || image.src || '/images/gallery/component1.jpg';
          return (
            <div key={image.id} className="relative aspect-[3/2] overflow-hidden">
              <Image
                src={imageUrl}
                alt={image.alt}
                width={600}
                height={400}
                className="object-cover transition-transform duration-300 hover:scale-110"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          );
        })}
      </div>
      </div>
    </section>
  );
}