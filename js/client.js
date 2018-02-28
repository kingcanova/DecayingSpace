/**
 * Created by Tristan Canova
 */

var Client = {};
Client.socket = io.connect();

Client.sendTest = function(){
    console.log("test sent");
    Client.socket.emit('test');
};

Client.askNewPlayer = function(){
    Client.socket.emit('newplayer');
};

Client.movePlayer = function(data){
    console.log("got to the client movePlayer function");
    Client.socket.emit('movePlayer',data);//////IM HERE TO RESTART
};

Client.socket.on('newplayer',function(data){
    console.log("we got to new player, from a differnt socket");
    Game.addNewPlayer(data.id,data.x,data.y,data.angle);
});

Client.socket.on('myPlayer',function(data){
    console.log("we got to my player");
    Game.createPlayer(data.id,data.x,data.y,data.angle); 
});

Client.socket.on('move',function(data){
    Game.moveEnemy(data.id,data.x,data.y,data.angle);
    console.log("should have moved player");
});

Client.socket.on('allplayers',function(data){
    for(var i = 0; i < data.length; i++){
        Game.addNewPlayer(data[i].id,data[i].x,data[i].y,data[i].angle);
        //console.log("we should not have gotten here yet");
    }

    Client.socket.on('remove',function(id){
        Game.removePlayer(id);
    });
});

