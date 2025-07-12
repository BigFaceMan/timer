const { app, BrowserWindow, Tray, Menu, ipcMain } = require('electron');
const path = require('path');

let mainWin;
let ballWin;
let tray = null;

function createMainWindow() {
  mainWin = new BrowserWindow({
    width: 500,
    height: 750,
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    alwaysOnTop: false, // 初始不置顶
    autoHideMenuBar: true,
    frame: true, // 如果你想让主窗口无边框悬浮，可改为 false
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWin.loadFile('index.html');

  mainWin.on('close', (e) => {
    e.preventDefault();
    mainWin.hide(); // 点“X”不退出，隐藏到托盘
  });
}

function createBallWindow() {
  ballWin = new BrowserWindow({
    width: 140,
    height: 140,
    transparent: true,        // 必须启用透明
    frame: false,             // 无边框
    alwaysOnTop: true,
    title: "",  // 👈 设置空标题
    resizable: false,
    hasShadow: false,         // 可选，避免阴影形成边界感
    skipTaskbar: true,
    backgroundColor: '#00000000',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });


  ballWin.loadFile('ball.html');
  ballWin.setAlwaysOnTop(true, 'screen-saver');
  ballWin.setVisibleOnAllWorkspaces(true);
  ballWin.setIgnoreMouseEvents(false); // 可鼠标交互
}

app.whenReady().then(() => {
  createMainWindow();

  tray = new Tray(path.join(__dirname, 'assets', 'icon.ico'));
  tray.setToolTip('然然的番茄钟');

  tray.setContextMenu(Menu.buildFromTemplate([
    { label: '显示主界面', click: () => {
        if (mainWin) mainWin.show();
      }
    },
    { label: '切换悬浮球模式', click: () => {
        if (!ballWin) {
          createBallWindow();
        } else {
          ballWin.isVisible() ? ballWin.hide() : ballWin.show();
        }
        if (mainWin) mainWin.hide();
      }
    },
    { type: 'separator' },
    { label: '退出', click: () => {
        app.exit();
      }
    }
  ]));

  // 从悬浮球返回主界面
  ipcMain.on('show-main-window', () => {
    if (mainWin) mainWin.show();
    if (ballWin) ballWin.hide();
  });

  // 更新小球上的时间文本
  ipcMain.on('update-ball-time', (_, timeText) => {
    if (ballWin) {
      ballWin.webContents.send('update-time', timeText);
    }
  });

  // 设置主窗口是否置顶
  ipcMain.on('toggle-always-on-top', (_, isTop) => {
    if (mainWin) mainWin.setAlwaysOnTop(isTop);
  });
});

// 所有窗口都关闭时退出（Mac 除外）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Mac 上激活应用时，重新创建主窗口
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});
