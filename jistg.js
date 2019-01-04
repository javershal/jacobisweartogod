var c_img;
var p_img;
var Radius = 100;
var x_speed = 2.5;
var y_speed = 2.5
var start_x = 0;
var start_y = 0;
var start_bx = 25;
var start_by = 32;
var x_direct = 1;
var y_direct =1;
var bx_direct = 1;
var by_direct =1;
var start_b2x = 12;
var start_b2y = 169;
var b2x_direct = -1;
var b2y_direct =1;
var song;
var noise;

function preload() {
  noise = loadSound('sounds/istg.mp3');
	song = loadSound('sounds/song.mp3');
}


function setup() {
	song.loop()
	createCanvas(windowWidth, windowHeight);
	c_img = loadImage("images/1512.jpg");
	p_img = loadImage("images/nik.png")
	flyswat = loadImage("images/flyswatter.png")
	c_img.resize(windowWidth,windowHeight);
	image(c_img,0,0)
	image(p_img,windowWidth/2,windowHeight/2);
	//image(b_img,windowWidth/1.25, windowHeight/1.2)
	

}

function draw() {
	c_img.resize(windowWidth,windowHeight);
	p_img.resize(Radius,Radius);
	//b_img.resize(Radius,Radius);
	//b2_img.resize(Radius,Radius);
	image(c_img,0,0);
	start_x += x_speed * x_direct;
  start_y += y_speed * y_direct;
	if(start_x <0 ||(windowWidth - Radius) < start_x) {
        x_direct *= -1;};
	if(start_y <0 || (windowHeight - Radius) < start_y) {
				y_direct *= -1;};
	
	start_x += x_speed * x_direct;
  start_y += y_speed * y_direct;
	image(p_img,start_x, start_y);
	
	
	//bebimage
	//if(start_bx <0 ||(windowWidth - Radius) < start_bx) {
   //     bx_direct *= -1;};
	//if(start_by <0 || (windowHeight - Radius) < start_by) {
		//		by_direct *= -1;};

	//image(b_img,start_bx, start_by);
	//start_bx += x_speed*.45 * bx_direct;
  //start_by += y_speed*1.25 * by_direct;
	
	//beb2image
	//if(start_b2x <0 ||(windowWidth - Radius) < start_b2x) {
    //    b2x_direct *= -1;};
	//if(start_b2y <0 || (windowHeight - Radius) < start_b2y) {
		//		b2y_direct *= -1;};

	//image(b2_img,start_b2x, start_b2y);
	//start_b2x += x_speed*1.2 * b2x_direct;
  //start_b2y += y_speed*1.9 * b2y_direct;
	
	image(flyswat,mouseX-flyswat.width/2, mouseY-flyswat.height/2);
		
}

function mousePressed() {
	function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
};
	
	if (dist(mouseX,mouseY,start_x + (p_img.width/2),start_y + (p_img.height/2))<100) {
		start_x = getRandomInt(windowWidth - p_img.width);
		start_y=  getRandomInt(windowHeight - p_img.height);;
		noise.play()
	}
}
