---
name: 지름신 퇴치소
description: 결제 버튼 누르기 전에 지름신부터 확인하는 충동구매 방지 웹앱
colors:
  red: "#C42A20"
  on-red: "#FFFFFF"
  charm: "#F2D04B"
  charm-ink: "#2A1708"
  charm-red: "#AE2219"
  save: "#18734C"
  mark: "#FFE36B"
  focus: "#2D6BEA"
  ground: "#E5E8EC"
  ground-2: "#D8DCE2"
  track: "#D8DCE2"
  paper: "#FFFFFF"
  paper-2: "#F3F5F7"
  ink: "#1A1D24"
  ink-2: "#4C5361"
  ink-3: "#5F6673"
  rule: "#D2D6DD"
  field: "#7C838F"
  dot: "#C4C9D1"
typography:
  display:
    fontFamily: "Black Han Sans, Apple SD Gothic Neo, Malgun Gothic, sans-serif"
    fontSize: "clamp(2.5rem, 8vw, 4.5rem)"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Black Han Sans, Apple SD Gothic Neo, Malgun Gothic, sans-serif"
    fontSize: "2rem"
    fontWeight: 400
    lineHeight: 1.2
  title:
    fontFamily: "Black Han Sans, Apple SD Gothic Neo, Malgun Gothic, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  body:
    fontFamily: "IBM Plex Sans KR, Apple SD Gothic Neo, Malgun Gothic, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "IBM Plex Sans KR, Apple SD Gothic Neo, Malgun Gothic, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
  mono:
    fontFamily: "Nanum Gothic Coding, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "0.86rem"
    fontWeight: 400
    lineHeight: 1.6
    fontFeature: "tnum"
  hand:
    fontFamily: "Nanum Pen Script, Apple SD Gothic Neo, cursive"
    fontSize: "1.6rem"
    fontWeight: 400
    lineHeight: "2.2rem"
rounded:
  sm: "6px"
  md: "10px"
  pill: "999px"
components:
  button-primary:
    backgroundColor: "{colors.red}"
    textColor: "{colors.on-red}"
    rounded: "{rounded.sm}"
    padding: "12px 26px"
  button:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "10px 18px"
  button-hover:
    backgroundColor: "{colors.paper-2}"
  button-save:
    backgroundColor: "{colors.save}"
    textColor: "{colors.paper}"
    rounded: "{rounded.sm}"
    padding: "10px 18px"
  button-ghost:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.sm}"
    padding: "10px 18px"
  input:
    backgroundColor: "{colors.paper-2}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "11px 13px"
  input-focus:
    backgroundColor: "{colors.paper}"
  chip:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.pill}"
    padding: "6px 13px"
  chip-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  chip-need-selected:
    backgroundColor: "{colors.save}"
    textColor: "{colors.paper}"
  tab:
    textColor: "{colors.ink-2}"
    rounded: "{rounded.pill}"
    padding: "7px 14px"
  tab-selected:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
  card:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.md}"
    padding: "22px clamp(16px, 4vw, 28px)"
  charm:
    backgroundColor: "{colors.charm}"
    textColor: "{colors.charm-ink}"
    rounded: "3px"
    padding: "26px clamp(18px, 4vw, 30px) 24px"
  stamp:
    textColor: "{colors.charm-red}"
    rounded: "9px"
    padding: "12px 14px"
  seal:
    backgroundColor: "{colors.red}"
    textColor: "{colors.on-red}"
    rounded: "5px"
    size: "44px"
  receipt:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.mono}"
    padding: "24px 20px 26px"
  decision-bar:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.md}"
    padding: "12px 14px"
  toast:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    padding: "10px 18px"
---

# Design System: 지름신 퇴치소

## Overview

**Creative North Star: "계산대 앞의 부적"**

