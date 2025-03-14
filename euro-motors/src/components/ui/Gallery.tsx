import Image from 'next/image';

interface GalleryImage {
  id: number;
  src: string;
  alt: string;
}

interface GalleryProps {
  images: GalleryImage[];
}

export default function Gallery({ images }: GalleryProps) {
  // This ensures we display exactly 12 images in a 3x4 grid like the reference
  const displayImages = images.slice(0, 12);
  
  return (
    <div className="max-w-[1240px] mx-auto px-4 py-10">
      <h2 className="text-6xl font-semibold mb-6 text-black">GALLERY</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {displayImages.map((image) => (
          <div key={image.id} className="relative aspect-[3/2]">
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