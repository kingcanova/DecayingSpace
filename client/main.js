var socket; // define a global variable called socket 
socket = io.connect(); // send a connection request to the server

var gHeight = 32 * 20;
var gWidth = 32 * 20;

game = new Phaser.Game(gHeight,gWidth,Phaser.AUTO,"gameDiv");

var gameProperties = { 
	gameWidth: 640,
	gameHeight: 640,
	game_elemnt: "gameDiv",
	in_game: false,
};

function createPlayer () {
	//uses Phaser’s graphics to draw a circle
    console.log("Player created");
	player = game.add.graphics(0, 0);
	player.radius = 50;

	// set a fill and line style
	player.beginFill(0xffd900);
	player.lineStyle(2, 0xffd900, 1);
	player.drawCircle(0, 0, player.radius * 2);
	player.endFill();
	player.anchor.setTo(0.5,0.5);
	player.body_size = player.radius; 

	// draw a shape
	game.physics.p2.enableBody(player, true);
	player.body.addCircle(player.body_size, 0 , 0); 
}


//call this function when the player connects to the server.
function onsocketConnected () {
	//create a main player object for the connected user to control
	createPlayer();
	gameProperties.in_game = true;
	// send to the server a "new_player" message so that the server knows
	// a new player object has been created
	socket.emit('new_player', {x: 0, y: 0, angle: 0});
}


// this is the main game state
var main = function(game){
};
// add the 
main.prototype = {
	preload: function() {
        
        game.world.setBounds(0, 0, gameProperties.gameWidth, 
		gameProperties.gameHeight, false, false, false, false);
		//I’m using P2JS for physics system. You can choose others if you want
		game.physics.startSystem(Phaser.Physics.P2JS);
		game.physics.p2.setBoundsToWorld(false, false, false, false, false)
		//sets the y gravity to 0. This means players won’t fall down by gravity
		game.physics.p2.gravity.y = 0;
		// turn gravity off
		game.physics.p2.applyGravity = false; 
		game.physics.p2.enableBody(game.physics.p2.walls, false); 
		// turn on collision detection
		game.physics.p2.setImpactEvents(true);
    },
	//this function is fired once when we load the game
	create: function () {
        game.stage.backgroundColor = 0xE1A193;
		console.log("client started");
		//listen to the “connect” message from the server. The server 
		//automatically emit a “connect” message when the cleint connets.When 
		//the client connects, call onsocketConnected.  
		socket.on('connect', onsocketConnected); 

	},
    
    update: function () { 
        //move the player when he is in game
		if (gameProperties.in_game) {
			// we're using phaser's mouse pointer to keep track of 
			// user's mouse position
			var pointer = game.input.mousePointer;
			
			// distanceToPointer allows us to measure the distance between the 
			// mouse pointer and the player object
			if (distanceToPointer(player, pointer) <= 50) {
				//The player can move to mouse pointer at a certain speed. 
				//look at player.js on how this is implemented.
				movetoPointer(player, 0, pointer, 100);
			} else {
				movetoPointer(player, 500, pointer);
			}
        }
    }
    
    
}



// wrap the game states.
var gameBootstrapper = {
    init: function(gameContainerElementId){
		game.state.add('main', main);
		game.state.start('main'); 
    }
};

//call the init function in the wrapper and specifiy the division id 
gameBootstrapper.init("gameDiv");