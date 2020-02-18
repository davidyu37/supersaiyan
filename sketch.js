const videoWidth = window.screen.width;
const videoHeight = window.screen.height;

let video;
let poseNet;
let poses = [];
let state = "normal";
let powerLevel;
let currentCharge = 2;
let transformComplete = false;

let super_saiyan_hair, goku_hair, aurora;
let explodeSound, chargeSound;

class PowerLevel {
  constructor(initialPowerLevel) {
    this.level = initialPowerLevel;
    this.super_saiyan_level = 150000000;
  }

  isSuperSaiyan() {
    if (this.level >= this.super_saiyan_level) {
      return true;
    }
    return false;
  }

  updatePowerLevel(addValue) {
    this.level += addValue;
  }

  show() {
    const processNumber = Math.floor(this.level);
    const addedComma = processNumber
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    const showText = `Power Level: ${addedComma}`;
    const fontSize = 60;
    const tWidth = textWidth(showText);
    const startX = 100;
    const startY = 100;
    noStroke();
    fill(4, 228, 147, 200);
    rect(startX - 20, startY - 80, tWidth + 40, fontSize * 2, 20);
    fill(247, 255, 177);
    textSize(fontSize);
    text(showText, startX, startY);
  }
}

const custom_model = {
  model: "../models/model_v2.json",
  metadata: "../models/model_meta_v2.json",
  weights: "../models/model.weights_v2.bin"
};

function preload() {
  super_saiyan_hair = loadImage("assets/hair.png");
  goku_hair = loadImage("assets/goku-hair.png");
  aurora = loadImage("assets/aurora.png");
  soundFormats("mp3", "ogg");
  explodeSound = loadSound("assets/charge-explode.mp3");
  chargeSound = loadSound("assets/charging.mp3");
}

function setup() {
  createCanvas(videoWidth, videoHeight);
  video = createCapture(VIDEO);
  video.size(width, height);

  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(video, modelReady);

  loadBrain();

  poseNet.on("pose", function(results) {
    poses = results;
    gotPoses(poses);
  });
  // Hide the video element, and just show the canvas
  video.hide();
}

function modelReady() {
  console.log("model loaded");
}

function gotPoses(poses) {
  if (poses.length > 0) {
    pose = poses[0].pose;
    skeleton = poses[0].skeleton;
    if (pose) {
      classifyPose(pose);
    }
  }
}

function loadBrain() {
  let options = {
    inputs: 34,
    outputs: 2,
    task: "classification",
    debug: true
  };
  brain = ml5.neuralNetwork(options);

  brain.load(custom_model, brainLoaded);
}

function brainLoaded() {
  console.log("pose classification ready!");
  powerLevel = new PowerLevel(9000);
}

function classifyPose(pose) {
  if (pose) {
    let inputs = [];
    for (let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      inputs.push(x);
      inputs.push(y);
    }
    brain.classify(inputs, gotResult);
  }
}

function gotResult(error, results) {
  if (results[0] && results[1]) {
    const normal = results[0].label === "normal" ? results[0] : results[1];
    const constipated =
      results[0].label === "constipated" ? results[0] : results[1];
    if (constipated.confidence > 0.9) {
      if (state !== "charging") {
        console.log("activate charge");
        explodeSound.play();
        chargeSound.stop();
        chargeSound.loop();
      }

      if (checkSupersaiyan()) {
        if (!transformComplete) {
          explodeSound.play();
          transformComplete = true;
        }
      }
      state = "charging";
      return;
    } else {
      if (state !== "normal") {
        if (checkSupersaiyan()) {
          chargeSound.stop();
          chargeSound.loop();
        } else {
          chargeSound.stop();
        }
      }
      state = "normal";
    }
  }
}

function draw() {
  image(video, 0, 0, width, height);

  // console.log(state);
  if (state === "normal") {
    if (checkSupersaiyan()) {
      drawSuperSaiyanHair();
      drawSuperSaiyanAurora();
    } else {
      drawNormalHair();
    }
  }

  if (state === "charging") {
    powerLevel.updatePowerLevel(currentCharge);
    if (checkSupersaiyan()) {
      drawSuperSaiyanHair();
    } else {
      drawNormalHair();
      translate(random(-5, 5), random(-5, 5));
    }
    drawSuperSaiyanAurora();
    currentCharge = random(1000, 1000000);
  }

  drawPowerLevel();
  //   drawSuperSaiyanEyes();
  // We can call both functions to draw all keypoints and the skeletons
  //   drawKeypoints();
  //   drawSkeleton();
}

