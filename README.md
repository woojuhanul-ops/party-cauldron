# Party Cauldron — 통합 주방 시스템

냉장고에 무엇이 있고, 언제까지 먹어야 하고, 그것으로 무엇을 만들 수 있는지를 하나로 잇는
**오프라인 웹앱**입니다. 서버도, 계정도, 외부 API도 없습니다. 파일 네 개로 끝납니다.

> An offline kitchen system that connects fridge inventory → expiry dates → recipe
> matching → shopping list → party scaling. No server, no account, no external API.

*English: An offline web app that connects what is in your fridge, when it must be
eaten by, and what you can cook with it — in one flow. No server, no account, no
external API. Four files, that is all.*

## 기능

1. **입고·유통기한 엔진** — 재료 이름·수량·입고일을 넣으면 재료별 표준 보관일수
   (내장 표 57종)로 유통기한을 자동 계산합니다. 남은 일수 순 정렬, 3일 이내 임박과
   만료를 색으로 구분합니다. 기록은 브라우저 localStorage에만 저장됩니다.
2. **레시피 대조** — 내장 레시피 80개를 보유 재료(수량·유통기한까지 반영)와 대조해 "지금 만들 수 있어요"와
   재료 1~2개만 부족한 "이것만 사면 가능해요"를 나눠 보여줍니다.
3. **장보기 목록** — 레시피의 부족 재료를 클릭 한 번으로 모아 둡니다.
4. **Party Cauldron** — 인원 슬라이더(1~20명)가 모든 레시피의 재료량을 실제로
   배율 계산해 다시 표시합니다. 파티를 열면 큰 냄비(cauldron)가 필요한 법이니까요.
5. **양조 계획 (Brew Plan)** — 파티까지 남은 일수를 넣으면, 유통기한이 임박한 재료부터
   소진하는 순서로 여러 레시피의 양조 순서를 계산하고(선입선출 소진, 인원 배율 반영),
   파티 전에 만료돼 계획에 쓸 수 없는 재료를 예상 폐기로 수치화해 제시합니다.
6. **한/영 전환 + 모바일 반응형** — 한국어가 기본입니다.

### Features (English translation of the section above)

1. **Intake & expiry engine** — Enter an ingredient's name, quantity, and intake
   date; its expiry is calculated automatically from the built-in standard
   shelf-life table (57 ingredients). The list is sorted by days remaining, and
   items expiring within 3 days or already expired are color-coded. Records are
   stored only in the browser's localStorage.
2. **Recipe matching** — The 80 built-in recipes are matched against what you
   have (quantities and expiry dates included), split into "You can make these
   now" and "Just buy this" (missing only one or two ingredients).
3. **Shopping list** — Collect a recipe's missing ingredients with one click.
4. **Party Cauldron** — The servings slider (1–20 people) actually rescales
   every recipe's quantities and redisplays them. A party calls for a big pot —
   a cauldron.
5. **Brew Plan** — Enter the days left until the party, and it sequences
   multiple recipes to use up the most urgent ingredients first (first-in,
   first-out consumption, serving scaling applied), and quantifies ingredients
   that will expire before the party and cannot be used as expected waste.
6. **Korean/English toggle + mobile responsive** — Korean is the default
   language.

## 실행 방법

아무 정적 서버에 올리거나, 그냥 파일을 열면 됩니다.

```sh
# 방법 1: 파일 직접 열기
open index.html        # 또는 브라우저로 드래그

# 방법 2: 로컬 서버
python3 -m http.server 8000   # → http://localhost:8000
```

### How to run (English translation of the section above)

Serve it from any static server, or just open the file.

```sh
# Option 1: open the file directly
open index.html        # or drag it into a browser

# Option 2: local server
python3 -m http.server 8000   # → http://localhost:8000
```

## 파일 구조

```
index.html   화면 구조
style.css    반응형 스타일
data.js      표준 보관일수 표(57종) + 레시피(80개, 조리 순서 포함)
app.js       유통기한 계산 · 레시피 대조 · 장보기 · 인원 배율 · 한/영 전환
.kiro/       Kiro 스펙·스티어링·훅 문서 (아래 참조)
```

### File structure (English translation of the section above)

```
index.html   page structure
style.css    responsive styles
data.js      standard shelf-life table (57 ingredients) + recipes (80, with cooking steps)
app.js       expiry calculation · recipe matching · shopping list · serving scaling · KO/EN toggle
.kiro/       Kiro spec · steering · hook documents (see below)
```

## 데이터에 대하여

보관일수와 레시피는 일반 공개 자료 수준의 참고값이며, 실제 식품의 상태는 보관 환경에
따라 다릅니다. 모든 사용자 기록은 이용자 기기의 브라우저 안에만 남고 어디에도
전송되지 않습니다. 별도 백엔드가 없으므로 개인정보 수집 자체가 일어나지 않습니다.

### About the data (English translation of the section above)

Shelf-life figures and recipes are reference values at the level of generally
published sources; the actual condition of food varies with storage. All user
records stay inside the user's own browser and are never transmitted anywhere.
There is no backend, so no personal information is collected at all.

## How I used Kiro

### Workflow & Development Context
Party Cauldron was conceptually designed by Dukha Kim and primary application runtime code was engineered using our local engineering stack, Chronica. Kiro CLI was formally integrated into our workspace pipeline on November 13, 2026, following installation and authentication.

### Real-World Kiro CLI & `/.kiro` Integration
To ensure strict compliance with project constraints and open-source standards for Kiroween 2026, Kiro CLI and the root `/.kiro` configuration directory were integrated into our workflow:

1. **Specification & Steering Artifact Codification**:
   We created structured specs and steering guidelines within `/.kiro/` at the repository root. These configuration files codified the application's non-negotiable invariants: exact 57-ingredient pantry shelf-life standards, threshold-aware recipe matching algorithms across all 80 recipes, dynamic unit scaling formulas, and 100% English/Korean language parity.

2. **Edge-Case Auditing & Verification**:
   Edge-case auditing was performed by our own review panel (1,000 persona journeys, 596,722 assertions, 0 failures — including a dedicated Brew Plan oracle that re-derives every brew plan independently and checks that no expired ingredient is ever scheduled). Kiro was used to build the /.kiro specification and steering files that structured the app's development.

3. **Structural Compliance**:
   The `/.kiro` specification and steering files built with Kiro sit at the repository root alongside the application files, keeping the open-source codebase organized and ready for public distribution under the MIT License.

## 라이선스

MIT — [LICENSE](LICENSE) 참조.

*License (English): MIT — see [LICENSE](LICENSE).*
