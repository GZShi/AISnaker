var FPS = 10;

function rgba(r, g, b, a) {
	return "rgba(" + r + "," + g + "," + b + "," + (a==null?1:a) + ")";
}

function game () {
	this.bodyArray = [{x:9, y:9}];		// 蛇身体坐标
	this.direction = 2;		// 蛇方向信息
	this.food = {x:13, y:17};		// 食物坐标

	this.draw = function (ctx) {
		// 绘制蛇
		var length = this.bodyArray.length;
		for (var i = 0; i < length; ++i) {
			ctx.fillStyle = rgba(123, 22, 88, 0.3+0.7*(i/length));
			ctx.fillRect(this.bodyArray[i].x*20, this.bodyArray[i].y*20, 20, 20);
		}
		// 绘制食物
		ctx.fillStyle = 'yellow';
		ctx.fillRect(this.food.x*20, this.food.y*20, 20, 20);
	}


	this.updateSnake = function (  ) {
		var newHeader = this.getNextHeader(' ');
		var ret = true;
		if(!this.checkHitFood(newHeader)) {
			this.bodyArray.shift();
			ret = false;
		}
		this.bodyArray.push(newHeader);
		return ret;
	}

	this.changeDirection = function (newDirection) {
		if(typeof newDirection == 'string') {
			if(newDirection == 'l')
				this.direction = (3 + this.direction) % 4;
			else if(newDirection == 'r')
				this.direction = (this.direction + 1) % 4;
			else
				return false;
			return true;
		}
		newDirection = newDirection % 4;
		if( Math.abs(newDirection - this.direction) == 2) {
			return false;
		} 
		this.direction = newDirection;
		return true;
	} 

	//////////////////////////////////// API ////////////////////////////////////

	// 获取蛇的头部坐标
	this.getSnakeHeader = function () {
		return {
			x: this.bodyArray[this.bodyArray.length-1].x,
			y: this.bodyArray[this.bodyArray.length-1].y
		}
	}

	this.getFoodPosition = function () {
		return {
			x: this.food.x,
			y: this.food.y
		}
	}

	this.getFoodRelativePos = function (pos) {
		var rx = this.food.x - pos.x;
		var ry = this.food.y - pos.y;
		switch(this.direction) {
		case 3:
			return {x: rx, y: ry};
		case 1:
			return {x: -rx, y: -ry};
		case 0:
			return {x: ry, y: -rx};
		case 2:
			return {x: -ry, y: rx};
		}
	}

	// 二维数组，0代表空白，-1代表食物，1代表头部
	this.getMap = function () {
		var array = new Array();
		for(var i = 0; i < 25; ++i) {
			array[i] = new Array();
			for(var j = 0; j < 25; ++j) {
				array[i][j] = 0;
			}
		}
		var length = this.bodyArray.length;
		for(var i = 0; i < length; ++i) {
			array[this.bodyArray[i].y][this.bodyArray[i].x] = i+1;
		}
		array[this.food.y][this.food.x] = -1;
		return array;
	}

	// 提前计算蛇头部的下一个位置
	this.getNextHeader = function (direct) {
		var header = this.getSnakeHeader();
		if(typeof direct == "string") {
			if(direct == 'l')
				direct = (this.direction + 3)%4;
			else if(direct == 'r') 
				direct = (this.direction + 1)%4;
			else
				direct = this.direction;
		} else if(direct == null) {
			direct = this.direction;
		}
		switch(direct%4) {
		case 2: 	// east
			return {x:header.x+1, y:header.y};
		case 0: 	// west
			return {x:header.x-1, y:header.y};
		case 1: 	// north
			return {x:header.x, y:header.y-1};
		case 3: 	// south
			return {x:header.x, y:header.y+1};
		}
	}

	this.checkHitSnakeBody = function (position) {
		var length = this.bodyArray.length;
		// 不检测与尾巴碰撞
		for (var i = 1; i < length-1; ++i) {
			if(this.bodyArray[i].x == position.x && this.bodyArray[i].y == position.y) {
				return true;
			}
		}
		return false;
	}

	this.checkHitWall = function (position) {
		if(position.x < 0 || position.y < 0 || position.x >= 25 || position.y >= 25) {
			return true;
		}
		return false;
	}

	this.checkHitFood = function (position) {
		if (this.food.x == position.x && this.food.y == position.y) {
			var newPos = {x:Math.floor(Math.random()*25), y:Math.floor(Math.random()*25)};
			while(true) {
				if(this.food.x == newPos.x && this.food.y == newPos.y) {
					newPos = {x:Math.floor(Math.random()*25), y:Math.floor(Math.random()*25)};
				} else if(this.checkHitSnakeBody(newPos) == true) {
					newPos = {x:Math.floor(Math.random()*25), y:Math.floor(Math.random()*25)};
				} else {
					this.food.x = newPos.x;
					this.food.y = newPos.y;
					break;
				}
			}
			return true;
		}
		return false;
	}
}

function editScript() {
	if($("button#scriptButton").text() == "编辑脚本") {
		var canvasLeft = ($(window).width() - 1000)/2;
		canvasLeft = canvasLeft < 0 ? 0 :canvasLeft;
		$("div#canvasBoard").animate({left:canvasLeft+'px'}, 400);
		$("div#scriptBoard").animate({left:500+canvasLeft+'px'}, 400);
		$("button#scriptButton").text("隐藏脚本");
	} else {
		var left = ($(window).width() - 500)/2;
		left = left < 0 ? 0 : left;
		$("div#canvasBoard").animate({left:left+'px'}, 400);
		$("div#scriptBoard").animate({left:left+'px'}, 400);
		$("button#scriptButton").text("编辑脚本");
	}
}

