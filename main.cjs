const { app, BrowserWindow, dialog, Menu } = require('electron');

let mainWindow;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    title: 'Coders GUI',
    webPreferences: { nodeIntegration: false }
  });

  // 1. Show the file picker immediately on startup
  await openFile();

  // 2. Build the custom menu
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Open HTML File...',
          accelerator: 'CmdOrCtrl+O',
          click: () => openFile()
        },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // 3. Inject the Footer Bar into whatever HTML is loaded!
  mainWindow.webContents.on('did-finish-load', () => {
    const footerHTML = `
      <style>
        #coders-gui-footer {
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100%;
          background-color: #1e1e1e;
          color: #a0a0a0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          font-size: 12px;
          padding: 6px 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-sizing: border-box;
          z-index: 999999;
          border-top: 1px solid #333;
        }
        /* Pushes the website content up so the footer doesn't cover it */
        body { padding-bottom: 35px !important; box-sizing: border-box; }
      </style>
      <div id="coders-gui-footer">
        <span>Credit: <strong>Deepseek</strong> & <strong>VictorNewb Inc.</strong></span>
        <span>Version: 1.9-beta</span>
      </div>
    `;
    
    // This tells Electron to run that HTML code inside the page
    mainWindow.webContents.executeJavaScript(`
      document.body.insertAdjacentHTML('beforeend', ${JSON.stringify(footerHTML)});
    `);
  });
}

// The function that opens the dialog and loads the file
async function openFile() {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: 'Pick an HTML file',
    filters: [{ name: 'HTML', extensions: ['html', 'htm'] }],
    properties: ['openFile']
  });

  if (canceled || filePaths.length === 0) {
    if (mainWindow && !mainWindow.webContents.getURL()) {
      app.quit();
    }
    return;
  }

  mainWindow.loadFile(filePaths[0]);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});