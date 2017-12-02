const { app, BrowserWindow } = require('electron')
const url = require('url')
const path = require('path')

let win

function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: { 
            experimentalFeatures: true,
            webSecurity: false 
        }
    })

    win.loadURL(url.format({
        pathname: path.join(__dirname, 'view/index.html'),
        protocol: 'file:',
        slashes: true
    }))
}

app.on('ready', createWindow)

app.on('window-all-closed', function() {
    if(process.platform !== 'darwin')
        app.quit()
})