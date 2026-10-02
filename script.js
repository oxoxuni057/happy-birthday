// ==========================================
// ✏️ 수정 가이드
//
// 페이지 내용(이름, 편지, 소원권 등)은 index.html 에서 고치면 돼요.
// 이 파일에서는 "✏️" 표시된 곳의 따옴표("...") 안 글자만 바꿔 주세요.
//
//   - 2페이지 촛불이 도망가기 시작할 때 문구   → catchCandle()
//   - 촛불이 도망 다니거나 잡혔을 때 하는 말   → triggerPokeCharacter()
//   - 6페이지 촛불 잡혔을 때 / 껐을 때 문구    → triggerGfGrab(), toggleFlameCharacter()
//   - MISS! / +100 / ITEM GET! / STAGE CLEAR!  → 바로 아래 GAME_TEXT
//   - 점수                                      → 바로 아래 SCORE
//
// 그 밖의 코드는 촛불 움직임과 위치 계산이라 건드리지 않는 걸 추천해요.
// ==========================================


// ==========================================
// ✏️ 게임 연출 문구 / 점수
// ==========================================

const GAME_TEXT = {
    wait: "WAIT!",               // 2페이지 촛불을 처음 눌렀을 때
    miss: "MISS!",               // 촛불이 도망갈 때
    itemGet: "ITEM GET!",        // 5페이지 소원권 획득
    stageClear: "STAGE<br>CLEAR!" // 6페이지 촛불을 껐을 때 (<br> 은 줄바꿈)
};

const SCORE = {
    card: 100,       // 3페이지 카드를 처음 뒤집을 때
    item: 300,       // 5페이지 소원권 획득
    clear: 1000      // 6페이지 촛불을 껐을 때
};


// ==========================================
// 1. 페이지 이동 & 진행바
// ==========================================

let currentPage = 1;
const totalPages = 6;

let isGrabbed = false;
let isExtinguished = false;
let hasStartedEscaping = false;
let hasAskedWish = false;

let score = 0;
let hasGotItems = false;


// ==========================================
// 게임 연출 : 점수 / 튀어나오는 글자 / STAGE CLEAR
// ==========================================

function addScore(amount) {

    score += amount;

    const scoreText =
        document.getElementById('scoreText');

    if (scoreText) {

        scoreText.textContent =
            String(score).padStart(6, '0');

    }
}


/*
 * target 요소 가운데에서 글자가 툭 튀어나왔다 사라짐.
 * type: '' (노랑) / 'miss' (흰색+빨강) / 'big' (크게)
 */
function popText(text, target, type = '') {

    const container =
        document.getElementById('appContainer');

    if (!container || !target) return;


    const box =
        container.getBoundingClientRect();

    const rect =
        target.getBoundingClientRect();


    const pop =
        document.createElement('span');

    pop.className =
        `pop-text ${type}`;

    pop.textContent =
        text;

    pop.style.left =
        `${rect.left - box.left - container.clientLeft + rect.width / 2}px`;

    pop.style.top =
        `${rect.top - box.top - container.clientTop + rect.height / 2}px`;


    container.appendChild(pop);

    setTimeout(() => pop.remove(), 1000);
}


function showStageClear() {

    const stageClear =
        document.getElementById('stageClear');

    const stageClearText =
        document.getElementById('stageClearText');

    if (!stageClear) return;


    if (stageClearText) {

        stageClearText.innerHTML =
            GAME_TEXT.stageClear;

    }

    stageClear.classList.remove('hidden');

    setTimeout(() => {

        stageClear.classList.add('hidden');

    }, 2700);
}


// ==========================================
// 3페이지 ? 블록 카드 뒤집기
// ==========================================

function flipCard(card) {

    card.classList.toggle('flipped');


    // 처음 뒤집을 때만 점수
    if (!card.dataset.scored) {

        card.dataset.scored = 'true';

        addScore(SCORE.card);

        popText(`+${SCORE.card}`, card);

    }
}


// ==========================================
// 페이지 업데이트
// ==========================================

