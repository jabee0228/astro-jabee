import { baseService } from 'astro/assets';

// Use dynamic import for sharp to match Astro's internal handling
let sharp;

export default {
  getURL: baseService.getURL,
  parseURL: baseService.parseURL,
  getHTMLAttributes: baseService.getHTMLAttributes,
  getSrcSet: baseService.getSrcSet,
  validateOptions(options, config) {
    // Force the output format to be webp so URLs get generated correctly
    if (!options.format) {
      options.format = 'webp';
    }
    return baseService.validateOptions(options, config);
  },
  async transform(inputBuffer, transformOptions, config) {
    if (!sharp) {
      try {
        sharp = (await import('sharp')).default;
      } catch (err) {
        throw new Error("Failed to load sharp. Make sure it is installed.");
      }
    }

    const transform = transformOptions;
    
    // Initialize sharp with the input buffer
    const result = sharp(inputBuffer, {
      failOn: "none",
      pages: -1
    });

    // CRITICAL for ProRGB / Display P3: keep the ICC profile and EXIF metadata
    result.withMetadata();
    
    // Auto-rotate based on EXIF (if any)
    result.rotate();

    // Resize logic
    if (transform.width && transform.height) {
      const fitMap = { fill: 'fill', contain: 'inside', cover: 'cover', none: 'outside', 'scale-down': 'inside' };
      const fit = transform.fit ? (fitMap[transform.fit] || 'inside') : 'inside';
      result.resize({
        width: Math.round(transform.width),
        height: Math.round(transform.height),
        fit,
        position: transform.position,
        withoutEnlargement: true
      });
    } else if (transform.height && !transform.width) {
      result.resize({
        height: Math.round(transform.height),
        withoutEnlargement: true
      });
    } else if (transform.width) {
      result.resize({
        width: Math.round(transform.width),
        withoutEnlargement: true
      });
    }

    if (transform.background) {
      result.flatten({ background: transform.background });
    }

    // Force WebP output
    result.webp({
      quality: transform.quality ? parseInt(transform.quality) : 80
    });

    try {
      const { data, info } = await result.toBuffer({ resolveWithObject: true });
      return {
        data,
        format: info.format
      };
    } catch (e) {
      console.warn("Sharp error optimizing image, passing original buffer.", e);
      return { data: inputBuffer, format: 'webp' };
    }
  }
};
