var Client = {}; // define a global variable called socket 
Client.socket = io.connect(); // send a connection request to the server

var gHeight = 32 * 20;
var gWidth = 32 * 20;

var game = new Phaser.Game(gHeight,gWidth,Phaser.AUTO,"gameDiv");

//the enemy player list 
var enemies = [];

var gameProperties = { 
	gameWidth: 640,
	gameHeight: 640,
	game_elemnt: "gameDiv",
	in_game: false
};

function createPlayer () {
	//uses Phaser’s graphics to draw a circle
    console.log("Player created");
	player = game.add.sprite(32,game.world.height-150,'car');

	// draw a shape
	game.physics.p2.enableBody(player, true); 
}


//call this function when the player connects to the server.
function onsocketConnected() {
	//create a main player object for the connected user to control
    console.log("Player connected to the server");
	createPlayer();
	gameProperties.in_game = true;
	// send to the server a "new_player" message so that the server knows
	// a new player object has been created
	Client.socket.emit('new_player', {x: 32, y: game.world.height-150, angle: 0});
}

// When the server notifies us of client disconnection, we find the disconnected
// enemy and remove from our game
function onRemovePlayer (data) {
	var removePlayer = findplayerbyid(data.id);
	// Player not found
	if (!removePlayer) {
		console.log('Player not found: ', data.id);
		return;
	}
	
	removePlayer.player.destroy();
	enemies.splice(enemies.indexOf(removePlayer), 1);
}


// this is the enemy class. 
var remote_player = function (id, startx, starty, start_angle) {
	this.x = startx;
	this.y = starty;
	//this is the unique socket id. We use it as a unique name for enemy
	this.id = id;
	this.angle = start_angle;
	
	this.player = game.add.sprite(32,game.world.height-150,'car');

	game.physics.p2.enableBody(this.player, true);
}



//Server will tell us when a new enemy player connects to the server.
//We create a new enemy in our game.
function onNewPlayer (data) {
	console.log(data);
	//enemy object 
	var new_enemy = new remote_player(data.id, data.x, data.y, data.angle); 
	enemies.push(new_enemy);
}


//Server tells us there is a new enemy movement. We find the moved enemy
//and sync the enemy movement with the server
function onEnemyMove (data) {
	console.log(data.id);
	console.log(enemies);
	var movePlayer = findplayerbyid(data.id); 
	
	if (!movePlayer) {
		return;
	}
	movePlayer.player.body.x = data.x; 
	movePlayer.player.body.y = data.y; 
	movePlayer.player.angle = data.angle; 
}



//This is where we use the socket id. 
//Search through enemies list to find the right enemy of the id.
function findplayerbyid (id) {
	for (var i = 0; i < enemies.length; i++) {
		if (enemies[i].id == id) {
			return enemies[i]; 
		}
	}
}





// this is the main game state
var main = function(game){
};
// add the 
main.prototype = {
	preload: function() {
        game.stage.disableVisibilityChange = true;
        game.world.setBounds(0, 0, gameProperties.gameWidth, gameProperties.gameHeight, false, false, false, false);
		//I’m using P2JS for physics system. You can choose others if you want
		game.physics.startSystem(Phaser.Physics.P2JS);
		game.physics.p2.setBoundsToWorld(false, false, false, false, false);
		//sets the y gravity to 0. This means players won’t fall down by gravity
		game.physics.p2.gravity.y = 0;
		// turn gravity off
		game.physics.p2.applyGravity = false; 
		game.physics.p2.enableBody(game.physics.p2.walls, false); 
		// turn on collision detection
		game.physics.p2.setImpactEvents(true);
        game.load.image('car','/assets/car.png');
        cursors = game.input.keyboard.createCursorKeys();
    },
	//this function is fired once when we load the game
	create: function () {
        game.stage.backgroundColor = 0xE1A193;
		console.log("client started");
		//listen to the “connect” message from the server. The server 
		//automatically emit a “connect” message when the cleint connets.When 
		//the client connects, call onsocketConnected.  
		Client.socket.on('connect', onsocketConnected); 
        
        //listen to new enemy connections
		Client.socket.on('new_enemyPlayer', onNewPlayer);
		//listen to enemy movement 
		Client.socket.on('enemy_move', onEnemyMove);
		
		// when received remove_player, remove the player passed; 
		Client.socket.on('remove_player', onRemovePlayer); 

	},
    
    update: function () { 
        //move the player when he is in game
		if (gameProperties.in_game) {
            //ship movement
			if(cursors.left.isDown){player.body.rotateLeft(100);}
            else if(cursors.right.isDown){player.body.rotateRight(100);}
            else{player.body.setZeroRotation();}
            if(cursors.up.isDown){player.body.thrust(200);}
            else if(cursors.down.isDown){player.body.reverse(100);}
            
            //Send a new position data to the server 
			Client.socket.emit('move_player', {x: player.x, y: player.y, angle: player.angle});
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