function updatePage() {

    document.querySelectorAll('.page').forEach((page) => {
        page.classList.remove('active');
    });

    const activePage = document.getElementById(`page-${currentPage}`);

    if (activePage) {
        activePage.classList.add('active');
    }


    // 진행바
    const progressBar = document.getElementById('progressBar');

    if (progressBar) {
        progressBar.style.width =
            `${(currentPage / totalPages) * 100}%`;
    }


    // 스테이지 표시 (마지막 페이지는 BOSS)
    const stageLabel =
        document.getElementById('stageLabel');

    if (stageLabel) {

        const isBoss =
            currentPage === totalPages;

        stageLabel.textContent =
            isBoss
                ? 'BOSS STAGE'
                : `STAGE ${currentPage}/${totalPages}`;

        stageLabel.classList.toggle('boss', isBoss);

    }


    // 5페이지 첫 진입 : 소원권 획득 연출
    if (currentPage === 5 && !hasGotItems) {

        hasGotItems = true;

        setTimeout(() => {

            const list =
                document.querySelector('#page-5 .coupon-list');

            addScore(SCORE.item);

            popText(GAME_TEXT.itemGet, list, 'big');

        }, 700);

    }


    // 6페이지에서 잡아놓고 안 끄고 나가면 다시 풀어줌
    if (
        currentPage !== 6 &&
        isGrabbed &&
        !isExtinguished
    ) {

        releaseCandle();

    }


    // 촛불
    const candleContainer =
        document.getElementById('runawayCandle');

    if (candleContainer) {

        if (currentPage >= 2 && !isExtinguished) {

            candleContainer.style.display = 'block';


            // 2페이지 첫 진입
            if (currentPage === 2 && !hasStartedEscaping) {

                placeCandleOnCake();

            }

            // 이미 도망치기 시작했다면 랜덤 이동
            else if (!isGrabbed) {

                moveCandleRandomly();

            }

        } else {

            candleContainer.style.display = 'none';

        }
    }


    // 6페이지 진입하면 멱살잡이
    if (
        currentPage === 6 &&
        !isGrabbed &&
        !isExtinguished
    ) {

        setTimeout(triggerGfGrab, 500);

    }
}


// ==========================================
// 2페이지 케이크 위 촛불
// ==========================================

function placeCandleOnCake() {

    const candle =
        document.getElementById('runawayCandle');

    const cakeImg =
        document.getElementById('cakeImg');

    const page =
        document.getElementById('page-2');

    if (!candle || !cakeImg || !page) return;


    /*
     * 이미지가 없으면 이모지 대체 박스를 기준으로.
     */

    const cakeEl =
        cakeImg.offsetWidth > 0
            ? cakeImg
            : (cakeImg.nextElementSibling || cakeImg);


    /*
     * 페이지 전환 애니메이션(translateY) 중에도
     * 흔들리지 않도록 offset 기준으로 위치 계산.
     */

    let cakeLeft = 0;
    let cakeTop = 0;

    for (
        let el = cakeEl;
        el && el !== page;
        el = el.offsetParent
    ) {
        cakeLeft += el.offsetLeft;
        cakeTop += el.offsetTop;
    }


    const candleWidth =
        candle.offsetWidth;

    const candleHeight =
        candle.offsetHeight;


    /*
     * 촛불 발끝은 캔버스 높이의 약 90% 지점.
     * 발끝이 케이크 윗면(이미지 위쪽 35% 지점)에 닿도록 배치.
     */

    const feetY =
        candleHeight * 0.9;

    const cakeSurfaceY =
        cakeTop + cakeEl.offsetHeight * 0.35;


    candle.style.left =
        `${cakeLeft + (cakeEl.offsetWidth - candleWidth) / 2}px`;

    candle.style.top =
        `${cakeSurfaceY - feetY}px`;

    candle.style.transform =
        'none';
}


// ==========================================
// 다음 페이지
// ==========================================

function nextPage() {

    if (currentPage < totalPages) {

        currentPage++;

        updatePage();

    }
}


// ==========================================
// 이전 페이지
// ==========================================

function prevPage() {

    if (currentPage > 1) {

        currentPage--;

        updatePage();

    }
}


// ==========================================
// 3. 도망치는 촛불
// ==========================================

function moveCandleRandomly() {

    if (isGrabbed || isExtinguished) return;


    const candle =
        document.getElementById('runawayCandle');

    const container =
        document.querySelector('.app-container');


    if (!candle || !container) return;


    /*
     * 핵심:
     * 기존에는 130 / 170이라는 고정값을 사용했지만
     * 이제 실제 촛불 크기를 가져옴.
     */

    const containerWidth =
        container.clientWidth;

    const containerHeight =
        container.clientHeight;

    const candleWidth =
        candle.offsetWidth;

    const candleHeight =
        candle.offsetHeight;


    /*
     * 촛불이 화면 밖으로 나가지 않도록
     * 실제 크기를 고려해 이동 가능한 영역 계산.
     */

    const padding = 8;

    const minX = padding;

    const maxX =
        Math.max(
            minX,
            containerWidth - candleWidth - padding
        );


    /*
     * 상단 HUD(스테이지/점수/게이지) 아래에서부터 움직이도록 함.
     */

    const hud =
        document.querySelector('.hud');

    const minY =
        hud
            ? hud.offsetTop + hud.offsetHeight + 8
            : 80;

    const maxY =
        Math.max(
            minY,
            containerHeight - candleHeight - padding
        );


    const randomX =
        Math.floor(
            Math.random() * (maxX - minX + 1)
        ) + minX;


    const randomY =
        Math.floor(
            Math.random() * (maxY - minY + 1)
        ) + minY;


    candle.style.left =
        `${randomX}px`;

    candle.style.top =
        `${randomY}px`;

    candle.style.transform =
        'none';


    triggerPokeCharacter(1.2, false);
}