결제 직전의 계산대 앞, 카드를 꺼내려는 순간에 노란 부적이 붙어 결제를 막아 세우는 장면이 이 시스템의 중심이다. 화면은 차가운 회색 계산대(배경) 위에 흰 종이 서류를 올려놓은 구조다. 지름 신고서, 세계 보유율 카드, 결제 전 영수증, 보류함 카드가 모두 같은 종이다. 판정만은 괴황지 노랑 부적에 인주 빨강 계열의 도장으로 찍힌다.

분위기는 유쾌하지만 정확하다. 부적, 도장, 손글씨 편지는 장난스럽게 기울어져 있지만, 숫자와 표는 영수증처럼 고정폭 숫자와 점선으로 반듯하게 정렬된다. 장난기는 비유에 담고 정보는 서류처럼 정직하게 보여 준다. 버튼, 칩, 입력칸은 서류와 도장처럼 또렷하다. 테두리가 분명하고, 누르면 도장을 찍듯 확실하게 반응한다.

확정된 거부 목록(사용자 확정): 귀신·공포처럼 겁주는 무속 분위기, 빨간 경고가 화면 곳곳에서 소리치는 경고문 같은 빨강, 색과 효과가 넘치는 알록달록한 게임 화면.

**Key Characteristics:**
- 회색 계산대 위의 흰 종이 서류, 그리고 결과마다 단 하나의 노란 부적
- 인주 빨강은 도장, 로고, 핵심 숫자처럼 '찍히는' 자리에만
- 표제는 간판처럼 굵은 Black Han Sans, 본문은 IBM Plex Sans KR, 금액은 고정폭 Nanum Gothic Coding, 편지만 손글씨 Nanum Pen Script
- 기울어진 것은 도장과 편지뿐이고 나머지는 수평으로 정렬
- 그림자는 종이 그림자 한 겹
- 밝은 모드와 어두운 모드 모두 WCAG AA 대비

## Colors

차가운 회색과 흰 종이의 차분한 바탕 위에서 인주 빨강과 괴황지 노랑, 두 가지 의식의 색이 판정과 행동을 표시한다.

### Primary
- **인주 빨강** (`red`): 로고 도장 '퇴치', 주 버튼 '지름신 퇴치하기', 소개 제목의 '지름신', 세계 보유율 큰 숫자, 이유 번호(통과 판정의 '잘 사는 법' 번호는 저금 초록), 설렘 유통기한 그래프 선, 영수증에서 빠지는 돈, 보유율 그림의 '가진 사람'. 도장의 인주처럼 찍히는 자리에만 쓴다.
- **빨강 위 글자** (`on-red`): 인주 빨강 바탕 위의 글자와 로고 도장의 안쪽 선.

### Secondary
- **괴황지 노랑** (`charm`): 판정 부적의 종이 색. 부적과 저금통 동전에만 쓴다.
- **부적 먹색** (`charm-ink`): 부적 위의 글자.
- **부적 주사 빨강** (`charm-red`): 부적 안쪽 테두리, 판정 도장, 충동 지수 숫자와 막대. 인주 빨강보다 깊고 어두운 빨강으로, 노랑 종이 위에서만 쓴다.

### Tertiary
- **저금 초록** (`save`): 참은 돈과 지킨 결정. '참았어요' 버튼, 선택된 '꼭 필요해서' 칩, 통과 판정의 '사기로 했어요' 버튼과 '잘 사는 법' 번호, 저금통 합계와 목표 막대, 장부의 참은 금액, 보류 시간이 끝난 카드.
- **형광펜 노랑** (`mark`): 형광펜으로 그은 듯한 배경 강조. 영수증의 '실제로 사라지는 돈', '사실 원하는 것', 보유율 문장의 핵심, 안내 깃발.
- **초점 파랑** (`focus`): 키보드 초점선 전용.

