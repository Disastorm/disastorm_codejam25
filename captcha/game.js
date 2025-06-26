


/** Params **/

/**
* This is the initial Wind Strength.
* It gets weaker as time goes on.
*/
let windStrength = 0.005; // default 0.005

/**
* This is how much the windStrength gets multiplied with each easier stage.
*/
const easierRatio = 0.9; // some other potential values: 0.5

/**
* This is the time in milliseconds that a single "Difficulty Stage" will last.
* After this time, the wind will enter the next easier stage.
*/
let difficultyTime = 11000; // ms, some other potential values: 45000, 15000


/**
* This is the needed time in seconds to win the captcha.
* Once the boxes are stacked for this consecutive amount of seconds, it will be a success.
*/
const neededTime = 5; // seconds, default 5s







// module aliases
var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
	Mouse = Matter.Mouse,
	MouseConstraint = Matter.MouseConstraint,
    Composite = Matter.Composite;

// create an engine
var engine = Engine.create();

// create a renderer
var render = Render.create({
    element: document.body,
    engine: engine,
	pixelRatio: 'auto',
	options: {
		width: 390,
		height: 300,
		background: "bg2.png"
	}
});
Render.setSize(render, 390, 300);

let isMouseDown = false;
let firstClicked = false;

document.addEventListener('touchend', () => {
  isMouseDown = false;
 // console.log("Mouse button is up");
});
document.addEventListener('touchstart', () => {
  isMouseDown = true;
  if(!firstClicked){
	  setTimeout(makeEasier, difficultyTime);
  }
  firstClicked = true;
 // console.log("Mouse button is down");
});

document.addEventListener('mousedown', () => {
  isMouseDown = true;
  if(!firstClicked){
	  setTimeout(makeEasier, difficultyTime);
  }
  firstClicked = true;
 // console.log("Mouse button is down");
});


document.addEventListener('mouseup', () => {
  isMouseDown = false;
 // console.log("Mouse button is up");
});


const numBoxes = 5;
const boxes = []
for(let i=0;i < numBoxes;i++){
	var boxA = Bodies.rectangle(185 + Math.floor(Math.random() * 150), 50, 50, 50, {
	  render: {
		sprite: {
		  texture: 'crate.png',
		  xScale: 0.5,
		  yScale: 0.5,
		  xOffset: 0,
		  yOffset: 0,
		},
	  },
	  density: 0.005,
	});
	boxes.push(boxA);
}

var ground = Bodies.rectangle(200, 325, 410, 60, { isStatic: true, render: {visible: false} });
var roof = Bodies.rectangle(200, -30, 455, 60, { isStatic: true, render: {visible: false} });
var wallL = Bodies.rectangle(-15, 300, 30, 810, { isStatic: true, render: {visible: false} });
var wallR = Bodies.rectangle(415, 300, 30, 810, { isStatic: true, render: {visible: false} });


// add all of the bodies to the world
Composite.add(engine.world, [...boxes, ground, roof, wallL, wallR]);


// run the renderer
Render.run(render);

// create runner
var runner = Runner.create();
var world = engine.world;

// add mouse control
var mouse = Mouse.create(render.canvas),
	mouseConstraint = MouseConstraint.create(engine, {
		mouse: mouse,
		constraint: {
			stiffness: 0.2,
			render: {
				visible: false
			}
		}
	});
Composite.add(world, mouseConstraint);

// keep the mouse in sync with rendering
render.mouse = mouse;

/* Matter.Events.on(mouseConstraint, "mousedown", (event) => {
  if (mouseConstraint.body) {
    console.log("Clicked body:", mouseConstraint.body);
  }
});

Matter.Events.on(mouseConstraint, "touchstart", (event) => {
  if (mouseConstraint.body) {
    console.log("Clicked body:", mouseConstraint.body);
  }
}); */

const windBlowing = [0, 0, 0];

