//Set up the express requirement and our application, hook it up to a server so we can then require that the server be run with socket.io for communication
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

//Give the paths to the objects because they will not be static depending on where they are hosted
app.use('/css',express.static(__dirname + '/css'));
app.use('/js',express.static(__dirname + '/js'));
app.use('/assets',express.static(__dirname + '/assets'));

//send the index.html as the root of the webpage
app.get('/',function(req,res){
    res.sendFile(__dirname+'/index.html');
});


//Make the server listen to port 8081
server.listen(process.env.PORT || 8081,function(){
    console.log('Listening on '+server.address().port);
});

//Listen for the connection call from the client socket.
io.on('connection',function(socket){

    //listen for the newplayer call from the client, when called create a new player.
    socket.on('newplayer',function(){
        socket.player = {
            id: this.id,
            x: randomInt(100,400),
            y: randomInt(100,400),
            angle: 0
        };
        console.log("created new player object on server");
        socket.emit('myPlayer',socket.player);
        socket.emit('allplayers',getAllPlayers(socket.player.id));
        socket.broadcast.emit('newplayer',socket.player);

        //On our click function we move a player
        socket.on('movePlayer',function(data){
            console.log('move to '+data.x+', '+data.y+', '+data.angle);
            socket.player.x = data.x;
            socket.player.y = data.y;
            socket.player.angle = data.angle;
            io.emit('move',socket.player);
        });

        //Remove the player on disconect call from all clients
        socket.on('disconnect',function(){
            io.emit('remove',socket.player.id);
        });
        
    });

    socket.on('test',function(){
        console.log('test received');
    });
});

function getAllPlayers(id){
    var players = [];
    //console.log(id);
    Object.keys(io.sockets.connected).forEach(function(socketID){
        var player = io.sockets.connected[socketID].player;
        //console.log(player.id);
        if(player && player.id != id) players.push(player);
    });
    return players;
}

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}
