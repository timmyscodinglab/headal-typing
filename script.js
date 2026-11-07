const exercises = {
  words: [
    "바다", "하늘", "구름", "바람", "햇살", "나무", "꽃잎", "새싹", "고양이", "강아지",
    "토끼", "다람쥐", "기차", "자동차", "자전거", "우산", "가방", "연필", "공책", "책상",
    "의자", "창문", "학교", "도서관", "친구", "가족", "마음", "웃음", "노래", "음악",
    "그림", "사진", "여행", "소풍", "운동", "수박", "사과", "딸기", "고구마", "국수",
    "우유", "과자", "시계", "열쇠", "편지", "약속", "희망", "행복", "지구", "우주"
  ],
  sentences: [
    "아침 햇살이 창문으로 들어와 방 안을 환하게 비추었다.",
    "작은 새 한 마리가 나뭇가지에 앉아 맑은 노래를 불렀다.",
    "나는 도서관에서 재미있는 책을 빌려 집으로 돌아왔다.",
    "따뜻한 바람이 불어와 꽃잎이 천천히 길 위에 내려앉았다.",
    "친구와 함께 공원에서 자전거를 타며 즐거운 시간을 보냈다.",
    "할머니께서 직접 구워 주신 고구마는 달콤하고 맛있었다.",
    "비가 그친 뒤 하늘에 아름다운 무지개가 나타났다.",
    "우리 가족은 주말마다 새로운 곳으로 산책을 나간다.",
    "바닷가 모래 위에 작은 발자국이 길게 이어져 있었다.",
    "고양이는 햇볕이 잘 드는 창가에서 낮잠을 자고 있었다.",
    "학교 화단에 심은 씨앗에서 초록색 새싹이 자라났다.",
    "저녁이 되자 하늘에 반짝이는 별들이 하나둘 나타났다.",
    "동생은 색연필로 커다란 나무와 파란 하늘을 그렸다.",
    "오늘 배운 새로운 낱말을 공책에 정성껏 적어 두었다.",
    "시원한 수박을 나누어 먹으며 여름 더위를 식혔다.",
    "기차 창밖으로 들판과 작은 마을이 빠르게 지나갔다.",
    "우산을 챙겨 나왔더니 갑자기 내린 비에도 걱정이 없었다.",
    "좋아하는 노래를 들으니 마음이 한결 가벼워졌다.",
    "우리는 길가에 떨어진 쓰레기를 주워 깨끗하게 정리했다.",
    "오늘도 꾸준히 연습한 나 자신을 칭찬해 주고 싶다."
  ]
};

const screens = {
  home: document.querySelector("#home-screen"),
  select: document.querySelector("#select-screen"),
  practice: document.querySelector("#practice-screen"),
  complete: document.querySelector("#complete-screen")
};
const startButton = document.querySelector("#start-button");
const modeButtons = document.querySelectorAll("[data-mode]");
const answerForm = document.querySelector("#answer-form");
const answerInput = document.querySelector("#answer-input");
const promptCard = document.querySelector("#prompt-card");
const promptText = document.querySelector("#prompt-text");
const feedback = document.querySelector("#feedback");
const progressLabel = document.querySelector("#progress-label");
const progressTrack = document.querySelector(".progress-track");
const progressFill = document.querySelector("#progress-fill");
const timerValue = document.querySelector("#timer-value");
const wpmValue = document.querySelector("#wpm-value");
const practiceModeLabel = document.querySelector("#practice-mode-label");
const finalTime = document.querySelector("#final-time");

let currentMode;
let currentIndex = 0;
let completedCharacters = 0;
let startedAt = 0;
let timerInterval;
let transitioning = false;

function showScreen(name) {
  Object.entries(screens).forEach(([screenName, element]) => {
    element.hidden = screenName !== name;
  });
}

