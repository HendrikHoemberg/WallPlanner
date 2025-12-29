const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * Read file as base64 data URL
 */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Validate image file (type, size limits)
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_TYPES.join(', ')}`,
    };
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds ${MAX_IMAGE_SIZE / 1024 / 1024}MB limit`,
    };
  }

  return { valid: true };
}

/**
 * Calculate crop/scale to fit aspect ratio
 */
export function calculateImageFit(
  imageSize: { width: number; height: number },
  frameSize: { width: number; height: number }
): { scale: number; offsetX: number; offsetY: number } {
  const imageAspect = imageSize.width / imageSize.height;
  const frameAspect = frameSize.width / frameSize.height;

  let scale: number;
  let offsetX = 0;
  let offsetY = 0;

  if (imageAspect > frameAspect) {
    // Image is wider, fit height
    scale = frameSize.height / imageSize.height;
    offsetX = (frameSize.width - imageSize.width * scale) / 2;
  } else {
    // Image is taller, fit width
    scale = frameSize.width / imageSize.width;
    offsetY = (frameSize.height - imageSize.height * scale) / 2;
  }

  return { scale, offsetX, offsetY };
}

/**
 * Get image dimensions from data URL
 */
export function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = reject;
    img.src = dataUrl;
  });
}

/**
 * Compress/resize image if too large (simplified - returns same image)
 * In a real app, you'd use canvas to actually compress
 */
export async function compressImage(dataUrl: string): Promise<string> {
  // For now, return as-is. In production, you could use canvas.toBlob() with quality settings
  return dataUrl;
}
