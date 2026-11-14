# Steering — Tech

## 기술 원칙

- **순수 HTML/CSS/JS** — 프레임워크, 번들러, 빌드 단계 없음. 파일을 그대로 열면 동작한다.
- **단일 데이터 파일** — 보관일수 표와 레시피는 `data.js` 한곳에서만 관리한다.
  레시피가 참조하는 모든 재료명은 반드시 보관일수 표에 존재해야 한다(검증 스크립트로 강제).
- **상태는 localStorage만** — 키 접두사 `pc_` (pc_inventory, pc_shopping, pc_lang, pc_party).
  서버 전송·계정·추적 코드 금지.
- **날짜 계산은 날짜 단위** — 시각·타임존 오차를 막기 위해 로컬 날짜(연-월-일)로만 비교한다.
- **사용자 입력 이스케이프** — 재고에 표시되는 사용자 입력 재료명은 반드시 이스케이프한다.

## 파일 규약

| 파일 | 규약 |
|---|---|
| `index.html` | 정적 라벨은 `data-i18n` 키로, 동적 문자열은 app.js의 STR 사전으로 |
| `data.js` | 브라우저 전역 상수 + Node 검증용 `module.exports` 가드 병행 |
| `app.js` | 렌더링은 render* 함수 단위, 전 기능 renderAll()로 일괄 갱신 |
| `style.css` | CSS 변수 기반 테마, 모바일 분기점 560px |

## 검증 명령

```sh
node --check data.js && node --check app.js
node -e "const d=require('./data.js'); console.log(Object.keys(d.SHELF_LIFE).length, d.RECIPES.length)"
```
