const fs = require('fs');
const { exec } = require('child_process');

const videoFolder = '/data/OpenFace/assets/videos';

const videos = fs.readdirSync(videoFolder);

const videoPath = videos.map(video => {
    return `${videoFolder}/${video}`;
});

const featurePath = '/data/OpenFace/build/bin/FeatureExtraction'
const openfaceStr = [featurePath, videoPath.map(video => `-f ${video}`).join(' '), '-2Dfp'].join(' ');

console.log(openfaceStr)
getFrame()

function getFrame() {
    const times = {}
    videoPath.forEach(video => {
        const command = `ffprobe ${video}`;
        const cp = exec(command);
        cp.stderr.on('data', data => {
            // console.log(data)
            const time = parseDuration(data);
            const frameRate = parseFrame(data);
            const frame = Math.floor(time * frameRate);
            if (time > 0) {
                times[video] = time;
                fs.appendFileSync('/data/OpenFace/assets/frames.txt', `${video} ${time} ${frameRate} ${frame}\n`, 'utf-8');
            }
        })
    })
}

function parseDuration(data) {
    let regex = /Duration: (\d{2}):(\d{2}):(\d{2}\.\d{1,3})/;
    let match = regex.exec(data);
    let ret = 0;
    if (match) {
        const hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        const seconds = parseFloat(match[3]);
        ret = hours * 3600 + minutes * 60 + seconds;
    }
    return ret;
}

function parseFrame(data) {
    let regex = /(\d{2}) fps/;
    let match = regex.exec(data);
    let ret = 0;
    if (match) {
        ret = parseInt(match[1]);
    }
    return ret;
}
