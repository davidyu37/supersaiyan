const videoWidth = window.screen.width;
const videoHeight = window.screen.height;

let video;
let poseNet;
let poses = [];

let super_saiyan_hair, goku_hair, aurora;

function preload() {
  super_saiyan_hair = loadImage("assets/hair.png");
  goku_hair = loadImage("assets/goku-hair.png");
  aurora = loadImage("assets/aurora.png");
}

function setup() {
  createCanvas(videoWidth, videoHeight);
  video = createCapture(VIDEO);
  video.size(width, height);

  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(video, modelReady);
  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detected
  poseNet.on("pose", function(results) {
    poses = results;
  });
  // Hide the video element, and just show the canvas
  video.hide();
}

function modelReady() {
  select("#status").html("Model Loaded");
}

function draw() {
  image(video, 0, 0, width, height);
  drawSuperSaiyanAurora();
  drawSuperSaiyanHair();
  //   drawSuperSaiyanEyes();
  //   drawNormalHair();
  // We can call both functions to draw all keypoints and the skeletons
  //   drawKeypoints();
  //   drawSkeleton();
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
    console.log(poses[0]);

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
