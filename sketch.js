let soundFile;

let loaded = false;
let loadError = null;
let started = false;

let darkMode = true;

function preload() {
  // 사운드 파일 미리 로드한다
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
}

function draw() {
  // 배경 모드 적용한다
  background(darkMode ? 10 : 240);

  fill(darkMode ? 255 : 20);
  noStroke();
  textAlign(CENTER, CENTER);

  if (loadError) {
    // 로드 실패 시에는 재생을 시도하지 않고 메시지만 보여줌
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
    text("클릭하면 음악이 재생됩니다.", width / 2, height / 2);
  } else {
    const playing = soundFile.isPlaying();
    textSize(20);
    text(`재생 상태: ${playing ? "PLAY" : "PAUSE"}`, width / 2, height / 2);
    textSize(14);
    text("클릭: 재생/일시정지 토글\nM: 배경 모드 전환", width / 2, height / 2 + 60);
  }

  textAlign(LEFT, TOP);
  textSize(12);
  text("파일: assets/music.mp3", 14, 14);
}

function mousePressed() {
  // 로드가 끝나지 않았거나 실패한 경우(아무 동작 하지 않음)
  if (!loaded || loadError) return;

  if (!started) {
    // 사용자 액션 > AudioContext 시작
    userStartAudio();
    started = true;
    soundFile.loop();
    return;
  }

  // 클릭으로 재생/일시정지 토글
  if (soundFile.isPlaying()) soundFile.pause();
  else soundFile.play();
}

function keyPressed() {
  // 사용자 인터랙션: 키보드 M으로 배경 모드를 전환
  if (key === "m" || key === "M") {
    darkMode = !darkMode;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
