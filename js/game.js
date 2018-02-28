/*
 * Author: Tristan Canova
 * E-mail: tcanova1@gmail.com
 */

///CURRENTLY WORKING ON BULLET SHIT

var Game = {};
Game.init = function(){
    game.stage.disableVisibilityChange = true;
};

Game.preload = function() {
    game.load.tilemap('map', 'assets/map/example_map.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.spritesheet('tileset', 'assets/map/tilesheet.png',32,32);
    game.load.image('sprite','assets/sprites/car.png');
    game.load.image('bullet', 'assets/sprites/bullet.png');
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
    
   
    Game.createdPlayer = false;
    
    
    weapon = game.add.weapon(10,'bullet');
    weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
    weapon.bulletSpeed = 600;
    
    
    fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    
    Client.askNewPlayer();
    
};
var update = 0;

Game.update = function(){
    if(Game.createdPlayer)
    {
        if (cursors.up.isDown)
        {
            game.physics.arcade.accelerationFromRotation(Game.player.rotation, 300, Game.player.body.acceleration);
            //Client.movePlayer(Game.player);
            
        }
        else
        {
            Game.player.body.acceleration.set(0);
        }

        if (cursors.left.isDown)
        {
            Game.player.body.angularVelocity = -300;
        }
        else if (cursors.right.isDown)
        {
            Game.player.body.angularVelocity = 300;
        }
        else
        {
            Game.player.body.angularVelocity = 0;
        }

        if (fireButton.isDown)
        {
            weapon.fire();
        }
        game.world.wrap(Game.player, 16);
        
        //Client.movePlayer(Game.player);
    }
};

Game.moveEnemy = function(id,x,y,angle){
    if(Game.createdPlayer)
    {
        enemy = Game.playerMap[id];
        enemy.body.x = x;
        enemy.body.y = y;
        enemy.body.rotation = angle;
        console.log("moved player or should have");
    }
};

Game.createPlayer = function(id,x,y,angle){//Added arcade physics here
    Game.playerInfo = {
        id: id,
        x: x,
        y: y,
        angle: angle
        
    };
    Game.createdPlayer = true;
    Game.player = game.add.sprite(x,y,'sprite');
    game.physics.arcade.enable(Game.player);
    game.camera.follow(Game.player);
    Game.player.body.drag.set(70);
    Game.player.body.maxVelocity.set(200);
    Game.player.anchor.set(0.5);
    weapon.trackSprite(Game.player, 0, 0, true);
    
    
    
    console.log("create player with location:"+ x + " ," + y);
};

Game.addNewPlayer = function(id,x,y,angle){
    enemy = game.add.sprite(x,y,'sprite');
    game.physics.arcade.enable(enemy);
    enemy.body.drag.set(70);
    enemy.body.maxVelocity.set(200);
    enemy.anchor.set(0.5);
    Game.playerMap[id] = enemy;
    console.log("new player with location:"+ x + " ," + y);
};

Game.removePlayer = function(id){
    console.log("removing a player");
    Game.playerMap[id].destroy();
    delete Game.playerMap[id];
};