# Hook — Quality Gate

Kiro agent hook으로 운용하는 품질 게이트. 코드나 데이터가 바뀔 때마다 같은 검사가
자동으로 돌게 해 "검증 없는 제출"을 막는 것이 목적이다.

## Hook 1: 파일 저장 시 문법 검사 (fileEdited)

- **트리거**: `data.js` 또는 `app.js` 저장
- **동작**: `node --check data.js && node --check app.js` 실행
- **실패 시**: 오류 위치를 에이전트가 먼저 고치고, 통과 전에는 다음 단계로 진행하지 않는다.

## Hook 2: 데이터 무결성 검사 (fileEdited — data.js)

- **트리거**: `data.js` 저장
- **동작**: 아래 무결성 검사를 실행한다.
  - 레시피 수 ≥ 40, 보관일수 표 ≥ 30
  - 모든 레시피 재료명이 보관일수 표에 존재
  - 레시피 id 중복 없음, 수량·인분이 양수
- **실패 시**: 깨진 재료명·레시피를 목록으로 보고하고 수정을 제안한다.

```sh
node -e "
const d = require('./data.js');
const shelf = new Set(Object.keys(d.SHELF_LIFE));
const bad = [];
for (const r of d.RECIPES) for (const g of r.ingredients)
  if (!shelf.has(g.n)) bad.push(r.id + ':' + g.n);
console.log('recipes', d.RECIPES.length, 'shelf', shelf.size, 'missing', bad);
"
```

## Hook 3: 제출 전 체크 (수동 실행 — preSubmit)

- `.kiro/` 폴더가 저장소 루트에 있고 `.gitignore`에 들어 있지 않은지 확인
- `LICENSE`, `README.md`(How I used Kiro 절 포함) 존재 확인
- 오프라인 상태(네트워크 차단)에서 `index.html` 수동 동작 확인
