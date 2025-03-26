import Image from 'next/image';

interface GalleryImage {
  id: number;
  src: string;
  alt: string;
}

interface GalleryProps {
  images?: GalleryImage[];
}

export default function Gallery({ images }: GalleryProps) {
  // Gallery images - defined within the component with default values
  const galleryImages = [
    { id: 1, src: '/images/gallery/component1.jpg', alt: 'McLaren 570S' },
    { id: 2, src: '/images/gallery/component2.jpg', alt: 'Ferrari SF90' },
    { id: 3, src: '/images/gallery/component3.jpg', alt: 'Porsche 911 GT3' },
    { id: 4, src: '/images/gallery/component4.jpg', alt: 'Lamborghini Urus' },
    { id: 5, src: '/images/gallery/component5.jpg', alt: 'Rolls Royce Cullinan' },
    { id: 6, src: '/images/gallery/component6.jpg', alt: 'Aston Martin DBX' },
    { id: 7, src: '/images/gallery/component7.jpg', alt: 'BMW X7' },
    { id: 8, src: '/images/gallery/component8.jpg', alt: 'Range Rover' },
    { id: 9, src: '/images/gallery/component9.jpg', alt: 'Bentley Flying Spur' },
    { id: 10, src: '/images/gallery/component10.jpg', alt: 'Audi Q8' },
    { id: 11, src: '/images/gallery/component11.jpg', alt: 'Lexus RX' },
    { id: 12, src: '/images/gallery/component12.jpg', alt: 'BMW M8' }
  ];
  
  // This ensures we display exactly 12 images in a 3x4 grid like the reference
  // Use provided images or default to the component's internal gallery images
  const displayImages = (images || galleryImages).slice(0, 12);
  
  return (
    <section className="w-full bg-white pt-24 pb-36">
      <div className="max-w-[1240px] mx-auto px-4">
        <h2 className="text-6xl font-semibold mb-6 text-black">GALLERY</h2>
      
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {displayImages.map((image) => (
          <div key={image.id} className="relative aspect-[3/2] overflow-hidden">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-300 hover:scale-110"
            />
          </div>
        ))}
      </div>
      </div>
    </section>
  );
}