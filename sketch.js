let soundFile;
let amp;

let loaded = false;
let loadError = null;
let started = false;

let darkMode = true;

function preload() {
  // 사운드 파일 로드 (성공/실패 콜백)
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

  // Amplitude 분석 객체 생성
  amp = new p5.Amplitude();
  amp.setInput(soundFile);
}

function draw() {
  background(darkMode ? 10 : 240);

  fill(darkMode ? 255 : 20);
  noStroke();
  textAlign(CENTER, CENTER);

  if (loadError) {
    textSize(18);
    text("오디오 로드 실패\nassets/music.mp3 경로/파일 확인", width / 2, height / 2);
    return;
  }

  if (!loaded) {
    textSize(18);
    text("Audio Loading...", width / 2, height / 2);
    return;
  }

  if (!started) {
    textSize(18);
    text("클릭하면 음악 재생\n원의 크기가 음량에 반응합니다", width / 2, height / 2);
    textSize(14);
    text("M: 배경 모드 전환", width / 2, height / 2 + 60);
    return;
  }

  // 오디오 데이터(음량) 읽음 > 시각 요소(크기)에 매핑
  const level = amp.getLevel();
  const mappedSize = map(level, 0, 0.25, 40, 320);
  const size = constrain(mappedSize, 40, 320);

  fill(darkMode ? 200 : 40);
  ellipse(width / 2, height / 2, size, size);

  textAlign(LEFT, TOP);
  textSize(12);
  fill(darkMode ? 255 : 20);
  text(
    `amp.getLevel(): ${level.toFixed(3)}\n클릭: 재생/일시정지\nM: 배경 모드`,
    14,
    14
  );
}

function mousePressed() {
  if (!loaded || loadError) return;

  if (!started) {
    userStartAudio();
    started = true;
    soundFile.loop();
    return;
  }

  if (soundFile.isPlaying()) soundFile.pause();
  else soundFile.play();
}

function keyPressed() {
  if (key === "m" || key === "M") {
    darkMode = !darkMode;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
