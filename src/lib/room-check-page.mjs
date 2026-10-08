import { roomCheckUrl } from "../config/site.mjs";
import { escapeHtml } from "./template.mjs";

export function roomCheckPage() {
  const url = escapeHtml(roomCheckUrl);
  return `<section class="room-check-viewport" aria-labelledby="room-check-title">
    <h1 class="visually-hidden" id="room-check-title">한지붕 우리 집 남는 방 예상 월세 진단</h1>
    <iframe class="room-check-frame" src="${url}" title="한지붕 우리 집 남는 방 예상 월세 진단" loading="eager" referrerpolicy="strict-origin-when-cross-origin"></iframe>
  </section>`;
}
