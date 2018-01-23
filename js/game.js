"use strict";
var disp = $('.disp'),
    msg = $('.msg');

var dispWidthInPixels=15;
var gameRunning=false;
var gameInterval;
var currentCoin;
var timeStep,currentTime,frameStep;
var BAD_MOVE=1,ACE_MOVE=2,GOOD_MOVE=3;
var availablePixels;

var beep=document.createElement('audio'),
	gameover=document.createElement('audio');

if (!!(beep.canPlayType&&beep.canPlayType('audio/mpeg').replace(/no/,' '))) {
	beep.src='src/beep.mp3';
	gameover.src='src/gameover.mp3';
}else{
	beep.src='src/beep.ogg';
	gameover.src='src/gameover.ogg';

}


//放入畫素
for (var i = 0; i <dispWidthInPixels; i++) {
	for (var j = 0; j < dispWidthInPixels; j++) {

		var tmp =$ ('<div class="pixel" data-x="'+j+'"data-y="'+i+'""> </div>')
			disp.append(tmp);

	}
}
for (var i = 0; i <dispWidthInPixels; i++) {
	for (var j = 0; j < dispWidthInPixels; j++) {
		if (i%2==0&&j%2!=0) {
			$('div.pixel[data-x="'+i+'"][data-y="'+j+'"]').addClass('white');
		}
		if (i%2!=0&&j%2==0) {
			$('div.pixel[data-x="'+i+'"][data-y="'+j+'"]').addClass('white');
		}
	}
}

var showMessage = function(ma,mb){

	msg.find('.msg-a').text(ma);
	msg.find('.msg-b').text(mb);
	$('.msg').removeClass('none');
};

var useNextRandomPixelforCoin=function(){
	var ap =availablePixels;
	if (ap.length===0) {
		return false;
	}
	var idx = Math.floor(Math.random() * ap.length);
	currentCoin=ap.splice(idx,1)[0].split('|');
	$('div.pixel[data-x="'+currentCoin[0]+'"][data-y="'+currentCoin[1]+'"]').addClass('coin');
	return true;
};

var tryAllocatingPixel=function(x,y){
	var ap=availablePixels;
	var p=x+'|'+y;
	var idx=ap.indexOf(p);

	if (idx!==-1) {
		ap.splice(idx,1);
		$('div.pixel[data-x="'+x+'"][data-y="'+y+'"]').addClass('taken');
		return true;
	}else{

		return false;
	}


};
var releasePixel=function(x,y){

	$('div.pixel[data-x="'+x+'"][data-y="'+y+'"]').removeClass('taken');

	availablePixels.push(x+'|'+y);
};

var adjustspeed=function(l){
	if (l>50) {

		frameStep=100;
	}else if(l>40){

		frameStep=130;
	}else if(l>30){

		frameStep=150;
	}else if(l>20){

		frameStep=170;
	}else if(l>15){

		frameStep=190;
	}else if(l>10){

		frameStep=210;
	}else if(l>5){

		frameStep=230;
	}

};

var DIR_DOWN='d',
	DIR_UP='u',
	DIR_LEFT='l',
	DIR_RIGHT='r';


var snake={

	direction:'l',
	bodyPixels: [],
	move: function(){
		var head =this.bodyPixels[this.bodyPixels.length-1];

		var nextHead=[];
		if (this.direction==DIR_LEFT) {

			nextHead.push(head[0]-1);
		}else if (this.direction==DIR_RIGHT) {

			nextHead.push(head[0]+1);
		}else{

			nextHead.push(head[0]);
		}

		if (this.direction==DIR_UP) {

			nextHead.push(head[1]-1);
		}else if (this.direction==DIR_DOWN) {

			nextHead.push(head[1]+1);
		}else{

			nextHead.push(head[1]);
		}

		if (nextHead[0]==currentCoin[0]&&nextHead[1]==currentCoin[1]) {
			$('div.pixel[data-x="'+nextHead[0]+'"][data-y="'+nextHead[1]+'"]').removeClass('coin');
			$('div.pixel[data-x="'+nextHead[0]+'"][data-y="'+nextHead[1]+'"]').addClass('taken');
			this.bodyPixels.push(nextHead);
			beep.play();
			adjustspeed(this.bodyPixels.length);
			if (useNextRandomPixelforCoin()) {
				return GOOD_MOVE;
			}else{

				return ACE_MOVE;
			}
		}else if(tryAllocatingPixel(nextHead[0],nextHead[1])){
			this.bodyPixels.push(nextHead);
			var tail=this.bodyPixels.splice(0,1)[0];
			releasePixel(tail[0],tail[1]);
			return GOOD_MOVE;
		}else{

			return BAD_MOVE;
		}

	}
};


