import Image from 'next/image';

interface GalleryImage {
  id: number;
  src: string;
  alt: string;
}

interface GalleryProps {
  images: GalleryImage[];
}

export default function GalleryFixed({ images }: GalleryProps) {
  return (
    <div className="w-full max-w-[1200px] mx-auto">
      <h2 className="text-4xl font-bold mb-6 px-2">GALLERY</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {images.map((image) => (
          <div 
            key={image.id} 
            className="relative h-56 overflow-hidden"
          >
            <Image 
              src={image.src} 
              alt={image.alt}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}