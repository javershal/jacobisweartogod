// Number of raindrops
var numDrops = 50;

// Array to store raindrop objects
var drops = [];

// Variable to track raindrop falling state
var isFalling = true;

//sound variables
var itsRaining;
var maspeek;


function preload() {
	
itsRaining = loadSound('sounds/itsraining.mp3');
maspeek = loadSound('sounds/maspeek.mp3');

}

// Setup function
function setup() {
  // Create full-screen canvas
  createCanvas(windowWidth, windowHeight);
  isFalling = true
  c_img = loadImage("images/julianrain.jpg");
  c_img.resize(windowWidth,windowHeight);
  image(c_img,0,0);
  itsRaining.play()

  
  // Create raindrop objects
  for (var i = 0; i < numDrops; i++) {
    drops[i] = new Raindrop();
  }
}

// Draw function
function draw() {
  // Set background color
  c_img.resize(windowWidth,windowHeight);
	image(c_img,0,0);
  
  // Update and display raindrop objects
  for (var i = 0; i < numDrops; i++) {
    drops[i].update();
    drops[i].display();
    
    // Check if raindrop is still falling and set visibility
    if (isFalling) {
      drops[i].setVisible(true);
    } else {
      drops[i].setVisible(false);
    }
  }
}

// Raindrop class
function Raindrop() {
  // Initialize raindrop properties
  this.x = random(width);
  this.y = random(-500, -50);
  this.speed = random(4, 10);
  this.size = random(40, 70);
  this.isVisible = true;
  
  // Update raindrop position
  this.update = function() {
    this.y += this.speed;
    
    // Reset raindrop if it goes offscreen
    if (this.y > height && this.isVisible) {
      this.y = random(-500, -50);
    }
  }
  
  // Set visibility of raindrop
  this.setVisible = function(isVisible) {
    this.isVisible = isVisible;
  }
  
  // Display raindrop
  this.display = function() {
      // Set color of raindrop
      fill(0, 0, 255); // Blue color
      
      // Draw raindrop as a tear shape
      noStroke();
      push(); // Save current drawing state
      translate(this.x, this.y); // Translate to raindrop position
      rotate(PI); // Rotate by 180 degrees
      beginShape();
      vertex(0, 0);
      bezierVertex(-this.size / 2, this.size / 4, -this.size / 4, this.size / 2, 0, this.size);
      bezierVertex(this.size / 4, this.size / 2, this.size / 2, this.size / 4, 0, 0);
      endShape(CLOSE);
      pop(); // Restore previous drawing state
  }
}


// Event listener for key press
function keyPressed() {
  if (keyCode === 32) { // Space key
		if (!isFalling) {
			itsRaining.play() 
		}
		else {maspeek.play()}
    isFalling = !isFalling; // Toggle raindrop falling state
  }
}

function mousePressed() {
    if (!isFalling) {
        itsRaining.play()
    }
    else {
        maspeek.play()
             }
isFalling = !isFalling; // Toggle raindrop falling state
}
