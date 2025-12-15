let soundFile;
let amp;
let fft;

let loaded = false;
let loadError = null;
let started = false;

let useHSB = true; // C키로 색상모드 전환
let rot = 0;

// v6: 스무딩 + 가시성 유지 + 저역(bass) 삼각형 + Space 토글
let smoothLevel = 0;

function preload() {
  // 사운드 파일 로드
  soundFormats("mp3", "ogg", "wav");
  soundFile = loadSound(
    "assets/music.mp3",
    () => {
      loaded = true;
    },
    (err) => {
      loadError = err;
    }
  );
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // 분석 객체 생성: Amplitude(음량) + FFT(주파수)
  amp = new p5.Amplitude();
  amp.setInput(soundFile);

  fft = new p5.FFT(0.85, 128);
  fft.setInput(soundFile);
}

function draw() {
  applyColorMode();
  background(useHSB ? color(220, 40, 5, 100) : 10);

  if (loadError) {
    drawCenter("오디오 로드 실패\nassets/music.mp3 확인");
    return;
  }

  if (!loaded) {
    drawCenter("Audio Loading...");
    return;
  }

  if (!started) {
    drawCenter("클릭하면 재생\nC: 색상 모드 전환\n클릭/Space: 재생/일시정지");
    return;
  }

  // 음량 레벨 > 여러 속성에 반영
  const level = amp.getLevel();

  // 스무딩
  smoothLevel = lerp(smoothLevel, level, 0.12);

  // 감도 설정
  const boost = constrain(map(smoothLevel, 0, 0.12, 0, 1), 0, 1);

  // 두께 조절
  const strokeW = 2 + boost * 2;

  // 주파수 에너지를 가져온다
  const bass = fft.getEnergy("bass");
  const treble = fft.getEnergy("treble");
  const bassBoost = constrain(map(bass, 0, 255, 0, 1), 0, 1);

  // 위치 흔들림 + 회전 속도 변화
  const wobble = boost * 28;
  rot += 0.01 + boost * 0.08;

  const cx = width / 2 + sin(frameCount * 0.03) * wobble;
  const cy = height / 2 + cos(frameCount * 0.03) * wobble;

  // 1: ellipse (크기 + 색)
  const pulse = 70 + boost * 280;
  setFillByBoost(boost);
  noStroke();
  ellipse(cx, cy, pulse, pulse);

  // 2: rect (회전)
  push();
  translate(width / 2, height / 2);
  rotate(rot);
  setStrokeByBoost(boost);
  strokeWeight(strokeW + 0.5);
  noFill();
  rectMode(CENTER);
  const frameSize = 180 + boost * 220;
  rect(0, 0, frameSize, frameSize, 18);
  pop();

  // 3: line (FFT)
  const spectrum = fft.analyze();
  push();
  translate(width / 2, height / 2);
  rotate(-rot * 0.35);
  setStrokeByBoost(boost);
  strokeWeight(strokeW);

  // 선이 더 눈에 띄도록
  const ring = 120 + boost * 90;
  for (let i = 0; i < spectrum.length; i += 1) {
    const a = map(i, 0, spectrum.length, 0, TWO_PI);
    const mag = spectrum[i] / 255;
    const len = ring + mag * (140 + boost * 260);

    line(cos(a) * ring, sin(a) * ring, cos(a) * len, sin(a) * len);
  }
  pop();

  // 4: triangle (low 음역대 반응)
  drawBassTriangle(bassBoost);

  drawHUD(level, bass, treble);
}

function mousePressed() {
  if (!loaded || loadError) return;

  // 첫 클릭 > 오디오 시작 (브라우저 정책 때문)
  if (!started) {
    userStartAudio();
    started = true;
    soundFile.loop();
    return;
  }

  // 이후 클릭은 재생/일시정지 토글
  togglePlayPause();
}

function keyPressed() {
  // 사용자 인터랙션: 색상 모드 전환
  if (key === "c" || key === "C") {
    useHSB = !useHSB;
  }

  // 사용자 인터랙션: Space로 재생/일시정지 토글
  if (key === " ") {
    if (!started) return;
    togglePlayPause();
  }
}

function togglePlayPause() {
  // 안전장치
  if (soundFile.isPlaying()) soundFile.pause();
  else soundFile.play();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function applyColorMode() {
  // HSB 모드 / RGB 모드 전환
  if (useHSB) {
    colorMode(HSB, 360, 100, 100, 100);
  } else {
    colorMode(RGB, 255, 255, 255, 255);
  }
}

function setFillByBoost(boost) {
  // 음량 > 색, 투명도 변화
  if (useHSB) {
    const h = (frameCount * 0.8 + boost * 160) % 360;
    const a = 25 + boost * 55;
    fill(h, 80, 95, a);
  } else {
    const v = 80 + boost * 140;
    fill(v, 140, 220, 140);
  }
}

function setStrokeByBoost(boost) {
  // 선/사각형의 최소 알파 확보
  if (useHSB) {
    const h = (frameCount * 0.8 + 120 + boost * 160) % 360;
    const a = 80 + boost * 20;
    stroke(h, 80, 95, a);
  } else {
    const v = 120 + boost * 120;
    stroke(v, v, 255, 200);
  }
}

function drawBassTriangle(bassBoost) {
  // low 음역대 커지면 > 삼각형 커짐, 투명도 증가
  if (useHSB) {
    const h = (frameCount * 0.6 + 220) % 360;
    const a = 25 + bassBoost * 60;
    fill(h, 80, 95, a);
  } else {
    fill(255, 200, 120, 120 + bassBoost * 100);
  }

  noStroke();

  const triW = 60 + bassBoost * 240;
  const baseY = height - 60;
  const peakY = baseY - (40 + bassBoost * 160);

  triangle(
    width / 2 - triW * 0.6,
    baseY,
    width / 2 + triW * 0.6,
    baseY,
    width / 2,
    peakY
  );
}

function drawCenter(msg) {
  fill(useHSB ? color(0, 0, 100, 90) : 255);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(18);
  text(msg, width / 2, height / 2);
}

function drawHUD(level, bass, treble) {
  fill(useHSB ? color(0, 0, 100, 70) : 255);
  noStroke();
  textAlign(LEFT, TOP);
  textSize(12);

  const status = soundFile.isPlaying() ? "PLAY" : "PAUSE";
  text(
    `상태: ${status}\namp.getLevel(): ${level.toFixed(3)}\nbass: ${Math.round(bass)}  treble: ${Math.round(treble)}\n클릭/Space: 재생·일시정지\nC: 색상 모드 전환`,
    14,
    14
  );
}
