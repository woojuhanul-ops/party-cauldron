# Party Cauldron — 통합 주방 시스템

냉장고에 무엇이 있고, 언제까지 먹어야 하고, 그것으로 무엇을 만들 수 있는지를 하나로 잇는
**오프라인 웹앱**입니다. 서버도, 계정도, 외부 API도 없습니다. 파일 네 개로 끝납니다.

> An offline kitchen system that connects fridge inventory → expiry dates → recipe
> matching → shopping list → party scaling. No server, no account, no external API.

## 기능

1. **입고·유통기한 엔진** — 재료 이름·수량·입고일을 넣으면 재료별 표준 보관일수
   (내장 표 57종)로 유통기한을 자동 계산합니다. 남은 일수 순 정렬, 3일 이내 임박과
   만료를 색으로 구분합니다. 기록은 브라우저 localStorage에만 저장됩니다.
2. **레시피 대조** — 내장 레시피 47개를 보유 재료(수량·유통기한까지 반영)와 대조해 "지금 만들 수 있어요"와
   재료 1~2개만 부족한 "이것만 사면 가능해요"를 나눠 보여줍니다.
3. **장보기 목록** — 레시피의 부족 재료를 클릭 한 번으로 모아 둡니다.
4. **Party Cauldron** — 인원 슬라이더(1~20명)가 모든 레시피의 재료량을 실제로
   배율 계산해 다시 표시합니다. 파티를 열면 큰 냄비(cauldron)가 필요한 법이니까요.
5. **한/영 전환 + 모바일 반응형** — 한국어가 기본입니다.

## 실행 방법

아무 정적 서버에 올리거나, 그냥 파일을 열면 됩니다.

```sh
# 방법 1: 파일 직접 열기
open index.html        # 또는 브라우저로 드래그

# 방법 2: 로컬 서버
python3 -m http.server 8000   # → http://localhost:8000
```

## 파일 구조

```
index.html   화면 구조
style.css    반응형 스타일
data.js      표준 보관일수 표(57종) + 레시피(47개, 조리 순서 포함)
app.js       유통기한 계산 · 레시피 대조 · 장보기 · 인원 배율 · 한/영 전환
.kiro/       Kiro 스펙·스티어링·훅 문서 (아래 참조)
```

## 데이터에 대하여

보관일수와 레시피는 일반 공개 자료 수준의 참고값이며, 실제 식품의 상태는 보관 환경에
따라 다릅니다. 모든 사용자 기록은 이용자 기기의 브라우저 안에만 남고 어디에도
전송되지 않습니다. 별도 백엔드가 없으므로 개인정보 수집 자체가 일어나지 않습니다.

## How I used Kiro (draft)

This app was designed and built with **Kiro** as the primary development partner,
following a spec-driven workflow:

- **Steering first.** Before any code, I wrote product and tech steering docs
  (`.kiro/steering/product.md`, `.kiro/steering/tech.md`) that fixed the ground
  rules Kiro had to respect in every session: vanilla HTML/CSS/JS only, no build
  step, no external APIs, all user data in localStorage, Korean by default.
- **One spec to rule the MVP.** The requirements, design, and task list live in
  `.kiro/specs/integrated-kitchen-system.md`. I iterated on the spec with Kiro
  (expiry engine → recipe matching → shopping list → the Party Cauldron scaling
  feature) and let Kiro implement task by task against it, checking acceptance
  criteria ("recipes ≥ 40, shelf-life table ≥ 30") after each step.
- **Hooks as quality gates.** `.kiro/hooks/quality-gate.md` documents the agent
  hooks used during development: syntax checks (`node --check`) and a data
  integrity check that fails if any recipe references an ingredient missing from
  the shelf-life table. These caught mismatches between the 47 recipes and the
  57-entry shelf-life table before they reached the browser.
- **Vibe coding for the data layer.** The 47 recipes and 57 shelf-life entries
  were drafted conversationally with Kiro, then frozen into `data.js` as a single
  source of truth, with a Node export guard so the same file could be validated
  headlessly.
- **The Party Cauldron twist.** The scaling slider started as a framing idea —
  "a recipe app for feast days" — and Kiro helped turn it into a real, testable
  behavior: every recipe card re-renders with quantities multiplied by
  (guests ÷ base servings), which is also what makes the app useful for its
  day job on the Nexus Group homepage as a household kitchen tool.

> 제출 전 최종 다듬질 예정인 초안입니다. / This section is a draft and will be
> finalized before submission.

## 라이선스

MIT — [LICENSE](LICENSE) 참조.