### Neutral
- **계산대 회색** (`ground`): 페이지 바탕.
- **계산대 그늘** (`ground-2`): 탭 묶음의 바탕. 같은 값의 `track`은 막대와 진행률의 빈 칸이다.
- **영수증 종이** (`paper`): 신고서, 카드, 영수증, 편지, 결정 바의 바탕.
- **종이 그늘** (`paper-2`): 입력칸 바탕, 기본 버튼의 hover.
- **먹색** (`ink`): 제목과 핵심 글자, 선택된 칩, 알림 바탕.
- **연한 먹** (`ink-2`): 설명 글과 보조 숫자. 더 연한 `ink-3`은 힌트, 출처, 날짜, 바닥글.
- **괘선** (`rule`): 구분선, 칩과 보조 칸의 테두리, 점선.
- **입력칸 테두리** (`field`): 입력칸과 선택 상자의 테두리. 바탕과 3:1 대비를 지키는 색이다.
- **군중 점** (`dot`): 세계 보유율 그림의 '갖지 않은 사람'.

어두운 모드 값은 `src/style-1.css`에 같은 이름으로 정의되어 있다. `prefers-color-scheme: dark` 블록과 `[data-theme="dark"]` 블록 두 곳이 늘 같은 값이어야 한다. 어두운 모드에서도 부적은 노랑 종이로 남는다.

### Named Rules
**The 도장 Rule.** 인주 빨강은 찍히는 자리(로고 도장, 주 버튼, 핵심 숫자, 빠지는 돈)에만 쓴다. 넓은 배경, 경고 띠, 여러 개의 경고 표시로 칠하지 않는다.

**The 부적 하나 Rule.** 괴황지 노랑 부적은 결과 화면에 하나뿐이다. 노랑을 다른 카드의 바탕으로 넓혀 쓰지 않는다.

**The 지킨 돈 Rule.** 저금 초록은 참은 돈, 저금, 필요한 소비처럼 지킨 결정에만 쓴다. 일반적인 성공·확인 색으로 넓혀 쓰지 않는다.

## Typography

**Display Font:** Black Han Sans (with Apple SD Gothic Neo, Malgun Gothic)
**Body Font:** IBM Plex Sans KR (with Apple SD Gothic Neo, Malgun Gothic, system-ui)
**Label/Mono Font:** Nanum Gothic Coding(영수증과 금액), Nanum Pen Script(미래에서 온 편지 전용)

**Character:** 간판처럼 굵고 납작한 Black Han Sans가 도장과 표제의 목소리를 내고, 단정한 IBM Plex Sans KR이 설명을 맡는다. 영수증은 고정폭 글꼴로 계산서의 느낌을, 편지는 손글씨로 1년 뒤의 나라는 사람의 목소리를 낸다.

### Hierarchy
- **Display** (400, clamp(2.5rem, 8vw, 4.5rem), 1.08, -0.02em): 첫 화면 제목 "결제 버튼 누르기 전에, 지름신부터 확인하세요"와 세계 보유율 큰 숫자.
- **Headline** (400, 2rem, 1.2): 부적의 판정 문장, 보류함·저금통 제목.
- **Title** (400, 1.5rem, 1.25, -0.01em): 지름 신고서와 결과 섹션 제목, 영수증 이미지 창 제목. 주 버튼도 같은 글꼴을 1.1875rem으로 쓴다.
- **Body** (400, 1rem, 1.6): 설명과 본문. 소개 문단은 1.1875rem에 최대 폭 40em. 한국어 단어가 끊기지 않도록 `word-break: keep-all`을 쓴다.
- **Label** (700, 0.875rem): 입력 항목 이름과 기본 버튼. 탭은 600, 힌트는 0.8125rem 400.
- **Mono** (400, 0.86rem, 1.6, 고정폭 숫자): 영수증 본문, 금액 입력칸, 보류 시계, 장부 금액.
- **Hand** (400, 1.6rem, 줄 간격 2.2rem): 1년 뒤의 나에게서 온 편지.

글자 크기 단계는 `src/style-1.css`의 `--t-xs`(0.8125rem)부터 `--t-hero`까지이며, 저금통 합계는 `--t-3xl`(clamp(2.4rem, 7vw, 3.75rem))을 쓴다.

