import { escapeHtml } from "./template.mjs";
import { photoVariants } from "./photo-variants.mjs";

export function photoImage(photo, { eager = false, sizes = "(max-width: 800px) calc(100vw - 32px), 580px" } = {}) {
  const responsive = photo.responsive ? ` srcset="/assets/activities/${photo.responsive.file} ${photo.responsive.width}w, /assets/activities/${photo.file} ${photo.width}w" sizes="(max-width: 880px) calc(100vw - 32px), 440px"` : "";
  const webp = photoVariants(photo).map((item) => `/assets/activities/${item.file} ${item.width}w`).join(", ");
  return `<picture><source type="image/webp" srcset="${webp}" sizes="${escapeHtml(sizes)}"><img src="/assets/activities/${photo.file}"${responsive} width="${photo.width}" height="${photo.height}" alt="${escapeHtml(photo.alt)}" loading="${eager ? "eager" : "lazy"}"${eager ? ' fetchpriority="high"' : ""} decoding="async"></picture>`;
}

export function photoFigure(photo, options = {}) {
  return `<figure class="documentary-photo">${photoImage(photo, options)}<figcaption>${escapeHtml(photo.caption)}${photo.context ? `<span class="photo-context-caption"><strong>현재 서비스와 구분해 주세요</strong>${escapeHtml(photo.context)}</span>` : ""}</figcaption></figure>`;
}
