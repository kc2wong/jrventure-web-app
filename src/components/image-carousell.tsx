import * as React from 'react';
import {
  Carousel,
  CarouselNav,
  CarouselNavButton,
  CarouselNavContainer,
  CarouselViewport,
  CarouselSlider,
  CarouselCard,
  CarouselAnnouncerFunction,
  Image,
} from '@fluentui/react-components';

type ImageCarouselProps = {
  images: string[];
};

const getAnnouncement: CarouselAnnouncerFunction = (index: number, totalSlides: number) =>
  `Carousel slide ${index + 1} of ${totalSlides}`;

export const ImageCarousel: React.FC<ImageCarouselProps> = ({ images }) => {
  return (
    <div style={{ width: '100vw', maxWidth: 800, margin: '0 auto' }}>
      <Carousel announcement={getAnnouncement} circular groupSize={1}>
        <CarouselViewport style={{ width: '100%', overflow: 'hidden' }}>
          <CarouselSlider
            style={{
              display: 'flex',
              flexWrap: 'nowrap',
              width: '100%',
            }}
          >
            {images.map((imageSrc, index) => (
              <CarouselCard
                key={`image-${index}`}
                aria-label={`${index + 1} of ${images.length}`}
                id={`carousel-image-${index}`}
                style={{
                  width: '100%',
                  flexShrink: 0,
                  // aspectRatio: '16 / 9',
                  aspectRatio: 'auto',
                  overflow: 'hidden',
                }}
              >
                <Image
                  fit="cover"
                  role="presentation"
                  src={imageSrc}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </CarouselCard>
            ))}
          </CarouselSlider>
        </CarouselViewport>

        <CarouselNavContainer
          autoplayTooltip={{ content: 'Autoplay', relationship: 'label' }}
          layout="inline"
          nextTooltip={{ content: 'Go to next', relationship: 'label' }}
          prevTooltip={{ content: 'Go to prev', relationship: 'label' }}
        >
          <CarouselNav>
            {(index) => <CarouselNavButton aria-label={`Carousel Nav Button ${index}`} />}
          </CarouselNav>
        </CarouselNavContainer>
      </Carousel>
    </div>
  );
};
