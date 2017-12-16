const { shell } = require('electron')
const fs = require('fs')
const path = require('path')
const userHome = require('user-home')

const camRollDir = userHome + '/Pictures/Camera Roll/'
var video = document.getElementById('v')
var canvas = document.getElementById('c')

// create the /Pictures/Camera Roll/ directory if it doesn't exist
if(!fs.existsSync(camRollDir))
    fs.mkdirSync(camRollDir)

navigator.mediaDevices.getUserMedia({
    video: {
        optional: [
          { minWidth: 320 },
          { minWidth: 640 },
          { minWidth: 1024 },
          { minWidth: 1280 },
          { minWidth: 1920 },
          { minWidth: 2560 },
        ]
    }
}).then(mediaStream => {
    video.srcObject = mediaStream
}).catch(err => alert("Failed to grab webcam"));

/** SETTINGS PAGE */
var settingsBtn = $('#settings-open')
var settingsPage = $('#settings-page')
var settingsExitBtn = $('#settings-exit')

settingsBtn.click(function() {
    settingsPage.show()
})

settingsExitBtn.click(function() {
    settingsPage.hide()
})

/** FILTER SETTINGS */
// jquery grabber of video
var v = $('#v')
var filters = $('#filters')

filters.on('change', function(e) {
    // if mirrored is enabled, only remove the second class
    if(mirrored)
        v.removeClass(v.attr('class').split(' ')[1])
    else
        v.removeClass()
    v.addClass(this.value)
})

/** OTHER SETTINGS */
// values
// mirrored is enabled by default
var mirrored = true
v.addClass('mirrored')

$('.checkbox').change(function() {
    mirrored = $('#mirrored').prop('checked')
    if(mirrored)
        v.addClass('mirrored')
    else
        v.removeClass('mirrored')
})

/** CAPTURING IMAGE */
var captureBtn = $('#capture')
var flash = $('#flash')

captureBtn.click(function() {
    capturePhoto()
    flash.show()

    setTimeout(function() {
        flash.fadeOut('fast')
    }, 80)
})

/**
 * Grabs frame from video and makes the hidden canvas
 * draw an image, image is then saved to directory and img tag on
 * view is updated.
 */
function capturePhoto() {
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // apply filter if there is one
    canvas.getContext('2d').filter = video.className + '(1)'
    
    // mirror the canvas if applicable
    if(mirrored) {
        canvas.getContext('2d').translate(canvas.width, 0);
        canvas.getContext('2d').scale(-1, 1)
    }
    // then draw the final image
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)

    // convert canvas data to base64
    var image = canvas.toDataURL('image/png')
    var data = image.replace(/^data:image\/\w+;base64,/, "")
    var buffer = new Buffer(data, 'base64')

    // now save
    fs.writeFile(camRollDir + new Date().getTime() + '.png', buffer, (err) => {
        if(err) alert('There was a problem when saving the captured image')

        // after image is saved, set the img src
        getLatestPhoto(camRollDir, setLastPhotoImg)
    })
}

/** SETTING LAST IMAGE */

var lastPhoto = $('#lastphoto')
var image = $('#image')

lastPhoto.click(function() {
    shell.openItem(camRollDir)
})

/**
 * Returns file path to the latest photo
 * taken in the Camera Roll directory
 */
function getLatestPhoto(dir, callback) {
    fs.readdir(dir, function(err, items) {
        var filteredList = []
        items.forEach(function(filename) {
            if(filename.endsWith('.png') || filename.endsWith('.jpg') || filename.endsWith('.jpeg')) {
                filteredList.push(filename)
            }
        })
        
        callback(dir + filteredList[filteredList.length - 1])
    })
}

/**
 * Sets the src attribute of the img tag to an image
 */
function setLastPhotoImg(image) {
    lastPhoto.find('img').attr('src', image)
} 

getLatestPhoto(camRollDir, setLastPhotoImg)