// ==========================================
// 4. 멱살잡이 컷씬
// ==========================================

function triggerGfGrab() {

    // 컷씬 시작 전에 다른 페이지로 나갔으면 취소
    if (
        currentPage !== 6 ||
        isGrabbed ||
        isExtinguished
    ) return;


    const gfGrab =
        document.getElementById('gfGrab');

    const candle =
        document.getElementById('runawayCandle');

    const finalStatus =
        document.getElementById('finalStatus');

    const container =
        document.getElementById('appContainer');


    if (gfGrab) {

        gfGrab.classList.remove('hidden');

    }


    // 화면 흔들림
    if (container) {

        container.classList.add('screen-shake');

        setTimeout(() => {

            container.classList.remove('screen-shake');

        }, 300);

    }


    // 컷씬 종료
    setTimeout(() => {

        if (gfGrab) {

            gfGrab.classList.add('hidden');

        }


        // 컷씬 도중 다른 페이지로 나갔으면 잡지 않음
        if (currentPage !== 6) return;


        isGrabbed = true;


        if (candle) {

            candle.classList.add('grabbed');

            placeGrabbedCandle();

        }


        if (finalStatus) {

            finalStatus.innerText =
                // ✏️ 6페이지: 촛불이 붙잡혔을 때 안내 문구
                "잡았다! 이제 촛불을 눌러서 꺼 줘.";

        }


        state.isRaging = true;

        triggerPokeCharacter(2.0, true);

    }, 1800);
}


// ==========================================
// 잡힌 촛불 풀어주기
// ==========================================

function releaseCandle() {

    isGrabbed = false;

    state.isRaging = false;


    const candle =
        document.getElementById('runawayCandle');

    if (candle) {

        candle.classList.remove('grabbed');

    }


    const finalStatus =
        document.getElementById('finalStatus');

    if (finalStatus) {

        finalStatus.innerText =
            // ✏️ index.html 6페이지 finalStatus 첫 문구와 똑같이 맞춰 주세요
            "드디어 촛불을 따라잡았다...!";

    }
}


// ==========================================
// 6페이지 잡힌 촛불 위치
// ==========================================

function placeGrabbedCandle() {

    const candle =
        document.getElementById('runawayCandle');

    const container =
        document.getElementById('appContainer');

    const finalStatus =
        document.getElementById('finalStatus');

    const finalMsg =
        document.getElementById('finalMsgText');

    if (!candle || !container) return;


    const candleWidth =
        candle.offsetWidth;

    const candleHeight =
        candle.offsetHeight;


    /*
     * 왼쪽에 햄스터가 붙으므로
     * 햄스터+촛불 묶음이 가운데 오도록 살짝 오른쪽으로.
     */

    candle.style.left =
        `${(container.clientWidth - candleWidth) / 2 + candleWidth * 0.25}px`;


    /*
     * 안내 문구와 마지막 메시지 사이 빈 공간의 가운데에 배치.
     * offset 기준이라 페이지 전환 애니메이션 중에도 정확함.
     */

    let candleTop =
        container.clientHeight * 0.32;

    if (finalStatus && finalMsg) {

        const statusBottom =
            finalStatus.offsetTop + finalStatus.offsetHeight;

        const msgTop =
            finalMsg.offsetTop;

        candleTop =
            Math.max(
                statusBottom + 12,
                statusBottom + (msgTop - statusBottom - candleHeight) / 2
            );

    }

    candle.style.top =
        `${candleTop}px`;

    candle.style.transform =
        'none';
}


// ==========================================
// 5. 촛불 클릭
// ==========================================

function catchCandle() {

    if (isExtinguished) return;


    const candle =
        document.getElementById('runawayCandle');


    /*
     * 이미 잡혔다면 바로 촛불 끄기
     * (2페이지에서 촛불을 안 누르고 넘어온 경우 포함)
     */

    if (isGrabbed) {

        toggleFlameCharacter();

        return;
    }


    const statusMsg =
        document.getElementById('statusMsg2');


    /*
     * 첫 클릭 : 바로 도망가지 않고 소원 빌었는지 한 번 물어봄.
     */

    if (!hasAskedWish) {

        hasAskedWish = true;

        if (statusMsg) {

            statusMsg.innerText =
                // ✏️ 2페이지: 촛불을 처음 눌렀을 때 (아직 도망 안 감)
                "잠깐, 소원 빌었어? 간절하게 소원을 빌고, 다시 촛불을 누르자!";

        }

        popText(GAME_TEXT.wait, candle);

        // 살짝 움찔 (말풍선 없이)
        state.shakeAmount = 10;

        return;
    }


    /*
     * 두 번째 클릭부터 도망치기 시작.
     */

    if (!hasStartedEscaping) {

        hasStartedEscaping = true;


        if (statusMsg) {

            statusMsg.innerText =
                // ✏️ 2페이지: 소원 빌고 다시 눌러서 촛불이 도망가기 시작할 때
                "어라, 촛불이 도망갔다. 잡아 봐!";

        }
    }


    // 도망가기 전 자리에 MISS!
    popText(GAME_TEXT.miss, candle, 'miss');

    moveCandleRandomly();
}