function formatTime(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function updatePracticeStats() {
  const elapsed = Date.now() - startedAt;
  timerValue.textContent = formatTime(elapsed);
  const elapsedMinutes = elapsed / 60000;
  const wpm = elapsedMinutes > 0
    ? Math.round(completedCharacters / 5 / elapsedMinutes)
    : 0;
  wpmValue.textContent = String(wpm);
}

function setFeedback(message, kind = "") {
  feedback.textContent = message;
  feedback.className = `feedback${kind ? ` ${kind}` : ""}`;
}

function renderPrompt(animate = false) {
  const items = exercises[currentMode];
  const prompt = items[currentIndex];
  promptText.textContent = prompt;
  promptCard.classList.toggle("is-long", currentMode === "sentences");
  progressLabel.textContent = `${currentIndex + 1} / ${items.length}`;
  progressTrack.setAttribute("aria-valuemax", String(items.length));
  progressTrack.setAttribute("aria-valuenow", String(currentIndex));
  progressFill.style.width = `${(currentIndex / items.length) * 100}%`;
  if (animate) {
    promptCard.classList.remove("slide-in");
    void promptCard.offsetWidth;
    promptCard.classList.add("slide-in");
  }
}

function startExercise(mode) {
  currentMode = mode;
  currentIndex = 0;
  completedCharacters = 0;
  transitioning = false;
  startedAt = Date.now();
  window.clearInterval(timerInterval);
  timerValue.textContent = "00:00";
  wpmValue.textContent = "0";
  practiceModeLabel.textContent = mode === "words" ? "낱말 연습 · 50개" : "장문 연습 · 20개";
  renderPrompt();
  setFeedback("입력을 마치면 Enter를 눌러 주세요.");
  answerInput.value = "";
  showScreen("practice");
  timerInterval = window.setInterval(() => {
    updatePracticeStats();
  }, 250);
  answerInput.focus();
}

function playErrorSound() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const context = new AudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = 440;
  gain.gain.setValueAtTime(0.13, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.18);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.18);
  oscillator.addEventListener("ended", () => context.close(), { once: true });
}

function markWrong() {
  setFeedback("앗, 글자가 달라요. 다시 확인해 보세요.", "error");
  promptCard.classList.remove("shake");
  void promptCard.offsetWidth;
  promptCard.classList.add("shake");
  playErrorSound();
}

function finishExercise() {
  window.clearInterval(timerInterval);
  const elapsed = Date.now() - startedAt;
  timerValue.textContent = formatTime(elapsed);
  updatePracticeStats();
  finalTime.textContent = formatTime(elapsed);
  progressTrack.setAttribute("aria-valuenow", String(exercises[currentMode].length));
  progressFill.style.width = "100%";
  showScreen("complete");
  document.querySelector("#retry-button").focus();
}

function submitAnswer(event) {
  event.preventDefault();
  if (transitioning) return;

  if (answerInput.value.trim() !== exercises[currentMode][currentIndex]) {
    markWrong();
    return;
  }

  completedCharacters += exercises[currentMode][currentIndex].length;
  currentIndex += 1;
  if (currentIndex === exercises[currentMode].length) {
    finishExercise();
    return;
  }

  transitioning = true;
  setFeedback("좋아요! 다음 글자를 입력해 보세요.", "success");
  window.setTimeout(() => {
    renderPrompt(true);
    answerInput.value = "";
    setFeedback("입력을 마치면 Enter를 눌러 주세요.");
    answerInput.focus();
    transitioning = false;
  }, 250);
}

startButton.addEventListener("click", () => showScreen("select"));
modeButtons.forEach((button) => {
  button.addEventListener("click", () => startExercise(button.dataset.mode));
});
answerForm.addEventListener("submit", submitAnswer);
answerInput.addEventListener("compositionstart", () => { answerInput.dataset.composing = "true"; });
answerInput.addEventListener("compositionend", () => { answerInput.dataset.composing = "false"; });
answerInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && (event.isComposing || answerInput.dataset.composing === "true")) {
    event.preventDefault();
  }
});
document.querySelector("#change-mode-button").addEventListener("click", () => {
  window.clearInterval(timerInterval);
  showScreen("select");
});
document.querySelector("#retry-button").addEventListener("click", () => startExercise(currentMode));
document.querySelector("#home-button").addEventListener("click", () => showScreen("home"));
document.querySelectorAll('[data-screen="home"]').forEach((button) => {
  button.addEventListener("click", () => showScreen("home"));
});
