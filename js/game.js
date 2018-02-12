/*
 * Author: Tristan Canova
 * E-mail: tcanova1@gmail.com
 */

var Game = {};

Game.init = function(){
    game.stage.disableVisibilityChange = true;
};

Game.preload = function() {
    game.load.tilemap('map', 'assets/map/example_map.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.spritesheet('tileset', 'assets/map/tilesheet.png',32,32);
    game.load.image('sprite','assets/sprites/car.png');
    cursors = game.input.keyboard.createCursorKeys();
};

Game.create = function(){
    //Create a playermap for all of the players
    var me = this;
    Game.playerMap = {};
    Game.playerInfo = {};
    Game.player = {};
    var map = game.add.tilemap('map');
    map.addTilesetImage('tilesheet', 'tileset'); // tilesheet is the key of the tileset in map's JSON file
    var layer;
    for(var i = 0; i < map.layers.length; i++) {
        layer = map.createLayer(i);
    }
    me.game.physics.startSystem(Phaser.Physics.P2JS);
    me.game.physics.p2.gravity.y = 0;
    Game.createdPlayer = false;
    Client.askNewPlayer();
    
};

Game.update = function(){
    if(Game.createdPlayer)
    {
        if(cursors.left.isDown){Game.player.body.rotateLeft(100);}
        else if(cursors.right.isDown){Game.player.body.rotateRight(100);}
        else{Game.player.body.setZeroRotation();}
        if(cursors.up.isDown){Game.player.body.thrust(200);}
        else if(cursors.down.isDown){Game.player.body.reverse(100);}
        //console.log(Game.player.body.rotation);
        Client.movePlayer({x: Game.player.body.x, y: Game.player.body.y, angle: Game.player.body.rotation});//WORKING ON THIS NEXT
    }
};

Game.createPlayer = function(id,x,y,angle){
    Game.playerInfo = {
        id: id,
        x: x,
        y: y,
        angle: angle
        
    };
    Game.createdPlayer = true;
    Game.player = game.add.sprite(x,y,'sprite');
    game.physics.p2.enableBody(Game.player, true);
    console.log("create player with location:"+ x + " ," + y);
};

Game.addNewPlayer = function(id,x,y,angle){
    Game.playerMap[id] = game.add.sprite(x,y,'sprite');
    console.log("new player with location:"+ x + " ," + y);
};

Game.removePlayer = function(id){
    console.log("removing a player");
    Game.playerMap[id].destroy();
    delete Game.playerMap[id];
};