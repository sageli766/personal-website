const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const freqSlider = document.getElementById('freqSlider');
const freqValue = document.getElementById('freqValue');
const resetButton = document.getElementById('resetButton');

const dt = 0.0025;
const g = 9.81;
const A = 0.15;
let w = parseFloat(freqSlider.value);
let waveType = "sin";

let simTime = 0;
let ballY = 1;
let ballVel = 0;

// sin functions
function sinFloor(t, amplitude, freq) {
    return amplitude * Math.sin(2 * Math.PI * freq * t);
}
function sinFloorVel(t, amplitude, freq) {
    return amplitude * 2 * Math.PI * freq * Math.cos(2 * Math.PI * freq * t);
}

// triangle functions
function triangleWavePhase(phase, A) {
    phase = phase % 1;
    if (phase < 0.25) {
        return 4 * A * phase;
    } else if (phase < 0.75) {
        return 2 * A - 4 * A * phase;
    } else {
        return -4 * A + 4 * A * phase;
    }
}
function triangleFloor(t, amplitude, freq) {
    let phase = t * freq;
    return amplitude * triangleWavePhase(phase, 1);
}
function dTriangleWavePhase(phase, A) {
    phase = phase % 1;
    if (phase < 0.25 || phase >= 0.75) {
        return 4 * A;
    } else {
        return -4 * A;
    }
}
function dTriangleFloor(t, amplitude, freq) {
    let phase = t * freq;
    return amplitude * dTriangleWavePhase(phase, 1);
}

function getFloorValues(t) {
    if (waveType === "triangle") {
        return {
            pos: triangleFloor(t, A, w),
            vel: dTriangleFloor(t, A, w)
        };
    } else {
        return {
            pos: sinFloor(t, A, w),
            vel: sinFloorVel(t, A, w)
        };
    }
}

function resetSimulation() {
    simTime = 0;
    ballY = 1;
    ballVel = 0;
}

freqSlider.addEventListener('input', function() {
    w = parseFloat(this.value);
    freqValue.textContent = w.toFixed(1);
});
document.querySelectorAll('input[name="waveType"]').forEach(radio => {
    radio.addEventListener('change', function() {
        waveType = this.value;
        resetSimulation();
    });
});
resetButton.addEventListener('click', resetSimulation);

function updateSimulation(steps) {
    for (let i = 0; i < steps; i++) {
        const floorData = getFloorValues(simTime);
        const currentFloor = floorData.pos;
        const currentFloorVel = floorData.vel;

        const predictedBall = ballY + ballVel * dt;
        const predictedFloor = currentFloor + currentFloorVel * dt;

        if (predictedBall < predictedFloor) {
            if (ballVel > 0) {
                ballVel = (ballVel - g * dt + currentFloorVel) * 0.8;
            } else {
                ballVel = (-ballVel - g * dt + currentFloorVel) * 0.8;
            }
            ballY = predictedFloor;
        } else {
            // Free fall update
            ballVel = ballVel - g * dt;
            ballY = ballY + ballVel * dt;
        }
        simTime += dt;
    }
}

const meterToPixel = 300;
const ballRadius = 0.02 * meterToPixel;

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const baseline = canvas.height * 0.8;

    const floorData = getFloorValues(simTime);
    const currentFloor = floorData.pos;
    const floorYPixel = baseline - currentFloor * meterToPixel;

    ctx.beginPath();
    ctx.moveTo(0, floorYPixel);
    ctx.lineTo(canvas.width, floorYPixel);
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    ctx.stroke();

    const ballXPixel = canvas.width / 2;
    const ballYPixel = baseline - ballY * meterToPixel;
    ctx.beginPath();
    ctx.arc(ballXPixel, ballYPixel, ballRadius, 0, 2 * Math.PI);
    ctx.fillStyle = 'red';
    ctx.fill();

    ctx.fillStyle = 'black';
    ctx.font = '16px Arial';
    // ctx.fillText("Time: " + simTime.toFixed(2) + " s", 10, 20);
}

let lastFrameTime = performance.now();
function animate(now) {
    const elapsed = (now - lastFrameTime) / 1000;
    lastFrameTime = now;
    let steps = Math.floor(elapsed / dt);
    if (steps < 1) steps = 1;
    updateSimulation(steps);
    draw();
    requestAnimationFrame(animate);
}
requestAnimationFrame(animate);