Matter.Events.on(engine, 'beforeUpdate', function(event) {
	for(let i=0;i < windBlowing.length;i++){
		if(windBlowing[i] === 0) continue;
		boxes.forEach(box => {
			if(box.position.y > 50 * i && box.position.y < 50 * 2*i){
				Matter.Body.applyForce(box, box.position, { x: windBlowing[i] * (Math.random() * windStrength), y: 0 });
			}
		});
	}
});

const getHighestBox = () => {
	let highest = boxes[0];
	for(let i=1;i < boxes.length;i++){
		const box = boxes[i];
		if(box.position.y < highest.position.y){
			highest = box;
		}
	}
	return highest;
};

let stacked = false;
const checkBoxesStacked = () => {
	const alreadyChecked = {};
	const isNearOtherBoxVertically = (box, index) => {
		for(let i=0;i < boxes.length;i++){
			const oBox = boxes[i];
			if(oBox === box) continue;
			if(alreadyChecked[i]) continue;
			if(Math.abs(oBox.position.y - box.position.y) < 45){
				return true;
			}
		}
		alreadyChecked[index] = true;
		return false;
	};
	
	let isStacked = true;
	for(let i=0;i < boxes.length;i++){
		const box = boxes[i];
		if(isNearOtherBoxVertically(box, i)){
			isStacked = false;
			break;
		}
	}
	if(isStacked){
		stacked = true;
	}else{
		stacked = false;
	}
};

const logic = () => {
	for(let i=0;i < windBlowing.length;i++){
		// windBlowing[i] = Math.round((Math.random() * 2)) - 1; // -1 to 1
		windBlowing[i] = Math.round(Math.random()); // 0 to 1
	}
	if(!isMouseDown){
		checkBoxesStacked();
	}else{
		stacked = false;
	}
};
setInterval(logic, 1000);

const makeEasier = () => {
	windStrength = windStrength * easierRatio;
	setTimeout(makeEasier, difficultyTime);
};

let img = new Image();
img.onload = function() {
   render.context.drawImage(img, 10, 10);
};
img.src = 'windframe.png';

let queen = new Image();
queen.onload = function() {
   render.context.drawImage(img, 10, 10);
};
queen.src = 'beanq.png';

let honeybean = new Image();
honeybean.onload = function() {
   render.context.drawImage(img, 10, 10);
};
honeybean.src = 'hbbb.png';


/* Matter.Events.on(render, 'beforeRender', function() {
	render.context.drawImage(queen, 100, 100);
});
 */
let windScroll = -600;
let stackStartTime = 0;
Matter.Events.on(render, 'afterRender', function() {
     var context = render.context;
	 render.context.drawImage(queen, -10, 200, 100, 100);
	 render.context.drawImage(honeybean, 150, -15, 100, 100);
	 
	 context.drawImage(img, windScroll, 30, 100, 100);
	 windScroll++;
	 if(windScroll > 650){
		 windScroll = -600;
	 }
	 
	 if(!firstClicked){
		context.fillStyle = "black";
		context.fillRect(-10, 90, 400, 100);
		context.font = "25px Arial";
		context.fillStyle = 'white';
		context.fillText("Help the Queen Bean rescue", 15, 125);
		context.fillText("the Honey Bean Butterfly Baby.", 15, 170);
	 }
	 
	 if(stacked){
		if(stackStartTime === 0){
			stackStartTime = Date.now();
		}
		const remainingTime = neededTime - Math.floor((Date.now() - stackStartTime)/1000);
		
		if(remainingTime <= 0){
			const highestBox = getHighestBox();
			if(highestBox.position.x+25 > 170 && highestBox.position.x+25 < 280){
				// Success
				window.top.postMessage("success", '*');
			}else{
				// too far message display
				context.font = "50px Arial";
				context.fillStyle = 'blue';
				context.fillText("TOO FAR", 85, 150);
			}
		}else{
			context.font = "100px Arial";
			context.fillStyle = 'blue';
			context.fillText(remainingTime, 170, 170);
		}
	 }else{
		 stackStartTime = 0;
	 }
});

render.options.wireframes = false;

// run the engine
Runner.run(runner, engine);