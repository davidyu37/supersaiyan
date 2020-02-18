const videoWidth = window.screen.width;
const videoHeight = window.screen.height;

let video;
let poseNet;
let poses = [];
let ctx;
let state = "normal";

const custom_model = {
  model: "../models/model.json",
  metadata: "../models/model_meta.json",
  weights: "../models/model.weights.bin"
};

function setup() {
  ctx = createCanvas(videoWidth, videoHeight);
  video = createCapture(VIDEO);
  video.size(width, height);

  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(video, modelReady);
  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detected
  poseNet.on("pose", function(results) {
    poses = results;
    gotPoses(poses);
  });

  loadBrain();
  // Hide the video element, and just show the canvas
  video.hide();
}

function gotPoses(poses) {
  // console.log(poses);
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
    if (normal.confidence > constipated.confidence) {
      state = "constipated";
      return;
    }
    state = "normal";
  }
}

function modelReady() {
  select("#status").html("Model Loaded");
}

function draw() {
  image(video, 0, 0, width, height);

  if (state === "normal") {
    textSize(200);
    text("Normal", width / 8, height / 2);
  }

  if (state === "constipated") {
    textSize(200);
    text("Constipated", width / 8, height / 2);
  }

  // We can call both functions to draw all keypoints and the skeletons
  // drawKeypoints();
  // drawSkeleton();
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