// ==========================================
// 6. 촛불 Canvas 캐릭터
// ==========================================

let canvas;
let ctx;


const state = {

    isLit: true,

    isRaging: false,

    derp: 5,

    shakeAmount: 0,

    squashX: 1,

    squashY: 1,

    squashVelX: 0,

    squashVelY: 0,

    time: 0

};


const floatingTexts = [];


const earLeft = {
    angle: 0,
    aVel: 0,
    len: 16
};


const earRight = {
    angle: 0,
    aVel: 0,
    len: 16
};


// ==========================================
// Canvas 초기화
// ==========================================

function initCandleCharacter() {

    canvas =
        document.getElementById('candleCanvas');

    if (!canvas) return;

    ctx =
        canvas.getContext('2d');

    renderFrame();
}


// ==========================================
// 캐릭터 흔들림
// ==========================================

function triggerPokeCharacter(
    intensity = 1.0,
    isRage = false
) {

    state.shakeAmount =
        18 * intensity;

    state.squashVelY =
        -0.35 * intensity;

    state.squashVelX =
        0.3 * intensity;


    earLeft.aVel +=
        (Math.random() - 0.5) *
        0.8 *
        intensity;


    earRight.aVel +=
        (Math.random() - 0.5) *
        0.8 *
        intensity;


    if (isRage) {

        state.isRaging = true;

        state.isLit = true;

    }


    /*
     * ✏️ 촛불이 하는 말 (랜덤으로 하나씩 튀어나옴)
     * 캔버스 폭이 좁아서 7글자 안쪽이 잘 보여요.
     */

    const texts =
        state.isRaging
            ? [
                // 6페이지에서 붙잡혔을 때
                "놔라!!",
                "살려 줘!",
                "으아악!!",
            ]
            : [
                // 도망 다닐 때
                "못 잡죠?",
                "응 안 돼~",
                "느려 ㅋ",
                "ㅋㅋ",
                "피했죠~"
            ];


    const text =
        texts[
            Math.floor(
                Math.random() * texts.length
            )
        ];


    floatingTexts.push({

        x: 60,

        y: 20,

        vx:
            (Math.random() - 0.5) *
            0.5,

        vy: -0.5,

        text: text,

        life: 1.0,

        decay: 0.006,

        color:
            state.isRaging
                ? '#ff1100'
                : '#000000'

    });
}


// ==========================================
// 촛불 끄기
// ==========================================

function toggleFlameCharacter() {

    state.isLit = false;

    state.isRaging = false;

    isExtinguished = true;


    const finalStatus =
        document.getElementById('finalStatus');


    if (finalStatus) {

        finalStatus.innerText =
            // ✏️ 6페이지: 촛불을 끈 뒤 문구
            "🎉 소원 접수 완료. 꼭 이루어질 거야!";

    }


    // 점수 + STAGE CLEAR!
    addScore(SCORE.clear);

    popText(
        `+${SCORE.clear}`,
        document.getElementById('runawayCandle'),
        'big'
    );

    showStageClear();


    /*
     * confetti가 없는 상황에서도
     * 전체 페이지가 깨지지 않도록 체크.
     */

    if (typeof confetti === 'function') {

        confetti({

            particleCount: 150,

            spread: 90,

            origin: {
                y: 0.6
            }

        });

    }
}


// ==========================================
// 눈꽃 모양
// ==========================================

function drawSnowflakeShape(
    c,
    x,
    y,
    radius,
    angle,
    color
) {

    c.save();

    c.translate(x, y);

    c.rotate(angle);

    c.strokeStyle =
        color || '#3186ff';

    c.lineWidth = 1.5;

    c.beginPath();


    for (let i = 0; i < 6; i++) {

        c.rotate(Math.PI / 3);

        c.moveTo(0, 0);

        c.lineTo(0, radius);

        c.moveTo(
            0,
            radius * 0.5
        );

        c.lineTo(
            radius * 0.3,
            radius * 0.7
        );

        c.moveTo(
            0,
            radius * 0.5
        );

        c.lineTo(
            -radius * 0.3,
            radius * 0.7
        );

    }


    c.stroke();

    c.restore();
}