### Named Rules
**The 한 굵기 Rule.** Black Han Sans는 굵기 400 하나뿐이다. 700으로 지정해 가짜 굵기를 만들지 않고, 본문이나 긴 문장에는 쓰지 않는다.

**The 영수증 숫자 Rule.** 금액과 시간은 고정폭 숫자(tabular-nums)로 오른쪽 정렬한다.

## Layout

최대 폭 1120px을 가운데에 두고, 좌우 여백은 최소 16px(휴대폰 노치 안전 영역 포함)이다. 머리말 왼쪽에 로고, 오른쪽에 분석·보류함·저금통 탭이 있다.

분석 화면은 소개, 지름 신고서(종이 한 장), 결과 순서로 내려간다. 결과는 941px 이상에서 두 칸이다. 왼쪽에 판정 부적, 세계 보유율, 구매 심리, 이유, 설렘 유통기한, 대안, 편지, 담판이 쌓이고, 오른쪽(300~380px)에 결제 전 영수증이 세로로 길게 붙는다. 화면 높이가 980px 이상이면 영수증이 스크롤을 따라온다. 940px 이하에서는 한 칸으로 쌓이고 영수증은 세계 보유율 다음에 온다.

신고서의 두 칸 줄은 760px 이하에서 한 칸이 된다. 결정 바는 화면 아래에 붙어 따라오고, 560px 이하에서는 두 줄 격자(참았어요 | 그래도 살래요 또는 사기로 했어요 / 보류 | 결과 복사)로 줄어 화면을 덜 가린다.

간격 리듬은 입력 묶음 사이 22px, 항목 안 8px, 결과 섹션 사이 세로 34px·가로 36px, 카드 안쪽 22px 안팎(좌우는 clamp(16px, 4vw, 28~32px))이다.

## Elevation & Depth

종이를 책상에 올려 둔 듯한 한 겹 그림자가 기본이다. 신고서, 보유율 카드, 부적, 영수증, 편지, 결정 바, 보류 카드, 저금통 카드가 같은 그림자를 쓴다. 대안, 사실 원하는 것, 상태 안내 같은 보조 칸은 그림자 없이 괘선 테두리로 구분한다.

### Shadow Vocabulary
- **종이 그림자** (`box-shadow: 0 1px 0 rgba(26, 29, 36, .05), 0 12px 30px -16px rgba(26, 29, 36, .38)`): 위에 놓인 종이 서류. 어두운 모드는 더 진한 값을 쓴다(`--shadow`).
- **선택된 탭** (`box-shadow: 0 1px 2px rgba(0, 0, 0, .08)`): 탭 묶음 안에서 선택된 탭만 살짝 뜬다.

### Named Rules
**The 한 겹 Rule.** 그림자는 종이 그림자 한 가지다. 겹쳐 쌓거나 더 깊은 그림자, 빛나는 그림자를 새로 만들지 않는다.

## Shapes

기본 모서리는 살짝 둥근 6px(입력칸, 버튼, 종류·시기 선택)와 10px(카드, 신고서, 결정 바, 대화 상자)이다. 알약 모양(999px)은 탭, 이유 칩, 배지, 막대, 알림에 쓴다.

종이 서류는 거의 각져 있다. 부적은 3px, 영수증은 0이고 영수증의 아래 가장자리는 톱니처럼 찢겨 있다. 도장은 두 겹 테두리(4px 테두리와 안쪽 선)에 9px 모서리, -7° 기울기다. 로고 도장은 44px 정사각형에 5px 모서리, -5° 기울기, 세로쓰기 '퇴치'다.

선의 말투도 서류에서 왔다. 신고서 윗단의 2px 점선, 영수증의 1px 점선 구분과 합계 위 3px 겹선, 영수증 줄을 잇는 점 리더, 예시 칩과 빈 상태의 점선 테두리가 그렇다. 편지는 2.2rem 간격의 줄 공책 무늬에 -0.5° 기울기다.

## Components

