import { escapeHtml } from "./template.mjs";

export function photoImage(photo, { eager = false } = {}) {
  const responsive = photo.responsive ? ` srcset="/assets/activities/${photo.responsive.file} ${photo.responsive.width}w, /assets/activities/${photo.file} ${photo.width}w" sizes="(max-width: 880px) calc(100vw - 32px), 440px"` : "";
  return `<img src="/assets/activities/${photo.file}"${responsive} width="${photo.width}" height="${photo.height}" alt="${escapeHtml(photo.alt)}" loading="${eager ? "eager" : "lazy"}"${eager ? ' fetchpriority="high"' : ""} decoding="async">`;
}

export function photoFigure(photo, options = {}) {
  return `<figure class="documentary-photo">${photoImage(photo, options)}<figcaption>${escapeHtml(photo.caption)}</figcaption></figure>`;
}
