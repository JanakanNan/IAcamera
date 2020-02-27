const cv = require('opencv4nodejs');
const path = require('path');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const {drawBlueRect} = require('./asist');

io.on('connection', function (socket) {
    console.log("client connecter");
});


const FPS = 10;
const wCap = new cv.VideoCapture(0);
wCap.set(cv.CAP_PROP_FRAME_HEIGHT, 300);
wCap.set(cv.CAP_PROP_FRAME_HEIGHT, 300);

app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

getClassifier = async (frame) => {
    const classifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT);
    try {
        return await classifier.detectMultiScaleAsync(frame.bgrToGray());
    } catch (e) {
        console.log(e.message);
    }
};

setInterval(() => {
    const frame = wCap.read();
    getClassifier(frame).then((res) => {
        // draw detection
        const numDetectionsTh = 10;
        res.objects.forEach((rect, i) => {
            const thickness = res.numDetections[i] < numDetectionsTh ? 1 : 2;
            drawBlueRect(frame, rect, { thickness });
        });
        const image = cv.imencode('.jpg', frame).toString('base64');
        io.emit('image', image);
    });
}, 1000 / FPS);


server.listen(3000);

