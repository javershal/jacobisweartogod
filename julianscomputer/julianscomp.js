var shapes = [];
var amountOfShapes = 5;
var growSpeedLimit = 30;


function setup() {
  createCanvas(windowWidth, windowHeight);
}
 function mousePressed() {
	 
  var roundy = {
			name: "circle",
  	  x: mouseX,
    	y: mouseY,
    	size: random(100,20),
      speed: random(growSpeedLimit),
      color: color(random(255), random(255), random(255))
	  }

  var hard = {
			name: "square",
  	  x: mouseX,
    	y: mouseY,
    	size: random(100,20),
      speed: random(growSpeedLimit),
      color: color(random(255), random(255), random(255))
	  }
	
	var triboy = {
		name: "triangle",
		x: mouseX,
		y: mouseY,
		size: random(6),
		topVertx: mouseX,
		topVerty: (mouseY + (1.877 * size)),
		leftVertx: (mouseX - (size/2)),
		leftVerty: (mouseY - (1.877 * size)),
		rightVertx: (mouseX + (size/2)),
		rightVerty: (mouseY - (1.877 * size)),
    speed: random(growSpeedLimit),
		color: color(random(255), random(255), random(255))

	}
							
	//randomize which shape gets pushed to array
	
		randNum = random(1);
		if (randNum < .33) 
		{shapes.push(roundy);}
		else if (randNum < .66) {shapes.push(hard);}
		else {shapes.push(triboy);}
 }


function keyPressed() {
	 
  var roundy = {
			name: "circle",
  	  x: random(width),
    	y: random(height),
    	size: random(100,20),
      speed: random(growSpeedLimit),
      color: color(random(255), random(255), random(255))
	  }

  var hard = {
			name: "square",
  	  x: random(width),
    	y: random(height),
    	size: random(100,20),
      speed: random(growSpeedLimit),
      color: color(random(255), random(255), random(255))
	  }
	
	var triboy = {
		name: "triangle",
		x: random(width),
		y: random(height),
		size: random(6),
		topVertx: mouseX,
		topVerty: (mouseY + (1.877 * size)),
		leftVertx: (mouseX - (size/2)),
		leftVerty: (mouseY - (1.877 * size)),
		rightVertx: (mouseX + (size/2)),
		rightVerty: (mouseY - (1.877 * size)),
    speed: random(growSpeedLimit),
		color: color(random(255), random(255), random(255))

	}
							
	//randomize which shape gets pushed to array
	
		randNum = random(1);
		if (randNum < .33) 
		{shapes.push(roundy);}
		else if (randNum < .66) {shapes.push(hard);}
		else {shapes.push(triboy);}
 }


function draw() {
  background(0,8);
  fill(255);
	noStroke()
	if (shapes.length > amountOfShapes) {shapes.shift()}
  for (var i=0; i<shapes.length; i++) {
    var theshape = shapes[i];
    fill((theshape.color));
    theshape.size += theshape.speed;
    drawShape(theshape)
  }
	
}

function drawShape(shape) {
	if (shape.name === "square")
	{rectMode(CENTER);
	 rect(shape.x, shape.y, shape.size, shape.size);}
	else if (shape.name === "circle")
	{ellipse(shape.x, shape.y, shape.size);}
	else if (shape.name === "triangle")
	{triangle(shape.x, (shape.y + (.5 * shape.size)), (shape.x -(shape.size/2)), (shape.y - (.5 * shape.size)), (shape.x +(shape.size/2)), (shape.y - (.5 * shape.size)));}
	
}
 

