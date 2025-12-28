import React from 'react';
import MediaGallery from './media/MediaGallery';

export default function HeroVideo({ media, className = "", mediaPosition = "center center", mobileAsImage = false }) {
  return (
    <div className="w-full h-full">
      <div className="w-full h-full md:min-h-[70vh] md:h-[70vh] flex items-center justify-center">
        <div className="w-full h-full flex items-center justify-center">
          <MediaGallery 
            media={media} 
            className={`${className} w-full h-full`}
            mediaPosition={mediaPosition}
            mobileAsImage={mobileAsImage}
          />
        </div>
      </div>
    </div>
  );
}