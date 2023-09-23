"use strict";
let ctx;
let canvas;
const TAU = Math.PI * 2;
let dots = [];

function setupParticles() {
    canvas = document.getElementById("backgroundrender");
    ctx = canvas.getContext("2d");
    onResizeCanvas();
    window.addEventListener('resize', onResizeCanvas, false);
    window.requestAnimationFrame(draw);
    for (let i = 0; i < 128; i++) {
        let x = (normalRandom()) * 2;
        let y = (normalRandom()) * 2;
        let z = (normalRandom()) * 2;
        dots.push([x, y, z]);
    }
    window.addEventListener('mousedown', e => {
        mousedown = true;
        mouseX = e.offsetX;
        mouseY = e.offsetY;
        mouseXforce = 0;
        mouseYforce = 0;
    });
    window.addEventListener('mousemove', e => {
        if (mousedown) {
            mouseXforce = e.offsetX - mouseX;
            mouseYforce = e.offsetY - mouseY;
            mouseX = e.offsetX;
            mouseY = e.offsetY;
        }
    });
    function mousestop() { mousedown = false; }
    window.addEventListener('mouseup', mousestop);
    window.addEventListener('mouseout', mousestop);
    window.addEventListener('mouseleave', mousestop);
}
function onResizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.fillStyle = "rgba(64, 64, 64, 0.7)";
}
let rotating = Math.random() * 100;
let mouseX = 0;
let mouseY = 0;
let mouseXforce = 0;
let mouseYforce = 0;
let mousedown = false;
function draw() {
    ctx.globalCompositeOperation = 'destination-over';
    ctx.clearRect(0, 0, canvas.width, canvas.height); // clear canvas
    rotating += 0.1;
    if (rotating == 100) {
        rotating = 0;
    }
    var rotateX = Math.cos((rotating / 100) * TAU) * 0.001;
    var rotateY = Math.sin((rotating / 100) * TAU) * 0.001;
    var rotateZ = 0;
    if (!mousedown) {
        mouseXforce = mouseXforce * 0.99;
        mouseYforce = mouseYforce * 0.99;
        if (Math.abs(mouseXforce) < 0.1)
            mouseXforce = 0;
        if (Math.abs(mouseYforce) < 0.1)
            mouseYforce = 0;
        rotateX += (mouseXforce / 10000);
        rotateY += (-mouseYforce / 10000);
    }
    else {
        rotateX = (mouseXforce / 10000);
        rotateY = (-mouseYforce / 10000);
    }
    let raidus;
    for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];
        raidus = (1 / (Math.sqrt(Math.abs(dot[0]) + Math.abs(dot[1]) + Math.abs(1 - dot[2])))) * 2;
        ctx.beginPath();
        ctx.arc(((dot[0]) + 0.5) * window.innerWidth, ((dot[1]) + 0.5) * window.innerHeight, raidus, 0, 2 * Math.PI);
        ctx.fill();
        dots[i] = rotate3d(dot, rotateX, rotateY, rotateZ);
    }
    window.requestAnimationFrame(draw);
}
let rotate3d = (points = [0, 0, 0], pitch = 0, roll = 0, yaw = 0) => {
    let cosa = Math.cos(yaw), sina = Math.sin(yaw);
    let cosb = Math.cos(pitch), sinb = Math.sin(pitch);
    let cosc = Math.cos(roll), sinc = Math.sin(roll);
    let Axx = cosa * cosb, Axy = cosa * sinb * sinc - sina * cosc, Axz = cosa * sinb * cosc + sina * sinc;
    let Ayx = sina * cosb, Ayy = sina * sinb * sinc + cosa * cosc, Ayz = sina * sinb * cosc - cosa * sinc;
    let Azx = -sinb, Azy = cosb * sinc, Azz = cosb * cosc;
    let px = points[0];
    let py = points[1];
    let pz = points[2];
    points[0] = Axx * px + Axy * py + Axz * pz;
    points[1] = Ayx * px + Ayy * py + Ayz * pz;
    points[2] = Azx * px + Azy * py + Azz * pz;
    return points;
};
function normalRandom() {
    let random1 = 0;
    let random2 = 0;
    while (random1 === 0)
        random1 = Math.random();
    while (random2 === 0)
        random2 = Math.random();
    let num = ((Math.sqrt(-2.0 * Math.log(random1)) * Math.cos(2.0 * Math.PI * random2)) / 10) + 0.5;
    if (num > 1 || num < 0)
        return normalRandom(); // resample between 0 and 1
    if (num > 0.75 || num < 0.25)
        return normalRandom(); //squish
    return ((num - 0.5) * 2); //outputs a -0.5 to 0.5
}




let background_img = new Image();

background_img.src = 'https://kidofcubes.fenesisu.moe/background/';
let bgm;
let bgm_button;
let bgm_source;
let audio_visualizer_initalized = false;
let audio_analyser;
document.addEventListener('DOMContentLoaded', function () {
    bgm = document.getElementById("bgm");
    bgm_button = document.getElementById("bgm_button");
    bgm_source = document.getElementById("bgm_source");


    background_img.onload = function(){
        document.body.style.backgroundImage = "url('" + background_img.src + "')";
        setupParticles();
    };
}, false);


function togglebgm(){
    if(!audio_visualizer_initalized){
        audio_visualizer();
        audio_visualizer_initalized=true;
    }
    if(bgm.paused){
        bgm_button.innerText="\uf04c";
        if (!bgm_source.getAttribute("src")) {
            bgm_source.setAttribute("src", "/stream");
            bgm.load();
        }
        bgm.play();
    }else{
        bgm_button.innerText="\uf04b";
        bgm.pause();
        bgm_source.removeAttribute("src");
        bgm.load();
    }
}
function modify_audio_data(index,data){
    return ((((Math.pow(data/255,2))))*26)*(1+(Math.pow(index/64,4)*2));
}

function audio_visualizer(){
    var context = new AudioContext();
    var src = context.createMediaElementSource(bgm);
    audio_analyser = context.createAnalyser();

    var audio_canvas = document.getElementById("audio_visualizer");
    audio_canvas.width = 256;
    audio_canvas.height = 26;
    src.connect(audio_analyser);
    audio_analyser.connect(context.destination);
    var audio_canvas_ctx = audio_canvas.getContext("2d");

    audio_analyser.fftSize = 128;

    var bufferLength = audio_analyser.frequencyBinCount;

    var dataArray = new Uint8Array(bufferLength);

    var WIDTH = audio_canvas.width;
    var HEIGHT = audio_canvas.height;

    var barWidth = (WIDTH / bufferLength)-1;
    var barHeight;
    var x = 0;

    function renderFrame() {
      requestAnimationFrame(renderFrame);

      x = 0;

      audio_analyser.getByteFrequencyData(dataArray);

      audio_canvas_ctx.globalCompositeOperation = 'destination-over';
      audio_canvas_ctx.clearRect(0, 0, audio_canvas.width, audio_canvas.height); // clear canvas

      for (var i = 0; i < bufferLength; i++) {
        barHeight = modify_audio_data(i,dataArray[i]);

        audio_canvas_ctx.fillStyle = "rgba(255,255,255,1)";
        audio_canvas_ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    }

    renderFrame();
}