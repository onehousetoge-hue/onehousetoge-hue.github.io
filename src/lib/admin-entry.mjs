import { pageHead } from "./template.mjs";

export function adminEntry(url) {
  if (!/^https:\/\/script\.google\.com\/(?:a\/macros\/[a-z0-9.-]+|macros)\/s\/[A-Za-z0-9_-]+\/exec$/.test(url)) throw new Error("Invalid private admin destination");
  const head = pageHead({ title:"한지붕 관리자", description:"한지붕 관리자의 접수 내역과 유입·전환 통계 로그인.",
    path:"/admin/",robots:"noindex,nofollow",publicScripts:false });
  const choose = "https://accounts.google.com/AccountChooser?continue=" + encodeURIComponent(url);
  return `<!doctype html><html lang="ko"><head>${head}</head><body>
    <main class="status-page"><div class="container narrow"><h1>한지붕 관리자</h1>
    <p>관리자 Google 계정으로 로그인해 접수 내역과 유입·전환 통계를 확인하세요.</p>
    <a class="button" href="${choose}" rel="noreferrer">Google 계정으로 로그인</a>
    </div></main><footer class="container narrow"><small>© 2026 hanjibung. All rights reserved.</small></footer></body></html>`;
}
