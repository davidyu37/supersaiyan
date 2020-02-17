let bodypix;
let segmentation;

const videoWidth = 640;
const videoHeight = 480;

let video;
let poseNet;
let poses = [];

let auroras = [];
let numAuroras = 40;

let super_saiyan_hair, goku_hair, aurora;

class Bug {
  constructor(tempX, tempY, tempR) {
    this.x = tempX;
    this.y = tempY;
    this.radius = tempR;

    // pick a random color
    this.color = color(255);
    let r = random(3);
    if (r < 1) {
      this.color = color(255, 100, 20, 50); // orange
    } else if (r >= 1 && r < 2) {
      this.color = color(255, 200, 10, 50); // yellow
    } else if (r >= 2) {
      this.color = color(255, 80, 5, 50); // reddish
    }
  }

  show() {
    noStroke();
    fill(this.color);
    ellipse(this.x, this.y, this.radius);
  }

  move() {
    this.x += random(-5, 5);
    this.y -= random(1, 3);
  }

  shrink() {
    // shrink size over time
    this.radius -= 0.4;
  }
}

class Aurora {
  constructor(centerX, centerY, maxBoundary) {
    this.centerX = centerX;
    this.centerY = centerY;
    this.maxBoundary = maxBoundary;
  }

  show() {
    const { minX, minY, maxX, maxY } = this.maxBoundary;
    console.log("show");

    const height = maxY - minY;
    // const width = maxX - minX;

    translate(0, height / 2);

    var a = -height / 3;
    var b = width / 2;

    noFill();
    beginShape();
    var x = 0;
    while (x < width) {
      let y = ((x - b) * (x - b)) / (maxX - minX) + a;
      console.log(x, y);
      vertex(x, y);
      x = x + 10;

      endShape();
    }

    translate(0, -height / 2);

    // const width = maxX - minX;
    // const height = maxY - minY;

    // fill(255, 255, 0, 100);

    // ellipse(this.centerX, this.centerY, width, height, 5);
    // const startX = this.centerX;
    // const startY = minY;

    // noFill();

    // let currentX = startX,
    //   currentY = startY;
    // beginShape();

    // for (let index = 0; index < 50; index++) {
    //   console.log(currentX, currentY);
    //   curveVertex(currentX, currentY);

    //   currentX = 0.3 * Math.pow(currentX, 2);

    //   currentY = currentX ;
    // }

    // endShape();

    // drawOneSide(startX, startY, false);
    // drawOneSide(startX, startY, true);

    // function drawOneSide(startX, startY, left) {
    //   beginShape();
    //   let currentX = startX,
    //     currentY = startY;
    //   for (let index = 0; index < 50; index++) {
    //     console.log("draw", currentX, currentY);
    //     curveVertex(currentX, currentY);

    //     if (left) {
    //       currentX -= 5;
    //     } else {
    //       currentX += 5;
    //     }
    //     currentY += 10;

    //     if (index % 2 == 0) {
    //       currentY -= 20;
    //     } else {
    //       currentY += 10 * 1.2;
    //     }
    //   }
    //   endShape();
    // }
  }
}

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
  //   drawSuperSaiyanHair();
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

    const xMovedBy = width / 3;
    const yMovedBy = height / 4;

    const posX = minX - xMovedBy;
    const posY = minY - yMovedBy;

    const paddedWidth = (width + xMovedBy) * 1.2;
    const paddedHeight = (height + yMovedBy) * 1.3;

    // stroke(255, 255, 0);
    // noFill();
    // strokeWeight();

    // fill(255, 255, 0, 150);
    // rect(posX, posY, paddedWidth, paddedHeight);

    // for (let i = auroras.length - 1; i >= 0; i--) {
    //   //   auroras[i].move();
    //   //   auroras[i].shrink();
    //   auroras[i].show();

    //   //   if (auroras[i].radius <= 0) {
    //   //     //remove the dead ones
    //   //     auroras.splice(i, 1);
    //   //   }
    // }

    // let x = 200;
    // let y = 300;
    // let radius = random(30, 50);
    let b = new Aurora(posX + paddedWidth / 2, posY + paddedHeight / 2, {
      minX: posX,
      minY: posY,
      maxX: posX + paddedWidth,
      maxY: posY + paddedHeight
    });
    b.show();
    // auroras.push(b);
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
