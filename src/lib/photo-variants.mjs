// Delivery-only derivatives. Full-frame JPEG originals remain unchanged.
export function photoVariants(photo) {
  const extra = photo.file === "consultation-walk.jpg" ? [768] : [];
  return [...new Set([640, ...extra, 960, photo.width].filter((width) => width <= photo.width))]
    .sort((a, b) => a - b)
    .map((width) => ({ file: photo.file.replace(/\.jpg$/, `-${width}.webp`), width }));
}