### Buttons
서류와 도장처럼 또렷하다.
- **Shape:** 살짝 둥근 모서리(6px)와 1.5px 테두리.
- **Primary:** '지름신 퇴치하기'. 인주 빨강 바탕에 흰 글자, Black Han Sans 1.1875rem, 여백 12px 26px. 한 화면에 하나뿐이다.
- **Hover / Focus:** 주 버튼은 밝기를 6% 올리고, 기본 버튼은 종이 그늘 바탕이 된다. 누르면 1px 아래로 눌린다. 초점은 초점 파랑 2px 선을 2px 띄워 두른다. 비활성은 투명도 50%.
- **Secondary / Ghost / Tertiary:** 기본 버튼은 영수증 종이 바탕에 먹색 1.5px 테두리, 0.875rem 700, 여백 10px 18px. 저금 버튼('참았어요' 등)은 저금 초록 바탕에 흰 글자. 고스트 버튼은 괘선 테두리에 연한 먹 글자. 글자 링크 버튼은 밑줄을 3px 띄운다.

### Chips
- **Style:** 영수증 종이 바탕, 1.5px 괘선 테두리, 알약 모양, 0.875rem 500, 연한 먹 글자. 종류·시기 선택은 같은 모양에 6px 모서리. 예시 칩은 1px 점선 테두리에 0.8125rem, 투명 바탕.
- **State:** 선택되면 먹색 바탕에 흰 글자, '꼭 필요해서'만 선택 시 저금 초록 바탕. hover는 테두리와 글자가 진해진다. 초점은 초점 파랑 2px 선.

### Cards / Containers
- **Corner Style:** 10px.
- **Background:** 영수증 종이.
- **Shadow Strategy:** 종이 그림자 한 겹(Elevation & Depth 참고).
- **Border:** 그림자 없는 보조 칸은 1px 괘선. 빈 상태는 1.5px 괘선 점선에 가운데 정렬 안내와 '분석하러 가기' 링크.
- **Internal Padding:** 22px 안팎, 좌우는 clamp(16px, 4vw, 28~32px).

### Inputs / Fields
- **Style:** 종이 그늘 바탕, 1.5px 입력칸 테두리, 6px 모서리, 여백 11px 13px. 품목 입력칸은 1.5rem 600으로 크게, 금액 입력칸은 고정폭 숫자에 오른쪽 정렬하고 뒤에 '원'을 붙인다.
- **Focus:** 바깥 초점선 대신 테두리가 먹색으로, 바탕이 영수증 종이로 바뀐다.
- **Error / Disabled:** 오류는 테두리가 인주 빨강(`aria-invalid`).

### Navigation
- **Style, typography, default/hover/active states, mobile treatment.** 머리말 왼쪽에 로고 도장과 '지름신 퇴치소'(Black Han Sans 1.6rem). 오른쪽 탭 묶음은 계산대 그늘 바탕의 알약 안에 탭 셋이다. 탭은 연한 먹 0.875rem 600, 선택된 탭은 영수증 종이 바탕에 먹색 글자와 작은 그림자. 보류함·저금통 탭에는 개수 배지(인주 빨강·저금 초록 알약)가 붙는다. 좁은 화면에서는 로고와 탭이 줄을 바꿔 쌓인다.

### 판정 부적
결과의 첫 자리다. 괴황지 노랑 종이(3px 모서리)의 안쪽 8px에 부적 주사 빨강 1.5px 테두리를 반투명하게 두르고, 왼쪽에 판정 도장('결제 중지', '72시간 보류' 등), 오른쪽에 판정 문장(Headline), 한 줄 설명, 충동 지수(12px 알약 막대, 주사 빨강 채움), 점수 근거 접기를 둔다. 도장은 나타날 때 크게 찍혔다가 제자리에 앉는다(0.45초, `cubic-bezier(.2, .9, .3, 1.25)`). 560px 이하에서는 도장이 위, 글이 아래로 간다.

