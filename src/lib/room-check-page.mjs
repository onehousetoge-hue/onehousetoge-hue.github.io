import { roomCheckUrl } from "../config/site.mjs";
import { escapeHtml } from "./template.mjs";

export function roomCheckPage() {
  const url = escapeHtml(roomCheckUrl);
  return `<section class="room-check-viewport" aria-labelledby="room-check-title">
    <h1 class="visually-hidden" id="room-check-title">한지붕 우리 집 남는 방 예상 월세 진단</h1>
    <iframe class="room-check-frame" src="${url}" title="한지붕 우리 집 남는 방 예상 월세 진단" loading="eager" referrerpolicy="strict-origin-when-cross-origin"></iframe>
  </section>
  <div class="room-check-access"><div class="container"><p>방 진단 화면이 보이지 않거나 입력이 어려우신가요? <a href="${url}" target="_blank" rel="noopener noreferrer">방 진단을 새 창에서 열기</a></p><a href="/overview/">한지붕의 기존 홈페이지 보기</a></div></div>`;
}
