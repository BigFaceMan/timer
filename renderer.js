const timeDisplay = document.getElementById('time');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const inputMinutes = document.getElementById('inputMinutes');
const totalDisplay = document.getElementById('total');
const showHistoryBtn = document.getElementById('showHistoryBtn');
const historyDiv = document.getElementById('history');
const historyList = document.getElementById('historyList');

let timer = null;
let isPaused = false;
let startTime = 0;
let endTime = 0;
let pausedTime = 0;
let remainingSeconds = 0;

function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

function loadDailyRecords() {
  return JSON.parse(localStorage.getItem('dailyRecords') || '{}');
}

function saveDailyRecords(records) {
  localStorage.setItem('dailyRecords', JSON.stringify(records));
}

function updateTodayRecord(minutes) {
  const records = loadDailyRecords();
  const today = getTodayStr();
  records[today] = (records[today] || 0) + minutes;
  saveDailyRecords(records);
}

function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function updateTotalDisplay() {
  const records = loadDailyRecords();
  const today = getTodayStr();
  totalDisplay.textContent = `今日累计时间: ${records[today] || 0} 分钟`;
}

function startTimer() {
  if (timer) return;

  const inputVal = parseInt(inputMinutes.value);
  if (!inputVal || inputVal < 1) return;

  if (!isPaused) {
    startTime = Date.now();
    endTime = startTime + inputVal * 60 * 1000;
  } else {
    startTime = Date.now();
    endTime = startTime + pausedTime * 1000;
    isPaused = false;
  }

  timer = setInterval(() => {
    const now = Date.now();
    const remaining = Math.max(0, Math.round((endTime - now) / 1000));
    remainingSeconds = remaining;
    timeDisplay.textContent = formatTime(remaining);

    if (remaining <= 0) {
      clearInterval(timer);
      timer = null;
      alert('时间到！休息一下吧~');
      updateTodayRecord(inputVal);
      updateTotalDisplay();
      resetTimer();
    }
  }, 100);

  startBtn.disabled = true;
  pauseBtn.disabled = false;
  resetBtn.disabled = false;
  inputMinutes.disabled = true;
}

function pauseTimer() {
  if (!timer) return;
  isPaused = true;
  clearInterval(timer);
  timer = null;
  pausedTime = remainingSeconds;
  pauseBtn.textContent = '继续';
  startBtn.disabled = false;
  pauseBtn.disabled = true;
}

function resetTimer() {
  clearInterval(timer);
  timer = null;
  isPaused = false;
  pausedTime = 0;

  const inputVal = parseInt(inputMinutes.value);
  remainingSeconds = inputVal * 60;
  timeDisplay.textContent = formatTime(remainingSeconds);

  startBtn.disabled = false;
  pauseBtn.disabled = true;
  pauseBtn.textContent = '暂停';
  resetBtn.disabled = true;
  inputMinutes.disabled = false;
}

function renderHistory() {
  const records = loadDailyRecords();
  historyList.innerHTML = '';
  const dates = Object.keys(records).sort((a, b) => b.localeCompare(a));
  dates.forEach(date => {
    const li = document.createElement('li');
    li.textContent = `${date}: ${records[date]} 分钟`;
    historyList.appendChild(li);
  });
}

showHistoryBtn.addEventListener('click', () => {
  if (historyDiv.style.display === 'none') {
    historyDiv.style.display = 'block';
    renderHistory();
    showHistoryBtn.textContent = '关闭历史记录';
  } else {
    historyDiv.style.display = 'none';
    showHistoryBtn.textContent = '查看历史记录';
  }
});

inputMinutes.addEventListener('change', resetTimer);
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

updateTotalDisplay();
resetTimer();
