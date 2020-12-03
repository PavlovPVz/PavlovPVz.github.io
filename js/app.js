'use strict';

function qS(q) {
	return document.querySelector(q);
}

const player = qS('audio');
const topCanvas = qS('.top');
const topCanvasCtx = topCanvas.getContext('2d');
const botCanvas = qS('.bot');
const botCanvasCtx = botCanvas.getContext('2d');
let audioCtx, audioAnalyser, audioSource, bufferLength, dataArray, width, height;

function init() {
	player.volume = 0.5;
	player.play();

	audioCtx = new (window.AudioContext || window.webkitAudioContext)();
	audioAnalyser = audioCtx.createAnalyser();
	audioAnalyser.smoothingTimeConstant = 0.75;

	audioSource = audioCtx.createMediaElementSource(player);
	audioSource.connect(audioAnalyser);
	
	audioAnalyser.connect(audioCtx.destination);
	audioAnalyser.fftSize = 512;
	
	bufferLength = audioAnalyser.frequencyBinCount / 2;
	dataArray = new Uint8Array(bufferLength);

	initCanvas();
	draw();
}

function initCanvas() {
	width = 0.65 * window.innerWidth;
	height = qS('img').clientHeight;
	topCanvas.setAttribute('width', width);
	topCanvas.setAttribute('height', height);
	botCanvas.setAttribute('width', width);
	botCanvas.setAttribute('height', height);
}

function draw() {
	requestAnimationFrame(draw);

	audioAnalyser.getByteFrequencyData(dataArray);

	topCanvasCtx.fillStyle = 'rgb(255, 255, 255)';
	topCanvasCtx.fillRect(0, 0, width, height);

	botCanvasCtx.fillStyle = 'rgb(255, 255, 255)';
	botCanvasCtx.fillRect(0, 0, width, height);
	
	let barWidth = (width / bufferLength) / 2;
	let barHeight;

	for (let i = 0; i < bufferLength; i++) {
		barHeight = dataArray[i];

		topCanvasCtx.fillStyle = 'rgb(0, 0, 0)';
		topCanvasCtx.fillRect(i * 2 * barWidth, barHeight / 2, barWidth, height - barHeight / 2);
		
		botCanvasCtx.fillStyle = 'rgb(0, 0, 0)';
		botCanvasCtx.fillRect(width - barWidth - (i * 2 * barWidth), 0, barWidth, height - barHeight / 2);
	}
}

function night() {
	qS('body').classList.toggle('night');
}

function key(e) {
	if (e.code == 'Space') {
		if (player.paused) {
			player.play();
		} else {
			player.pause();
		}
	}
}

qS('body').onload = init;
qS('body').onresize = initCanvas;
qS('body').onwheel = e => {
	try {
		player.volume -= e.deltaY/1000;
	} catch (err) {}
};
qS('body').onclick = night;
qS('body').onkeyup = key;
player.onended = player.play;