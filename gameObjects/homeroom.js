// Homeroom extends ChatRoom

var _ = require("lodash");
var util = require("util");
var ChatRoom = require("./chatroom");


function Homeroom(params) {
	ChatRoom.call(this, params);
	
	// set up flood protection
	this.setupFloodWatch(Homeroom.FLOOD_INTERVAL, Homeroom.FLOOD_MAXIMUM, Homeroom.FLOOD_SQUELCH_TIME);
}

util.inherits(Homeroom, ChatRoom);

// CONSTANTS
Homeroom.FLOOD_MAXIMUM  = 7;		// if user sends more than 7 chats
Homeroom.FLOOD_INTERVAL = 8000; 	// in 8 seconds
Homeroom.FLOOD_SQUELCH_TIME = 60000;// then squelch them for 60 seconds


// METHODS


Homeroom.prototype.getInfo = function() {
	var info = Homeroom.super_.prototype.getInfo.call(this);
	info.type = "Homeroom";
	return info;
}


// receive events when game rooms are created or destroyed, change open/full/fighting status, or join/leave members; forward to client
// event = {update:string, roomInfo:{object}}
//   where update is start, destroy, occupants, or status
Homeroom.prototype.handleGameUpdate = function(event) {
	//console.log("gameUpdate:", event);
	this.broadcast('gameUpdate', event);
}



// join override:
//   when connection joins homeroom, subscribe to school gameroom updates for them
//	 callback: done(err, info about this room)
Homeroom.prototype.join = function(conn, done) {
	Homeroom.super_.prototype.join.call(this, conn, function(err, roomInfo) {
		if (!err) {
			console.log("gameroom joined by " + conn.user.nickname);
			roomInfo.type = "Homeroom";
			if (done) done(null, roomInfo);
		}
		else {
			console.log(conn.user.nickname + " couldn't join gameroom: ", err);
			if (done) done(err);
		}
	});
}


module.exports = Homeroom;