// 示例AI
function aiFunction(GAME, cmd) {
	var header = GAME.getSnakeHeader();
	var rps = GAME.getFoodRelativePos(header);

	var nextHeader = GAME.getNextHeader(' ');
	var nextRps = GAME.getFoodRelativePos(nextHeader);
	if(GAME.checkHitSnakeBody(nextHeader) || GAME.checkHitWall(nextHeader)) {
		nextHeader = GAME.getNextHeader('l');
		if(GAME.checkHitSnakeBody(nextHeader) || GAME.checkHitWall(nextHeader)) {
			cmd.push('r');
		} else {
			cmd.push('l');
		}
		return ;
	}
	if(Math.abs(rps.y) > Math.abs(nextRps.y) || Math.abs(rps.x) > Math.abs(nextRps.x)) {
		cmd.push(' ');
	} else {
		if(rps.x >= 0) {
			nextHeader = GAME.getNextHeader('l');
			if(GAME.checkHitSnakeBody(nextHeader))
				cmd.push(' ');
			else 
				cmd.push('l');
		} else {
			nextHeader = GAME.getNextHeader('r');
			if(GAME.checkHitSnakeBody(nextHeader))
				cmd.push(' ');
			else 
				cmd.push('r');
		}
	}
}


function main() {
	var snakeGame = new game();
	var intervalId = -1;
	var context = $('#main_canvas')[0].getContext('2d');
	context.fillStyle = '#ff0000';
	var command = '  '.split('');
	var currentFPS = FPS;
	var alive = true;

	function oneStep() {
		if(currentFPS != FPS) {
			currentFPS = FPS;
			clearInterval(intervalId);
			intervalId = setInterval(oneStep, 1000/currentFPS);
		}
		if(snakeGame.updateSnake())
			command=[];
		context.clearRect(0, 0, 500, 500);
		snakeGame.draw(context);
		var temp = snakeGame.getSnakeHeader();
		if(snakeGame.checkHitSnakeBody(temp) || snakeGame.checkHitWall(temp)) {
			alive = false;
			clearInterval(intervalId);
			$("p#info").text('Game Over');
			return ;
		}
		if(command.length <= 0) {
			if(typeof userAI != "function")
				aiFunction(snakeGame, command);
			else {
				try {
					userAI(snakeGame, command);
				} catch(err) {
					clearInterval(intervalId);
					var info = "你的代码有错误，请修正后重试！\n";
					info += "错误信息：" + err;
					alert(info);

				}
			}
		}
		snakeGame.changeDirection(command.length <= 0 ? ' ' : command.shift());
	}

	this.play = function() {
		if(snakeGame == null)
			snakeGame = new game();
		intervalId = setInterval(oneStep, 1000/currentFPS);
	}

	this.stop = function() {
		clearInterval(intervalId);
		snakeGame = null;
	}
}

var gameControl = null;

function appendScript() {
	var userScript = editor.getValue();
	var baseScript = "<script id='AIScript'>" + userScript + "</script>";
	if($('script#AIScript').length != 0) {
		userAI = null;
		$('script#AIScript').replaceWith(baseScript);
	} else {
		$('body').append(baseScript);
	}
	if(gameControl == null) {
		gameControl = new main();
	} else {
		gameControl.stop();
		gameControl = null;
		gameControl = new main();
	}
	gameControl.play();
}

$(window).ready(function () {
	var canvasLeft = ($(window).width() - 1000)/2;
	canvasLeft = canvasLeft < 0 ? 0 :canvasLeft;
	$("div#canvasBoard").animate({left:canvasLeft+'px'}, 400);
	$("div#scriptBoard").animate({left:500+canvasLeft+'px'}, 400);
	$("button#scriptButton").text("隐藏脚本");
});

var example = "// 通过修改下面函数来实现你的AI\n" +
"function userAI(GAME, cmd) {\n" + 
"	var header = GAME.getSnakeHeader();\n" + 
"	var rps = GAME.getFoodRelativePos(header);\n" + 

"	var nextHeader = GAME.getNextHeader(' ');\n" + 
"	var nextRps = GAME.getFoodRelativePos(nextHeader);\n" + 
"	if(GAME.checkHitSnakeBody(nextHeader) || GAME.checkHitWall(nextHeader)) {\n" + 
"		nextHeader = GAME.getNextHeader('l');\n" + 
"		if(GAME.checkHitSnakeBody(nextHeader) || GAME.checkHitWall(nextHeader)) {\n" + 
"			cmd.push('r');\n" + 
"		} else {\n" + 
"			cmd.push('l');\n" + 
"		}\n" + 
"		return ;\n" + 
"	}\n" + 
"	if(Math.abs(rps.y) > Math.abs(nextRps.y) || Math.abs(rps.x) > Math.abs(nextRps.x)) {\n" + 
"		cmd.push(' ');\n" + 
"	} else {\n" + 
"		if(rps.x >= 0) {\n" + 
"			nextHeader = GAME.getNextHeader('l');\n" + 
"			if(GAME.checkHitSnakeBody(nextHeader))\n" + 
"				cmd.push(' ');\n" + 
"			else \n" + 
"				cmd.push('l');\n" + 
"		} else {\n" + 
"			nextHeader = GAME.getNextHeader('r');\n" + 
"			if(GAME.checkHitSnakeBody(nextHeader))\n" + 
"				cmd.push(' ');\n" + 
"			else \n" + 
"				cmd.push('r');\n" + 
"		}\n" + 
"	}\n" + 
"}\n";