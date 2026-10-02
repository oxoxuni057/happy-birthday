# 🎂 Happy Birthday

픽셀 게임 감성으로 만든 생일 축하 웹페이지예요.
도망가는 촛불을 쫓아다니고, 카드를 뒤집고, 편지와 소원권을 받은 뒤 마지막 보스 스테이지에서 촛불을 끄면 끝!

<p align="center">
  <img src="intro.png" alt="인트로 화면" width="240">
</p>

## 🕹️ 스테이지 구성

| 페이지 | 내용 |
| --- | --- |
| 1. 인트로 | 이름표와 함께 시작 화면 |
| 2. 케이크 | 소원을 빌고 촛불을 누르면 촛불이 도망가요. 잡아서 끄기! |
| 3. 좋아하는 이유 | 카드를 눌러 뒤집으면 숨겨진 메시지가 나와요 |
| 4. 편지 | 생일 축하 편지 |
| 5. 소원권 | 아이템처럼 획득하는 쿠폰 3장 |
| 6. 최종 결전 | 촛불을 붙잡고 끄면 STAGE CLEAR 🎉 |

## ✨ 특징

- 레트로 픽셀 폰트 (한글 Galmuri / 영문 Press Start 2P)
- 캔버스로 그린 촛불 캐릭터와 랜덤 대사
- 점수 / `+100` / `ITEM GET!` 같은 게임 연출
- 클리어하면 꽃가루(confetti) 팡팡
- 모바일 화면 대응

## 🚀 실행 방법

별도 설치나 빌드 없이 `index.html`을 브라우저로 열면 바로 실행돼요.

GitHub Pages로 공유하려면:

1. 저장소 **Settings → Pages**
2. Source를 `Deploy from a branch`, 브랜치를 `main` / `/ (root)`로 선택
3. 잠시 후 `https://oxoxuni057.github.io/happy-birthday/` 에서 확인

## ✏️ 내 버전으로 바꾸기

코드 곳곳에 `✏️` 표시가 있는 곳만 고치면 돼요.

| 바꿀 것 | 위치 |
| --- | --- |
| 받는 사람 이름, 편지, 좋아하는 모습, 소원권, 안내 문구 | `index.html` |
| 촛불 대사, 게임 연출 문구, 점수 | `script.js` |
| 전체 색상 | `style.css` 맨 위 `:root` |
| 이미지 | 같은 이름의 파일로 교체 |

**이미지 파일**

- `intro.png` : 1페이지 첫 화면 (없으면 🎁 이모지로 표시)
- `cake.png` : 2페이지 케이크
- `grabber.png` : 6페이지 컷씬 인물
- `hand_grab.png` : 6페이지에서 촛불을 잡는 캐릭터

> 태그와 `class` / `id` / `onclick`은 그대로 두고, 태그 사이의 글자만 바꿔 주세요.

## 📁 파일 구조

```
happy-birthday/
├── index.html     # 페이지 구성과 문구
├── style.css      # 디자인 / 색상
├── script.js      # 게임 로직, 촛불 캐릭터
├── intro.png
├── cake.png
├── grabber.png
└── hand_grab.png
```

## 🛠️ 사용 기술

HTML · CSS · JavaScript (Canvas) · [canvas-confetti](https://github.com/catdad/canvas-confetti) · [Galmuri](https://github.com/quiple/galmuri) · [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P)
