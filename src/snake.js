(function () {
	var Direction = {
	   up: 0,
	   down: 1,
	   left: 2,
	   right: 3
	};

	/**
	* Game object constructor
	*
	* @example
	*  var game = new Game(containerElement, opt_config);
	*
	* @param containerElement {Object} container object div for adding elements
	* @param opt_config {Object} game options for ovveride Game.config
	*/
	function Game(containerElement, opt_config) {
      if (Game.instance_) {
		   return Game.instance_;
		}
		Game.instance_ = this;

		if (opt_config)
		{
			if (!opt_config.SPEED) opt_config.SPEED = Game.config.SPEED;
			else if (opt_config.SPEED > 10 ) opt_config.SPEED = 10;
			else if (opt_config.SPEED < 1 ) opt_config.SPEED = 1;

			if (!opt_config.BOARD_WIDTH) opt_config.BOARD_WIDTH = Game.config.BOARD_WIDTH;
			else if (opt_config.BOARD_WIDTH > 40 ) opt_config.BOARD_WIDTH = 40;
			else if (opt_config.BOARD_WIDTH < 10 ) opt_config.BOARD_WIDTH = 10;

			if (!opt_config.BOARD_HEIGHT) opt_config.BOARD_HEIGHT = Game.config.BOARD_HEIGHT;
			else if (opt_config.BOARD_HEIGHT > 20 ) opt_config.BOARD_HEIGHT = 20;
			else if (opt_config.BOARD_HEIGHT < 5 ) opt_config.BOARD_HEIGHT = 5;
		}

		Game.instance_.config = opt_config || Game.config;
		Game.instance_.params = Game.params;

		Game.instance_.params.SPEED = Game.instance_.config.SPEED;
		Game.instance_.config.BOARD_HEIGHT += 2;
		Game.instance_.config.BOARD_WIDTH += 2;

		this.rootDiv = document.querySelector(containerElement);

		var page_width = window.innerWidth;
		var page_height = window.innerHeight;
		if ((page_width < Game.instance_.config.BOARD_WIDTH * Game.instance_.params.PIECE_WIDTH + 20) ||
			(page_height < Game.instance_.config.BOARD_HEIGHT * Game.instance_.params.PIECE_WIDTH + 20))
		{
			Game.params.PIECE_WIDTH = 16;
		}

		this.scoreDivEl = document.createElement('div');
		this.scoreDivEl.className = Game.classes.SCORE;
		this.scoreDivEl.style.width = Game.instance_.config.BOARD_WIDTH * Game.instance_.params.PIECE_WIDTH + 'px';

		this.highscoreDiv = document.createElement('div');
		this.highscoreDiv.style.float = 'left';

		this.highScoreTextEl = document.createElement('label');
		this.highScoreTextEl.innerHTML = 'Highscore: ';
		this.highscoreDiv.appendChild(this.highScoreTextEl);

		this.highScoreEl = document.createElement('label');
		this.highScoreEl.id = 'lblHighscore';
		this.highScoreEl.innerHTML = '0';
		this.highscoreDiv.appendChild(this.highScoreEl);

		this.scoreDivEl.appendChild(this.highscoreDiv);

		this.scoreDiv = document.createElement('div');
		this.scoreDiv.style.float = 'right';

		this.scoreTextEl = document.createElement('label');
		this.scoreTextEl.innerHTML = 'Score: ';
		this.scoreDiv.appendChild(this.scoreTextEl);

		this.scoreEl = document.createElement('label');
		this.scoreEl.id = 'lblScore';
		this.scoreEl.innerHTML = '0';
		this.scoreDiv.appendChild(this.scoreEl);

		this.scoreDivEl.appendChild(this.scoreDiv);

		this.rootDiv.appendChild(this.scoreDivEl);

		this.gameEl = document.createElement('div');
		this.gameEl.className = Game.classes.CONTAINER;
		this.rootDiv.appendChild(this.gameEl);

		this.rootDiv.style.width = (Game.instance_.config.BOARD_WIDTH * Game.instance_.params.PIECE_WIDTH) + 'px';

		Game.instance_.containerElement = this.gameEl;
		Game.instance_.containerElement.style.width = (Game.instance_.config.BOARD_WIDTH * Game.instance_.params.PIECE_WIDTH) + 'px';
		Game.instance_.containerElement.style.height = (Game.instance_.config.BOARD_HEIGHT * Game.instance_.params.PIECE_WIDTH) + 'px';

		this.scoreGameProgressEl = document.createElement('div');
		this.scoreGameProgressEl.className = Game.classes.PROGRESS;
		this.scoreGameProgressEl.style.width = Game.instance_.config.BOARD_WIDTH * Game.instance_.params.PIECE_WIDTH + 'px';

		this.progressEl = document.createElement('label');
		this.progressEl.id = 'lblStatus';
		this.progressEl.innerHTML = 'Press space to start game';
		this.scoreGameProgressEl.appendChild(this.progressEl);

		this.rootDiv.appendChild(this.scoreGameProgressEl);

		Game.instance_.init();
	}
	window['Game'] = Game;

	/**
	* Initial game params
	*/
	Game.params = {
		SPEED: 1,
		FPS: 35,
		CURRENT_FRAME: 0,
		STARTED: false,
		DIRECTION: Direction.right,
		PIECE_WIDTH: 32,
		CAN_MOVE: true,
		NEXT_MOVE: null,
		LEVELS: [30, 35, 25, 20, 15, 12, 10, 8, 6, 4],
		LEVEL_UP: [5, 10, 17, 25, 35, 50, 75, 110, 150]
	}

	/**
	* Initial game configuration, can be ovverriden by sending options param to game constructor
	*/
	Game.config = {
			SPEED: 1,
			BOARD_WIDTH: 20,
			BOARD_HEIGHT: 10
    };

	 /**
	 * Initial game css classes
	 */
	Game.classes = {
			CONTAINER: 'container',
			SCORE: 'score',
			PROGRESS: 'progress',
			PLAYER: 'sprite_background',
			BORDER: 'border_background',
			FOOD: 'food_background'
    };

	/**
	* Game prototype
	*/
	Game.prototype = {
		/**
	   * Function for player initialization
	   *
	   * @example
	   *  this.init();
	   */
		init: function () {
			document.addEventListener('keydown', function(e) {
				Game.instance_.keyPressAction(e);
			}.bind(Game.instance_));
			Game.instance_.board = new Board();
		},

		/**
		* Function for game animation
		*
		* @example
		*  this.gameProress();
		*/
		gameProgress: function() {
			if (Game.instance_.params.CURRENT_FRAME == Game.instance_.params.LEVELS[Game.instance_.params.SPEED - 1]) //Math.ceil(Game.instance_.params.FPS - Game.instance_.params.SPEED * 3)) //Math.ceil(Game.instance_.params.FPS / Game.instance_.params.SPEED))
			{
				Game.instance_.params.CAN_MOVE = true;

				var firstPosition = Game.instance_.player.position[0];
				var newPosition;

				switch (Game.instance_.params.DIRECTION)
				{
					case Direction.up:
						newPosition = { x: firstPosition.x, y: firstPosition.y - 1 };
						break;
					case Direction.down:
						newPosition = { x: firstPosition.x, y: firstPosition.y + 1 };
						break;
					case Direction.left:
						newPosition = { x: firstPosition.x - 1, y: firstPosition.y };
						break;
					default:
						newPosition = { x: firstPosition.x + 1, y: firstPosition.y };
				}

				Game.instance_.player.position.unshift(newPosition);
				if (newPosition.x == Game.instance_.food.position.x && newPosition.y == Game.instance_.food.position.y) Game.instance_.player.expandPlayer(newPosition);
				else {
					var lastItem = Game.instance_.player.position.pop();
					Game.instance_.player.movePlayerPiece(newPosition, lastItem);
				}
				Game.instance_.params.CURRENT_FRAME = 0;

				if (Game.instance_.params.NEXT_MOVE)
				{
					Game.instance_.params.DIRECTION = Game.instance_.params.NEXT_MOVE;
					Game.instance_.params.NEXT_MOVE = null;
				}
			}

			if (Game.instance_.params.STARTED)
			{
				Game.instance_.params.CURRENT_FRAME++;
				window.requestAnimationFrame(Game.instance_.gameProgress.bind(this));
			}
		},

		/**
		* Function for key events actions
		*
		* @example
		*  this.keyPressAction();
		*
		* @param e {Event} key press event
		*/
		keyPressAction: function(e) {
			switch(e.which) {
				case 32: // SPACE
					e.preventDefault();
					if (!Game.instance_.params.STARTED)
					{
						Game.instance_.params.STARTED = true;
						var pieceList = document.getElementsByClassName(Game.classes.PLAYER);
						if (pieceList.length > 0) while (pieceList[0]) { Game.instance_.containerElement.removeChild(pieceList[0]); }

						var foodItem = document.getElementById('food_item');
						if (foodItem) Game.instance_.containerElement.removeChild(foodItem);

						document.getElementById('lblScore').innerHTML = 0;
						Game.instance_.params.SPEED = Game.instance_.config.SPEED;
						Game.instance_.params.CAN_MOVE = true;
						Game.instance_.params.DIRECTION = Direction.right;
						Game.instance_.player = new Player();
						Game.instance_.food = new Food();
						document.getElementById('lblStatus').innerHTML = 'Game in progress, level: ' + Game.instance_.params.SPEED;
						Game.instance_.gameProgress();
					}
					break;
				case 37: // LEFT ARROW
				case 39: // RIGHT ARROW
					e.preventDefault();
					if (Game.instance_.params.STARTED && Game.instance_.params.DIRECTION != Direction.left && Game.instance_.params.DIRECTION != Direction.right)
					{
						if (Game.instance_.params.CAN_MOVE)
						{
							Game.instance_.params.NEXT_MOVE = null;
							Game.instance_.params.CAN_MOVE = false;
							Game.instance_.params.DIRECTION = e.which == 37 ? Direction.left : Direction.right;
						}
						else {
							Game.instance_.params.NEXT_MOVE = e.which == 37 ? Direction.left : Direction.right;
						}
						//Game.instance_.params.CURRENT_FRAME = Game.instance_.params.FPS / Game.instance_.params.SPEED;
					}
					break;
				case 38: // UP ARROW
				case 40: // DOWN ARROW
					e.preventDefault();
					if (Game.instance_.params.STARTED && Game.instance_.params.DIRECTION != Direction.down && Game.instance_.params.DIRECTION != Direction.up)
					{
						if (Game.instance_.params.CAN_MOVE)
						{
							Game.instance_.params.NEXT_MOVE = null;
							Game.instance_.params.CAN_MOVE = false;
							Game.instance_.params.DIRECTION = e.which == 38 ? Direction.up : Direction.down;
						}
						else {
							Game.instance_.params.NEXT_MOVE = e.which == 38 ? Direction.up : Direction.down;
						}
						//Game.instance_.params.CURRENT_FRAME = Game.instance_.params.FPS / Game.instance_.params.SPEED;
					}
					break;
				case 88: // X key
					if (Game.instance_.params.SPEED < 10 && Game.instance_.params.STARTED)
					{
						 Game.instance_.params.SPEED++;
						 Game.instance_.params.CURRENT_FRAME = 0;
						 document.getElementById('lblStatus').innerHTML = 'Game in progress, level: ' + Game.instance_.params.SPEED;
				 	}
					break;
				case 90: // Z key
					if (Game.instance_.params.SPEED > 1 && Game.instance_.params.STARTED)
					{
						Game.instance_.params.SPEED--;
						Game.instance_.params.CURRENT_FRAME = 0;
						document.getElementById('lblStatus').innerHTML = 'Game in progress, level: ' + Game.instance_.params.SPEED;
					}
					break;
			}
		},
	};

	/**
	* Player object constructor
	*
	* @example
	*  var player = new Player();
	*/
	function Player() {
		var centerY =  Math.ceil((Game.instance_.config.BOARD_HEIGHT - 2) / 2);
		this.position = [{x: 4, y: centerY}, {x: 3, y: centerY} , {x: 2, y: centerY}]; // [{x: 1, y: 1}, {x: 2, y: 1} , {x: 3, y: 1}];
		this.init();
	}

	/**
	* Player prototype
	*/
	Player.prototype = {
		/**
	   * Function for player initialization
	   *
	   * @example
	   *  this.init();
	   */
		init: function() {
			for(var i = 0; i < this.position.length; i++)
			{
				this.drawPlayer(this.position[i]);
			}
		},

		/**
		* Function for move player piece
		*
		* @example
		*  this.movePlayerPiece(nextPosition, lastPosition);
		*
		* @param nextPosition {Object} position for next player piece
		* @param lastPosition {Object} position for last player piece
		*/
		movePlayerPiece: function(nextPosition, lastPosition) {
			collisionDetected = this.checkForCollision(nextPosition);
			if (!collisionDetected)
			{
				var playerPiece = document.getElementById('player_' + lastPosition.x + '_' + lastPosition.y);
				playerPiece.id = 'player_' + nextPosition.x + '_' + nextPosition.y;
				playerPiece.style.top = nextPosition.y * Game.instance_.params.PIECE_WIDTH;
				playerPiece.style.left = nextPosition.x * Game.instance_.params.PIECE_WIDTH;
			}
		},

		/**
		* Function for expand player piece after food eating
		*
		* @example
		*  this.expandPlayer(nextPosition);
		*
		* @param nextPosition {Object} position for next player piece
		*/
		expandPlayer: function(nextPosition) {
			var lblScore = document.getElementById('lblScore');
			score = parseInt(lblScore.innerHTML) + 1;
			lblScore.innerHTML = parseInt(lblScore.innerHTML) + 1;

			if (score == Game.instance_.params.LEVEL_UP[Game.instance_.params.SPEED - 1] && Game.instance_.params.SPEED < 10)
			{
				Game.instance_.params.SPEED++;
				Game.instance_.params.CURRENT_FRAME = 0;
				document.getElementById('lblStatus').innerHTML = 'Game in progress, level: ' + Game.instance_.params.SPEED;
			}

			this.drawPlayer(nextPosition);
			Game.instance_.containerElement.removeChild(document.getElementById('food_item'));
			Game.instance_.food = new Food();
		},

		/**
		* Function for check if there is a obstacle on next position
		*
		* @example
		*  this.checkForCollision(nextPosition);
		*
		* @param nextPosition {Object} next player piece position
		*/
		checkForCollision: function(nextPosition) {
			var player_piece = document.getElementById('player_' + nextPosition.x + '_' + nextPosition.y);
			if ((Game.instance_.params.DIRECTION == Direction.up && nextPosition.y == 0) ||
				(Game.instance_.params.DIRECTION == Direction.down && nextPosition.y == Game.instance_.config.BOARD_HEIGHT - 1) ||
				(Game.instance_.params.DIRECTION == Direction.right && nextPosition.x == Game.instance_.config.BOARD_WIDTH - 1) ||
				(Game.instance_.params.DIRECTION == Direction.left && nextPosition.x == 0) || player_piece)
			{
				Game.instance_.params.STARTED = false;

				var playerHead = document.getElementById('player_' + Game.instance_.player.position[1].x + '_' + Game.instance_.player.position[1].y);
				playerHead.style.backgroundColor = '#aa0000';

				var score = document.getElementById('lblScore');
				var highScore = document.getElementById('lblHighscore');
				if (parseInt(score.innerHTML) > parseInt(highScore.innerHTML)) highScore.innerHTML = score.innerHTML;

				document.getElementById('lblStatus').innerHTML = 'Game over';
				return true;
			}

			return false;
		},

		/**
		* Function for drwaing player piece
		*
		* @example
		*  this.drawItem(position);
		*
		* @param position {Object} position of piece for adding
		*/
		drawPlayer: function(position) {
			this.containerEl = document.createElement('div');
			this.containerEl.id = 'player_' + position.x + '_' + position.y;
			this.containerEl.className = Game.classes.PLAYER;
			this.containerEl.style.width = Game.instance_.params.PIECE_WIDTH + 'px';
			this.containerEl.style.height = Game.instance_.params.PIECE_WIDTH + 'px';
			this.containerEl.style.top = position.y * Game.instance_.params.PIECE_WIDTH;
			this.containerEl.style.left = position.x * Game.instance_.params.PIECE_WIDTH;
			Game.instance_.containerElement.appendChild(this.containerEl);
		}
	};

	/**
	* Board object constructor
	*
	* @example
	*  var board = new Board();
	*/
	function Board()
	{
		//this.parent = parent;
		this.init();
	}

	/**
	* Board prototype
	*/
	Board.prototype = {
		/**
	   * Function for board initialization
	   *
	   * @example
	   *  this.init();
	   */
		init: function() {
			this.drawBorder(0, 0, Game.instance_.config.BOARD_WIDTH * Game.instance_.params.PIECE_WIDTH, Game.instance_.params.PIECE_WIDTH); // draw top border
			this.drawBorder((Game.instance_.config.BOARD_HEIGHT - 1) * Game.instance_.params.PIECE_WIDTH, 0, Game.instance_.config.BOARD_WIDTH * Game.instance_.params.PIECE_WIDTH, Game.instance_.params.PIECE_WIDTH); // draw bottom border
			this.drawBorder(0, 0, Game.instance_.params.PIECE_WIDTH, Game.instance_.config.BOARD_HEIGHT * Game.instance_.params.PIECE_WIDTH); // draw left border
			this.drawBorder(0, (Game.instance_.config.BOARD_WIDTH - 1) * Game.instance_.params.PIECE_WIDTH, Game.instance_.params.PIECE_WIDTH, Game.instance_.config.BOARD_HEIGHT * Game.instance_.params.PIECE_WIDTH); // draw right border
		},

		/**
	   * Function for render board border
	   *
	   * @example
	   *  this.drawBorder(0, 0, 100, 100);
	   *
	   * @param top {Number} border top position in pixels
		* @param left {Number} border left position in pixels
		* @param width {Number} border width position in pixels
		* @param height {Number} border height position in pixels
	   */
		drawBorder: function(top, left, width, height) {
			this.containerEl = document.createElement('div');
			this.containerEl.className = Game.classes.BORDER;
			this.containerEl.style.top = top + 'px';
			this.containerEl.style.left = left + 'px';
			this.containerEl.style.width = width + 'px';
			this.containerEl.style.height = height + 'px';
			Game.instance_.containerElement.appendChild(this.containerEl);
		}
	}

	/**
	* Food object constructor
	*
	* @example
	*  var food = new Food();
	*/
	function Food()
	{
		this.init();
	}

	/**
	* Food prototype
	*/
	Food.prototype = {
		/**
		* Function for food initialization
		*
		* @example
		*  this.init();
		*/
		init: function() {
			var emptyFieldsArray = [];
			for (var i = 0; i < Game.instance_.config.BOARD_HEIGHT - 2; i++)
				for (var j = 0; j < Game.instance_.config.BOARD_WIDTH - 2; j++)
					if (!document.getElementById('player_' + (j + 1) + '_' + (i + 1))) emptyFieldsArray.push({ x: j + 1, y: i + 1 });

			var randomField = Math.floor((Math.random() * (emptyFieldsArray.length - 1)));
			var randomPos = {x: 1, y: 1};
			if (emptyFieldsArray.length > 0) randomPos = emptyFieldsArray[randomField];

			this.position = { x: randomPos.x, y: randomPos.y };
			this.containerEl = document.createElement('div');
			this.containerEl.id = 'food_item';
			this.containerEl.className = Game.classes.FOOD;
			this.containerEl.style.top = (randomPos.y * Game.instance_.params.PIECE_WIDTH) + 'px';
			this.containerEl.style.left = (randomPos.x * Game.instance_.params.PIECE_WIDTH) + 'px';
			// this.containerEl.style.top = (randomY * Game.instance_.params.PIECE_WIDTH) + 'px';
			// this.containerEl.style.left = (randomX * Game.instance_.params.PIECE_WIDTH) + 'px';
			this.containerEl.style.width = Game.instance_.params.PIECE_WIDTH + 'px';
			this.containerEl.style.height = Game.instance_.params.PIECE_WIDTH + 'px';
			Game.instance_.containerElement.appendChild(this.containerEl);
		}
	}
})();