### 결제 전 영수증
영수증 종이에 고정폭 0.86rem, 제목은 0.3em 자간이다. 항목과 금액을 점 리더로 잇고, 빠지는 돈은 인주 빨강, '실제로 사라지는 돈'은 형광펜 노랑으로 강조한다. 아래에 바코드와 "이 영수증은 결제되지 않았습니다"가 있고, 맨 아래는 톱니로 찢긴 가장자리다. 공유용 영수증 이미지(폭 1080px)는 `src/card.js`가 같은 모양을 캔버스로 그린다.

### 세계 보유율 군중
사람 모양 점으로 '몇 명 중 한 명'을 보여 준다. 가진 사람은 인주 빨강, 갖지 않은 사람은 군중 점이다. 큰 숫자(Display, 인주 빨강)와 형광펜 강조 문장이 함께 온다. '~명만'은 20% 미만인 드문 품목에만 쓴다. 옷·가구 같은 생필품과 목적지 없는 여행은 견줄 통계가 없어서, 큰 숫자·군중 그림·극빈 기준선 없이 한 문장과 근거만 둔다.

### 결정 바
영수증 종이 바탕에 10px 모서리, 괘선 테두리와 종이 그림자. 화면 아래에 붙어 따라오며 참았어요(저금 초록), 보류 기간 선택과 보류함에 넣기, 그래도 살래요, 결과 복사를 담는다. 통과 판정이면 '그래도 살래요' 대신 '사기로 했어요'를 참았어요와 같은 저금 초록으로 둔다. 필요한 소비도 지킨 결정이라서다.

### 미래에서 온 편지
줄 공책 무늬 종이에 Nanum Pen Script 1.6rem, -0.5° 기울기. 서명 '— 1년 뒤의 나'는 인주 빨강으로 오른쪽에 둔다.

## Do's and Don'ts

### Do:
- **Do** 새 색을 만들기 전에 `src/style-1.css`의 기존 토큰을 쓴다. 토큰을 바꾸면 밝은 모드 블록과 어두운 모드 두 블록(`prefers-color-scheme: dark`, `[data-theme="dark"]`)을 함께 고치고, 글자 4.5:1·입력칸 테두리 3:1 대비를 두 모드에서 다시 계산한다.
- **Do** 어두운 모드 입력칸 테두리(`field`)는 지금 3.02:1로 기준에 겨우 맞으니, 바꿀 때 더 어둡게 하지 않는다.
- **Do** 토큰을 바꾸면 밝은 모드 값을 직접 적어 둔 `src/card.js`(공유 영수증 이미지), `src/og.html`(링크 미리보기 그림), `src/icon.html`(홈 화면 아이콘)도 함께 고친다.
- **Do** 금액과 시간은 고정폭 숫자로 오른쪽 정렬한다.
- **Do** 움직임은 도장 찍기, 동전 떨어지기, 막대 채우기처럼 비유에 맞는 짧은 것만 쓰고, 움직임 줄이기 설정(`prefers-reduced-motion`)에서는 끈다.
- **Do** 한국어 줄바꿈은 `word-break: keep-all`을 유지한다.

### Don't:
- **Don't** 귀신·공포처럼 겁주는 무속 분위기를 만들지 않는다(사용자 확정).
- **Don't** 인주 빨강으로 경고 띠, 넓은 배경, 여러 개의 경고 표시를 칠하지 않는다(사용자 확정: 경고문 같은 빨강 금지).
- **Don't** 빛나는 그림자, 그라데이션 글자, 무지개색 칩처럼 색과 효과를 늘려 알록달록한 게임 화면으로 만들지 않는다(사용자 확정).
- **Don't** 도장과 편지 말고 다른 요소를 기울이지 않는다.
- **Don't** Black Han Sans를 700으로 지정하거나 본문·긴 문장에 쓰지 않는다.
- **Don't** 판정 부적을 한 화면에 둘 이상 두거나, 괴황지 노랑을 다른 카드의 바탕으로 넓혀 쓰지 않는다.
