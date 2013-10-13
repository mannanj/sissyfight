// GameRoomPlayer extends Container

// display avatar with nametag, health, speech bubble, shadow, move status.


// namespace:
this.sf = this.sf||{};

(function() {

//args:
// position: 0-5 (0 is always current player), kept for GameRoom's use and to choose uniform and text
// playerInfo: {nickname, avatar}
// textElement: html div to use for chat text
var GameRoomPlayer = function() {
  this.initialize.apply(this,arguments);
}

var p = GameRoomPlayer.prototype = new createjs.Container();

	p.Container_initialize = p.initialize;
	
	p.initialize = function(position, playerInfo, textElement) {
		this.Container_initialize();
		
		this.position = position;
		this.playerInfo = playerInfo;
		this.textElement = textElement;
		
		this.playerInfo.avatar.uniformcolor = position;
		// players on the left side of the screen face right; the other half face left
		if (position < sf.GameRoom.MAX_PLAYERS/2) this.playerInfo.avatar.headdir = 1;
		else this.playerInfo.avatar.headdir = 0;
		// all players have left-facing posture
		this.playerInfo.avatar.bodydir = 0;
		// allow avatar background elements
		this.playerInfo.avatar.remove_background = false
		
		this.prepareAssets();
		
		
		
		this.items = {};
		
		this.items.shadow = this.addChild(this.assets.shadow.clone());
		this.items.shadow.x = 20;
		this.items.shadow.y = 180;
		
		this.items.avatar = this.addChild(new sf.Avatar());
		this.items.avatar.setLook(this.playerInfo.avatar);
		this.items.avatar.x = 46;
		this.items.avatar.y = 83;
		
		this.items.health = this.addChild(this.assets.heart_10.clone());
		this.items.health.x = 0;
		this.items.health.y = 77;
		this.items.health.visible = false;
		
		this.items.status = this.addChild(this.assets.status_undecided.clone());
		this.items.status.x = 70;
		this.items.status.y = 77;
		
		// text color is the same as the 2nd color in uniform palette - convert it to css rgb form:
		var textColor = 'rgb(' + config.colors.uniforms.vars[playerInfo.avatar.uniformcolor][1].join(',') + ')';
		
		this.items.nametag = this.addChild(new createjs.Text(this.playerInfo.nickname, '11px Arial', textColor));
		this.items.nametag.textAlign = 'center';
		this.items.nametag.x = 43;
		this.items.nametag.y = 80;
		
		this.items.bubble = this.addChild(this.assets.bubble.clone());
		this.items.bubble.x = 0;
		this.items.bubble.y = 0;
		
		this.items.chatText = this.addChild(new createjs.DOMElement(this.textElement));
		this.items.chatText.setFakeScale(g.gameScale);
		this.items.chatText.setPosition(5, 7);
		this.items.chatText.setSize(76, 59);

		
		this.chatBuffer = [];
	}
	
	
	p.start = function() {
		this.items.chatText.setVisible(true);
	}
	p.destroy = function() {
		this.items.chatText.setVisible(false);
		this.items.chatText.htmlElement.innerHTML = '';
	}
	
	
	
	
	p.prepareAssets = function() {
		this.assets = {};
		_.each(['gameroom_bgitems', 'player_items'], function(s) {
			g.load.unpack(s, this.assets);
		}, this);

	}
	
	
	
	// incoming chat
	p.handlesay = function(text) {
		this.chatBuffer.push(text);
		while(this.chatBuffer.length > 8) this.chatBuffer.shift();
		this.items.chatText.htmlElement.innerHTML = this.chatBuffer.join('<br/>');
		this.items.chatText.htmlElement.scrollTop = this.items.chatText.htmlElement.scrollHeight;
	}
	
	
	
	// requests from gameroom
	
	// reset the action status display to undecided
	p.resetActed = function() {
		this.items.status.gotoAndStop('status_undecided');
	}
	
	// set the action status display to decided (and blink it)
	p.setActed = function(blink) {
		this.items.status.gotoAndStop('status_decided');
		if (blink) createjs.Tween.get(this.items.status).wait(150).to({visible:false},0).wait(150).to({visible:true},0).wait(150).to({visible:false},0).wait(150).to({visible:true},0);
	}
	
	
	p.hideHealth = function(h) {
		this.items.health.visible = false;
	}
	p.setHealth = function(h) {
		this.items.health.gotoAndStop('heart_'+h);
		this.items.health.visible = true;
	}
	p.setStatus = function(s) {
		// for now, health is the only member of status
		this.status = s;
		this.setHealth(s.health);
	}
	p.getStatus = function() {
		return this.status;
	}
	p.hasLost = function() {
		return (this.status.health==0);
	}
	
	
	p.setPose = function(pose) {
		switch (pose) {
			case 'normal':
				this.items.avatar.setLook({pose:0});
				break
			
			case 'crying':
				this.items.avatar.setLook({pose:1});
				break			
				
			case 'victory':
				this.items.avatar.setLook({pose:2});
				break
				
		}
	}
	
	
	
	sf.GameRoomPlayer = GameRoomPlayer;

})()