// ==========================================
// Canvas 렌더링
// ==========================================

function renderFrame() {

    if (!canvas) return;


    requestAnimationFrame(renderFrame);


    /*
     * Canvas 내부 좌표는 기존 디자인 그대로 유지.
     *
     * 실제 화면에서는 CSS가 Canvas를
     * 모바일 크기에 맞게 축소.
     */

    const w = 120;
    const h = 160;


    /*
     * 그리는 좌표는 120x160 기준 그대로 두고,
     * 실제 픽셀 수만 화면 표시 크기 × 기기 배율만큼 키워서
     * 큰 화면이나 레티나 화면에서도 흐리지 않게 함.
     */

    const pixelRatio =
        Math.min(
            3,
            Math.max(
                1,
                (window.devicePixelRatio || 1) *
                ((canvas.clientWidth || w) / w)
            )
        );

    const pixelW =
        Math.round(w * pixelRatio);

    const pixelH =
        Math.round(h * pixelRatio);

    if (
        canvas.width !== pixelW ||
        canvas.height !== pixelH
    ) {

        canvas.width = pixelW;
        canvas.height = pixelH;

    }


    /*
     * 이전 프레임에서 save/restore가 어긋나도
     * 좌표가 누적되지 않도록 매 프레임 초기화.
     */

    ctx.setTransform(
        canvas.width / w,
        0,
        0,
        canvas.height / h,
        0,
        0
    );

    ctx.clearRect(
        0,
        0,
        w,
        h
    );


    state.time += 0.03;


    // 잡힌 상태
    if (
        isGrabbed &&
        !isExtinguished
    ) {

        state.isRaging = true;

        state.shakeAmount =
            Math.max(
                state.shakeAmount,
                10 +
                Math.sin(
                    state.time * 20
                ) * 6
            );

    }


    // 몸통 탄성
    const k = 0.15;
    const damp = 0.82;


    state.squashVelX =
        (
            state.squashVelX -
            k * (state.squashX - 1)
        ) * damp;


    state.squashX +=
        state.squashVelX;


    state.squashVelY =
        (
            state.squashVelY -
            k * (state.squashY - 1)
        ) * damp;


    state.squashY +=
        state.squashVelY;


    // 몸통이 납작해지다 못해 뒤집히지 않도록 제한
    state.squashX =
        Math.min(1.8, Math.max(0.4, state.squashX));

    state.squashY =
        Math.min(1.8, Math.max(0.4, state.squashY));


    // 흔들림
    let offsetX = 0;
    let offsetY = 0;


    if (state.shakeAmount > 0.1) {

        offsetX =
            (Math.random() - 0.5) *
            state.shakeAmount;

        offsetY =
            (Math.random() - 0.5) *
            state.shakeAmount;

        state.shakeAmount *= 0.92;

    }


    const candleX =
        w / 2 + offsetX;


    const candleY =
        h / 2 + 5 + offsetY;


    const bodyW =
        58 * state.squashX;


    const bodyH =
        78 * state.squashY;


    // ==========================================
    // 1. 다리
    // ==========================================

    const legWiggle =
        state.isRaging
            ? Math.sin(state.time * 30) * 11
            : (
                state.isLit
                    ? Math.sin(state.time * 6) * 3.5
                    : 0
            );


    ctx.save();

    ctx.translate(
        candleX,
        candleY + bodyH / 2 - 4
    );

    ctx.lineWidth = 3.8;

    ctx.strokeStyle = '#e6b800';

    ctx.lineCap = 'round';


    ctx.beginPath();

    ctx.moveTo(-14, 0);

    ctx.quadraticCurveTo(
        -19 + legWiggle,
        14,
        -15 + legWiggle,
        23
    );

    ctx.stroke();


    ctx.fillStyle = '#ff4c45';

    ctx.beginPath();

    ctx.ellipse(
        -19 + legWiggle,
        24,
        5.5,
        3.8,
        -0.2,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.beginPath();

    ctx.moveTo(14, 0);

    ctx.quadraticCurveTo(
        19 - legWiggle,
        14,
        15 - legWiggle,
        23
    );

    ctx.stroke();


    ctx.fillStyle = '#ff4c45';

    ctx.beginPath();

    ctx.ellipse(
        19 - legWiggle,
        24,
        5.5,
        3.8,
        0.2,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.restore();


    // ==========================================
    // 2. 몸통
    // ==========================================

    ctx.save();

    ctx.translate(
        candleX,
        candleY
    );


    const candleGrad =
        ctx.createLinearGradient(
            -bodyW / 2,
            0,
            bodyW / 2,
            0
        );


    if (!state.isLit) {

        candleGrad.addColorStop(
            0,
            '#d8d2b8'
        );

        candleGrad.addColorStop(
            0.5,
            '#e6e0cc'
        );

        candleGrad.addColorStop(
            1,
            '#c2bc9f'
        );

    }

    else if (state.isRaging) {

        candleGrad.addColorStop(
            0,
            '#ffcc00'
        );

        candleGrad.addColorStop(
            0.5,
            '#fff066'
        );

        candleGrad.addColorStop(
            1,
            '#ff9900'
        );

    }

    else {

        candleGrad.addColorStop(
            0,
            '#fff4b8'
        );

        candleGrad.addColorStop(
            0.3,
            '#fffbe6'
        );

        candleGrad.addColorStop(
            0.8,
            '#ffe875'
        );

        candleGrad.addColorStop(
            1,
            '#ebd047'
        );

    }


    ctx.fillStyle =
        candleGrad;

    ctx.strokeStyle =
        state.isLit
            ? '#d4b216'
            : '#99927d';

    ctx.lineWidth = 2.5;


    const topY =
        -bodyH / 2;

    const botY =
        bodyH / 2;

    const halfW =
        bodyW / 2;


    ctx.beginPath();

    ctx.moveTo(
        -halfW,
        topY + 8
    );

    ctx.quadraticCurveTo(
        -halfW,
        botY,
        -halfW + 8,
        botY
    );

    ctx.lineTo(
        halfW - 8,
        botY
    );

    ctx.quadraticCurveTo(
        halfW,
        botY,
        halfW,
        topY + 8
    );

    ctx.lineTo(
        halfW,
        topY
    );

    ctx.lineTo(
        -halfW,
        topY
    );

    ctx.closePath();

    ctx.fill();
    ctx.stroke();


    ctx.fillStyle =
        state.isLit
            ? '#fffae0'
            : '#cfc9b4';


    ctx.beginPath();

    // 세게 찌그러질 때 반지름이 음수가 되면 ellipse가 에러를 냄
    ctx.ellipse(
        0,
        topY,
        Math.max(0, halfW),
        Math.max(0, 7 * state.squashY),
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();
    ctx.stroke();


    // ==========================================
    // 3. 표정
    // ==========================================

    const eyeY =
        topY +
        bodyH *
        (
            state.isLit
                ? 0.38
                : 0.45
        );


    const lookX =
        Math.sin(state.time * 3) * 2;


    const lookY =
        Math.cos(state.time * 2) * 1.5;


    if (state.isRaging) {

        ctx.fillStyle = '#ffffff';

        ctx.strokeStyle = '#000000';

        ctx.lineWidth = 1.5;


        ctx.beginPath();

        ctx.arc(
            -10,
            eyeY,
            9.5,
            0,
            Math.PI * 2
        );

        ctx.fill();
        ctx.stroke();


        ctx.fillStyle = '#ff0000';

        ctx.beginPath();

        ctx.arc(
            -10 +
            (Math.random() - 0.5) * 3,
            eyeY +
            (Math.random() - 0.5) * 3,
            3.5,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.fillStyle = '#ffffff';

        ctx.beginPath();

        ctx.arc(
            11,
            eyeY,
            7,
            0,
            Math.PI * 2
        );

        ctx.fill();
        ctx.stroke();


        ctx.fillStyle = '#000000';

        ctx.beginPath();

        ctx.arc(
            11,
            eyeY,
            1.8,
            0,
            Math.PI * 2
        );

        ctx.fill();

    }

    else if (!state.isLit) {

        ctx.strokeStyle =
            '#2c2c3a';

        ctx.lineWidth = 2.2;

        ctx.lineCap = 'round';


        ctx.beginPath();

        ctx.arc(
            -11,
            eyeY + 1,
            6.5,
            Math.PI * 1.15,
            Math.PI * 1.85
        );

        ctx.stroke();


        ctx.beginPath();

        ctx.arc(
            11,
            eyeY + 1,
            6.5,
            Math.PI * 1.15,
            Math.PI * 1.85
        );

        ctx.stroke();

    }

    else {

        ctx.fillStyle = '#ffffff';

        ctx.strokeStyle = '#222222';

        ctx.lineWidth = 1.5;


        ctx.beginPath();

        ctx.arc(
            -10,
            eyeY,
            9,
            0,
            Math.PI * 2
        );

        ctx.fill();
        ctx.stroke();


        ctx.fillStyle = '#111111';

        ctx.beginPath();

        ctx.arc(
            -10 + lookX,
            eyeY + lookY,
            3.2,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.fillStyle = '#ffffff';

        ctx.beginPath();

        ctx.arc(
            11,
            eyeY - 1,
            7,
            0,
            Math.PI * 2
        );

        ctx.fill();
        ctx.stroke();


        ctx.fillStyle = '#111111';

        ctx.beginPath();

        ctx.arc(
            11 + lookX,
            eyeY + lookY,
            2.2,
            0,
            Math.PI * 2
        );

        ctx.fill();


        const mouthY =
            eyeY + 11;


        ctx.strokeStyle =
            '#222222';

        ctx.lineWidth = 1.5;


        ctx.beginPath();

        ctx.arc(
            1,
            mouthY,
            7.5,
            0.1,
            Math.PI - 0.1,
            false
        );

        ctx.stroke();


        ctx.fillStyle =
            '#ff7b7b';


        ctx.beginPath();

        ctx.arc(
            4,
            mouthY + 2,
            3.2,
            0,
            Math.PI * 2
        );

        ctx.fill();

    }


    // ==========================================
    // 4. 귀걸이
    // ==========================================

    const earLX =
        -halfW - 2;

    const earLY =
        topY + 8;


    earLeft.aVel =
        (
            earLeft.aVel +
            (-0.4 / earLeft.len) *
            Math.sin(earLeft.angle)
        ) * 0.95;


    earLeft.angle +=
        earLeft.aVel;


    const endLX =
        earLX +
        Math.sin(earLeft.angle) *
        earLeft.len;


    const endLY =
        earLY +
        Math.cos(earLeft.angle) *
        earLeft.len;


    ctx.strokeStyle =
        '#3186ff';

    ctx.lineWidth = 1.2;


    ctx.beginPath();

    ctx.moveTo(
        earLX,
        earLY
    );

    ctx.lineTo(
        endLX,
        endLY
    );

    ctx.stroke();


    drawSnowflakeShape(
        ctx,
        endLX,
        endLY,
        5,
        earLeft.angle * 2,
        '#3186ff'
    );


    const earRX =
        halfW + 2;

    const earRY =
        topY + 8;


    earRight.aVel =
        (
            earRight.aVel +
            (-0.4 / earRight.len) *
            Math.sin(earRight.angle)
        ) * 0.95;


    earRight.angle +=
        earRight.aVel;


    const endRX =
        earRX +
        Math.sin(earRight.angle) *
        earRight.len;


    const endRY =
        earRY +
        Math.cos(earRight.angle) *
        earRight.len;


    ctx.beginPath();

    ctx.moveTo(
        earRX,
        earRY
    );

    ctx.lineTo(
        endRX,
        endRY
    );

    ctx.stroke();


    drawSnowflakeShape(
        ctx,
        endRX,
        endRY,
        5,
        earRight.angle * 2,
        '#3186ff'
    );


    // ==========================================
    // 5. 불꽃
    // ==========================================

    const wickX = 0;

    const wickY =
        topY - 2;


    ctx.strokeStyle =
        '#333333';

    ctx.lineWidth = 2;


    ctx.beginPath();

    ctx.moveTo(
        wickX,
        wickY
    );

    ctx.lineTo(
        wickX,
        wickY - 7
    );

    ctx.stroke();


    if (state.isLit) {

        const flameX =
            wickX;

        const flameY =
            wickY - 8;


        const flameH =
            state.isRaging
                ? 32
                : 22;


        ctx.fillStyle =
            state.isRaging
                ? '#ff2200'
                : '#ff9900';


        ctx.beginPath();

        ctx.moveTo(
            flameX - 6,
            flameY
        );

        ctx.quadraticCurveTo(
            flameX - 7,
            flameY - flameH * 0.6,
            flameX,
            flameY - flameH
        );

        ctx.quadraticCurveTo(
            flameX + 7,
            flameY - flameH * 0.6,
            flameX + 6,
            flameY
        );

        ctx.closePath();

        ctx.fill();


        ctx.fillStyle =
            '#ffffff';


        ctx.beginPath();

        ctx.moveTo(
            flameX - 3,
            flameY
        );

        ctx.quadraticCurveTo(
            flameX - 3.5,
            flameY - flameH * 0.4,
            flameX,
            flameY - flameH * 0.65
        );

        ctx.quadraticCurveTo(
            flameX + 3.5,
            flameY - flameH * 0.4,
            flameX + 3,
            flameY
        );

        ctx.closePath();

        ctx.fill();

    }


    // ==========================================
    // 6. 멱살 / 손
    // ==========================================

    /*
     * 햄스터 이미지는 캔버스 밖으로 나가면 잘리므로
     * HTML의 .candle-grabber 이미지로 표시.
     * 이미지가 없을 때만 주먹 이모지로 대체.
     */

    if (
        isGrabbed &&
        !document.querySelector('.candle-grabber')
    ) {

        ctx.save();

        ctx.font =
            "bold 52px sans-serif";

        ctx.textAlign =
            'center';

        ctx.textBaseline =
            'middle';


        ctx.fillText(
            "✊",
            -halfW - 20,
            topY + bodyH * 0.45
        );

        ctx.restore();

    }


    ctx.restore();


    // ==========================================
    // 7. 떠다니는 텍스트
    // ==========================================

    for (
        let i = floatingTexts.length - 1;
        i >= 0;
        i--
    ) {

        const txt =
            floatingTexts[i];


        txt.x += txt.vx;

        txt.y += txt.vy;

        txt.life -= txt.decay;


        if (txt.life <= 0) {

            floatingTexts.splice(
                i,
                1
            );

            continue;

        }


        ctx.save();


        ctx.font =
            "900 15px 'Pretendard', sans-serif";

        ctx.textAlign =
            'center';


        ctx.strokeStyle =
            '#FFFFFF';

        ctx.lineWidth = 6;

        ctx.lineJoin =
            'round';


        ctx.strokeText(
            txt.text,
            txt.x,
            txt.y
        );


        ctx.fillStyle =
            txt.color;


        ctx.fillText(
            txt.text,
            txt.x,
            txt.y
        );


        ctx.restore();

    }
}


// ==========================================
// 모바일 회전 / 화면 크기 변경 대응
// ==========================================

let resizeTimer;


window.addEventListener(
    'resize',
    () => {

        clearTimeout(resizeTimer);


        resizeTimer =
            setTimeout(() => {

                /*
                 * 화면이 회전하거나
                 * 모바일 브라우저 주소창이 사라질 때
                 * 촛불 위치를 다시 계산.
                 */

                // 6페이지에서 잡힌 촛불 (불 꺼진 뒤 포함)
                if (currentPage === 6 && isGrabbed) {

                    placeGrabbedCandle();

                }

                else if (
                    currentPage >= 2 &&
                    !isGrabbed &&
                    !isExtinguished
                ) {

                    if (hasStartedEscaping) {

                        moveCandleRandomly();

                    }

                    else {

                        placeCandleOnCake();

                    }

                }

            }, 150);

    }
);


// ==========================================
// 페이지 로드
// ==========================================

window.onload = () => {

    initCandleCharacter();

    updatePage();


    // 케이크 이미지가 늦게 로드되면 촛불 위치 다시 맞춤
    const cakeImg =
        document.getElementById('cakeImg');

    if (cakeImg) {

        cakeImg.addEventListener('load', () => {

            if (currentPage === 2 && !hasStartedEscaping) {

                placeCandleOnCake();

            }

        });

    }


    // 픽셀 폰트가 늦게 로드되면 글자 크기가 바뀌므로 촛불 위치 다시 맞춤
    if (document.fonts && document.fonts.ready) {

        document.fonts.ready.then(() => {

            if (currentPage === 2 && !hasStartedEscaping) {

                placeCandleOnCake();

            }

            else if (currentPage === 6 && isGrabbed) {

                placeGrabbedCandle();

            }

        });

    }

};

/* ==========================================
   편지 전체를 이미지(PNG)로 저장
   (스크롤에 가려진 부분까지 전부 한 장으로)
========================================== */

async function saveLetter() {

    const btn = document.getElementById('saveLetterBtn');
    const letter = document.querySelector('#page-4 .letter-box');

    if (!letter || typeof html2canvas !== 'function') {

        alert('이미지 저장을 불러오지 못했어. 인터넷 연결을 확인해 줘!');
        return;

    }

    const label = btn.textContent;
    btn.disabled = true;
    btn.textContent = '저장 중...';

    // 화면 밖에 편지 복사본을 펼쳐 놓고 찍기 (스크롤/기울기 제거)
    const wrap = document.createElement('div');
    wrap.style.cssText =
        'position:fixed; left:-10000px; top:0; width:440px;' +
        'padding:28px 24px 34px; background:#3b2a7a;';

    const clone = letter.cloneNode(true);
    clone.style.maxHeight = 'none';
    clone.style.overflow = 'visible';
    clone.style.transform = 'none';
    clone.style.fontSize = '14px';

    wrap.appendChild(clone);
    document.body.appendChild(wrap);

    try {

        if (document.fonts && document.fonts.ready) {
            await document.fonts.ready;
        }

        const canvas = await html2canvas(wrap, {
            scale: 2,
            backgroundColor: null,
            useCORS: true
        });

        const blob = await new Promise(resolve =>
            canvas.toBlob(resolve, 'image/png')
        );

        const fileName = 'birthday-letter.png';

        // PC·모바일 모두 공유 시트 없이 바로 파일로 다운로드
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);

    } catch (err) {

        console.error(err);
        alert('이미지 저장에 실패했어. 다시 한 번 눌러 줘!');

    } finally {

        wrap.remove();
        btn.disabled = false;
        btn.textContent = label;

    }

}
