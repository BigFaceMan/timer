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
let remainingSeconds = 0;
let isPaused = false;

function getTodayStr() {
  const today = new Date();
  return today.toISOString().slice(0, 10); // yyyy-mm-dd
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
  const totalMinutesToday = records[today] || 0;
  totalDisplay.textContent = `今日累计时间: ${totalMinutesToday} 分钟`;
}

function startTimer() {
  if (timer) return;
  if (remainingSeconds <= 0) remainingSeconds = parseInt(inputMinutes.value) * 60;

  timer = setInterval(() => {
    if (!isPaused) {
      remainingSeconds--;
      timeDisplay.textContent = formatTime(remainingSeconds);

      if (remainingSeconds <= 0) {
        clearInterval(timer);
        timer = null;

        // 播放提示音（如果需要，可以在这里添加）

        alert('时间到！休息一下吧~');
        updateTodayRecord(parseInt(inputMinutes.value));
        updateTotalDisplay();
        resetTimer();
      }
    }
  }, 1000);

  startBtn.disabled = true;
  pauseBtn.disabled = false;
  resetBtn.disabled = false;
  inputMinutes.disabled = true;
}

function pauseTimer() {
  isPaused = !isPaused;
  pauseBtn.textContent = isPaused ? '继续' : '暂停';
}

function resetTimer() {
  clearInterval(timer);
  timer = null;
  remainingSeconds = parseInt(inputMinutes.value) * 60;
  timeDisplay.textContent = formatTime(remainingSeconds);
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  pauseBtn.textContent = '暂停';
  resetBtn.disabled = true;
  inputMinutes.disabled = false;
  isPaused = false;
}

function renderHistory() {
  const records = loadDailyRecords();
  historyList.innerHTML = '';
  const dates = Object.keys(records).sort((a,b) => b.localeCompare(a)); // 降序
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