var init =function(){

	frameStep=250;
	timeStep=50;
	currentTime=0;
	availablePixels=[];
	for (var i = 0; i < dispWidthInPixels; i++) {
		for (var j = 0; j < dispWidthInPixels; j++) {
		availablePixels.push(i+'|'+j);
		$('div.pixel[data-x="'+i+'"][data-y="'+j+'"]').removeClass('taken');
		$('div.pixel[data-x="'+i+'"][data-y="'+j+'"]').removeClass('coin');
	}}

	snake.direction="l";
	snake.bodyPixels=[];
	for(var i=11,end=8;i>end;i--){
		tryAllocatingPixel(i,8);
		snake.bodyPixels.push([i,8]);
	}
	useNextRandomPixelforCoin();
};
//init();
var startMainLoop=function(){


	gameInterval=setInterval(function(){

		currentTime+=timeStep;
		if (currentTime>=frameStep) {
			var m=snake.move();
			if (m===BAD_MOVE) {
				clearInterval(gameInterval);
				gameRunning=false;
				gameover.play();
				showMessage('Game Over','press space to start a new game')

			}else if (m===ACE_MOVE) {
				clearInterval(gameInterval);
				gameRunning=false;
				showMessage('Win','press space to start a new game');

			}

		currentTime%=frameStep;	
		}
	},timeStep);

	showMessage(' ',' ');
};
$(window).keydown(function(e){

console.log(e.which);
		var k=e.which;

	//up
	if (k===38) {
		if(snake.direction!==DIR_DOWN)
			snake.direction=DIR_UP;

	//down	
	}else if (k===40) {
		if(snake.direction!==DIR_UP)
			snake.direction=DIR_DOWN;

	//left
	}else if (k===37) {
		if(snake.direction!==DIR_RIGHT)
			snake.direction=DIR_LEFT;

	//right
	}else if (k===39) {

		if(snake.direction!==DIR_LEFT)
			snake.direction=DIR_RIGHT;
	//space
	}else if (k===32) {
		if (!gameRunning) {
			init();
			startMainLoop();
			gameRunning=true;
			$('.msg').addClass('none');
		}

	//p	 暫停功能
	}else if (k===80) {
		if (gameRunning) {
			
			if (!gameInterval) {
				startMainLoop();
				$('.msg').addClass('none');
			}else{
				clearInterval(gameInterval);
				gameInterval=null;
				showMessage('Paused','');
			}
		}

	//f,for left turn
	}else if (k===70) {

		if (snake.direction===DIR_DOWN) {
			snake.direction=DIR_RIGHT;
		}else if (snake.direction===DIR_RIGHT) {
			snake.direction=DIR_UP;
		}else if (snake.direction===DIR_UP) {
			snake.direction=DIR_LEFT;
		}else if (snake.direction===DIR_LEFT) {
			snake.direction=DIR_DOWN;
		};

	//j,for right turn
	}else if (k===74) {

		if (snake.direction===DIR_RIGHT) {
			snake.direction=DIR_DOWN;
		}else if (snake.direction===DIR_UP) {
			snake.direction=DIR_RIGHT;
		}else if (snake.direction===DIR_LEFT) {
			snake.direction=DIR_UP;
		}else if (snake.direction===DIR_DOWN) {
			snake.direction=DIR_LEFT;
		};
	}

});

showMessage('Snake','press space to start');