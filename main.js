const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow () {
  const win = new BrowserWindow({
    width: 500,           // 宽度调大
    height: 750,          // 高度调大
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    autoHideMenuBar: true,  // 自动隐藏菜单栏，按 Alt 会显示
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile('index.html');
}


app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if(process.platform !== 'darwin') app.quit();
});
