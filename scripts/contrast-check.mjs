import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const css = await readFile(new URL("../src/assets/site.css", import.meta.url), "utf8");
function token(name) { return css.match(new RegExp(`--${name}: (#[a-fA-F0-9]{6});`))?.[1]; }
function luminance(hex) {
  const parts = hex.slice(1).match(/../g).map((part) => parseInt(part, 16) / 255).map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return parts[0] * 0.2126 + parts[1] * 0.7152 + parts[2] * 0.0722;
}
const samples = [
  ["본문 / 아이보리", token("ink"), token("bg"), 4.5],
  ["설명 / 아이보리", token("muted"), token("bg"), 4.5],
  ["제목·링크 / 아이보리", token("green"), token("bg"), 4.5],
  ["버튼 글자 / 초록", "#ffffff", token("green"), 4.5],
  ["메모 안내 / 흰색", "#46574f", "#ffffff", 4.5],
  ["메모 테두리 / 흰색", "#647b6e", "#ffffff", 3],
  ["체크리스트 글자 / 연초록", token("ink"), token("green-soft"), 4.5],
  ["포커스 표시 / 아이보리", token("focus"), token("bg"), 3],
];
const results = samples.map(([name, foreground, background, minimum]) => {
  const [low, high] = [luminance(foreground), luminance(background)].sort((a, b) => a - b);
  const ratio = (high + 0.05) / (low + 0.05);
  assert.ok(ratio >= minimum, `${name}: ${ratio} < ${minimum}`);
  return { name, foreground, background, ratio: Number(ratio.toFixed(2)), minimum, pass: true };
});
console.log(JSON.stringify({ method: "WCAG relative luminance contrast; selected opaque CSS color pairs only", results }, null, 2));