function checkSupersaiyan() {
  if (powerLevel) {
    return powerLevel.isSuperSaiyan();
  }
  return false;
}

function drawPowerLevel() {
  if (powerLevel) {
    powerLevel.show();
  }
}

// Detect the position of head and add hair
function drawSuperSaiyanHair() {
  if (poses[0]) {
    const {
      pose: { leftEar, rightEar, nose, rightEye, leftEye }
    } = poses[0];

    if (leftEar && rightEar && nose && rightEye && leftEye) {
      const { x, y } = leftEar;
      const hairWidth = (leftEar.x - rightEar.x) * 2;
      const hairHeight = hairWidth * 1.025;
      const positionX = nose.x - hairWidth / 2;
      const positionY = rightEar.y - hairHeight;
      image(super_saiyan_hair, positionX, positionY, hairWidth, hairHeight);
    }
  }
}

function drawSuperSaiyanAurora() {
  if (poses[0]) {
    const {
      pose: { keypoints }
    } = poses[0];

    // Get the smallest and largest x and y
    let minX,
      minY,
      maxX,
      maxY,
      xPoints = [],
      yPoints = [];

    for (let index = 0; index < keypoints.length; index++) {
      const keypoint = keypoints[index];
      if (keypoint.score > 0.2) {
        const { x, y } = keypoint.position;
        xPoints.push(x);
        yPoints.push(y);
      }
    }

    minX = Math.min(...xPoints);
    minY = Math.min(...yPoints);
    maxX = Math.max(...xPoints);
    maxY = Math.max(...yPoints);

    const width = maxX - minX;
    const height = maxY - minY;

    const xMovedBy = width;
    const yMovedBy = height / 2;

    const posX = minX - xMovedBy;
    const posY = minY - yMovedBy;

    const paddedWidth = (width + xMovedBy) * 1.6;
    const paddedHeight = (height + yMovedBy) * 1.5;

    image(aurora, posX, posY, paddedWidth, paddedHeight);
  }
}

function drawSuperSaiyanEyes() {
  if (poses[0]) {
    const {
      pose: { rightEye, leftEye }
    } = poses[0];

    if (rightEye && leftEye) {
      drawOneEye(rightEye);
      drawOneEye(leftEye);
    }
  }
  function drawOneEye(eye) {
    const super_saiyan_eye_color = color(32, 188, 158);
    super_saiyan_eye_color.setAlpha(100);
    fill(super_saiyan_eye_color);
    noStroke();
    ellipse(eye.x, eye.y, 10, 10);
  }
}

function drawNormalHair() {
  if (poses[0]) {
    const {
      pose: { leftEar, rightEar, nose, rightEye, leftEye }
    } = poses[0];

    if (leftEar && rightEar && nose && rightEye && leftEye) {
      const { x, y } = leftEar;
      const hairWidth = (leftEar.x - rightEar.x) * 2.8;
      const hairHeight = hairWidth * 0.6;
      const positionX = nose.x - hairWidth / 2;
      const positionY = rightEar.y - hairHeight;
      image(goku_hair, positionX, positionY, hairWidth, hairHeight);
    }
  }
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
  // Loop through all the poses detected
  for (let i = 0; i < poses.length; i++) {
    // For each pose detected, loop through all the keypoints
    let pose = poses[i].pose;
    for (let j = 0; j < pose.keypoints.length; j++) {
      // A keypoint is an object describing a body part (like rightArm or leftShoulder)
      let keypoint = pose.keypoints[j];
      // Only draw an ellipse is the pose probability is bigger than 0.2
      if (keypoint.score > 0.2) {
        fill(255, 0, 0);
        noStroke();
        ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
      }
    }
  }
}

// A function to draw the skeletons
function drawSkeleton() {
  // Loop through all the skeletons detected
  for (let i = 0; i < poses.length; i++) {
    let skeleton = poses[i].skeleton;
    // For every skeleton, loop through all body connections
    for (let j = 0; j < skeleton.length; j++) {
      let partA = skeleton[j][0];
      let partB = skeleton[j][1];
      stroke(255, 0, 0);
      line(
        partA.position.x,
        partA.position.y,
        partB.position.x,
        partB.position.y
      );
    }
  }
}
