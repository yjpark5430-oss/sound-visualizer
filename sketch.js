let darkMode = true;
let clickCount = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  // 배경 모드에 따라 색 바꿈
  if (darkMode) {
    background(10);
  } else {
    background(240);
  }

  // 안내 텍스트 표시
  fill(darkMode ? 255 : 20);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(22);
  text("p5.js 비주얼라이저 v1", width / 2, height / 2 - 30);

  textSize(14);
  text(
    "M키 : 배경 모드 전환\n마우스 클릭: 클릭 카운트 증가\n다음 버전에서 오디오 로드/재생 추가",
    width / 2,
    height / 2 + 30
  );

  textAlign(LEFT, TOP);
  textSize(12);
  text(`clickCount: ${clickCount}`, 14, 14);
}

function keyPressed() {
  // 사용자가 키를 눌러 화면 모드를 바꿀 수 있다
  if (key === "m" || key === "M") {
    darkMode = !darkMode;
  }
}

function mousePressed() {
  // 사용자가 클릭하면 숫자가 증가한다
  clickCount += 1;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
