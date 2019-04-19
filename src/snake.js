(function () {
	var Dir = { // direction enum
	   up: 0,
	   down: 1,
	   left: 2,
	   right: 3
	};

	/**
	* Game object constructor
	*
	* @example
	*  var game = new Game(containerElement, cfg);
	*
	* @param containerElement {Object} container object div for adding elements
	* @param cfg {Object} game options for ovveride Game.config
	*/
	function Game(containerElement, cfg) {
      if (Game.i_) { // Game instance
		   return Game.i_;
		}
		Game.i_ = this;

		if (cfg)
		{
			if (!cfg.SPEED) cfg.SPEED = Game.config.SPEED;
			else if (cfg.SPEED > 10 ) cfg.SPEED = 10;
			else if (cfg.SPEED < 1 ) cfg.SPEED = 1;

			if (!cfg.BOARD_WIDTH) cfg.BOARD_WIDTH = Game.config.BOARD_WIDTH;
			else if (cfg.BOARD_WIDTH > 40 ) cfg.BOARD_WIDTH = 40;
			else if (cfg.BOARD_WIDTH < 10 ) cfg.BOARD_WIDTH = 10;

			if (!cfg.BOARD_HEIGHT) cfg.BOARD_HEIGHT = Game.config.BOARD_HEIGHT;
			else if (cfg.BOARD_HEIGHT > 20 ) cfg.BOARD_HEIGHT = 20;
			else if (cfg.BOARD_HEIGHT < 5 ) cfg.BOARD_HEIGHT = 5;
		}

		Game.i_.config = cfg || Game.config;
		Game.i_.params = Game.params;

		Game.i_.params.SPEED = Game.i_.config.SPEED;
		Game.i_.config.BOARD_HEIGHT += 2;
		Game.i_.config.BOARD_WIDTH += 2;

		var rootDiv = document.querySelector(containerElement);

		var p_w = window.innerWidth;
		var p_h = window.innerHeight;
		if ((p_w < Game.i_.config.BOARD_WIDTH * Game.i_.params.PIECE_WIDTH + 20) ||
			(p_h < Game.i_.config.BOARD_HEIGHT * Game.i_.params.PIECE_WIDTH + 20))
		{
			Game.params.PIECE_WIDTH = 16;
		}

		var sdEl = document.createElement('div');
		sdEl.className = Game.classes.SCORE;
		sdEl.style.width = Game.i_.config.BOARD_WIDTH * Game.i_.params.PIECE_WIDTH + 'px';

		var hsEl = document.createElement('div');
		hsEl.style.float = 'left';

		var hsT = document.createElement('label');
		hsT.innerHTML = 'Highscore: ';
		hsEl.appendChild(hsT);

		var hsL = document.createElement('label');
		hsL.id = 'lblHighscore';
		hsL.innerHTML = '0';
		hsEl.appendChild(hsL);

		sdEl.appendChild(hsEl);

		var sEl = document.createElement('div');
		sEl.style.float = 'right';

		var sT = document.createElement('label');
		sT.innerHTML = 'Score: ';
		sEl.appendChild(sT);

		var sL = document.createElement('label');
		sL.id = 'lblScore';
		sL.innerHTML = '0';
		sEl.appendChild(sL);

		sdEl.appendChild(sEl);

		rootDiv.appendChild(sdEl);

		var gameEl = document.createElement('div');
		gameEl.className = Game.classes.CONTAINER;
		rootDiv.appendChild(gameEl);

		rootDiv.style.width = (Game.i_.config.BOARD_WIDTH * Game.i_.params.PIECE_WIDTH) + 'px';

		Game.i_.containerElement = gameEl;
		Game.i_.containerElement.style.width = (Game.i_.config.BOARD_WIDTH * Game.i_.params.PIECE_WIDTH) + 'px';
		Game.i_.containerElement.style.height = (Game.i_.config.BOARD_HEIGHT * Game.i_.params.PIECE_WIDTH) + 'px';

		var spEl = document.createElement('div');
		spEl.className = Game.classes.PROGRESS;
		spEl.style.width = Game.i_.config.BOARD_WIDTH * Game.i_.params.PIECE_WIDTH + 'px';

		var pEl = document.createElement('label');
		pEl.id = 'lblStatus';
		pEl.innerHTML = 'Press space to start game';
		spEl.appendChild(pEl);

		rootDiv.appendChild(spEl);

		Game.i_.init();
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
		DIRECTION: Dir.right,
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
				Game.i_.keyPressAction(e);
			}.bind(Game.i_));
			Game.i_.board = new Board();
		},

		/**
		* Function for game animation
		*
		* @example
		*  this.gameProress();
		*/
		gameProgress: function() {
			if (Game.i_.params.CURRENT_FRAME == Game.i_.params.LEVELS[Game.i_.params.SPEED - 1])
			{
				Game.i_.params.CAN_MOVE = true;

				var fp = Game.i_.player.pos[0]; // first position
				var np; // new position

				switch (Game.i_.params.DIRECTION)
				{
					case Dir.up:
						np = { x: fp.x, y: fp.y - 1 };
						break;
					case Dir.down:
						np = { x: fp.x, y: fp.y + 1 };
						break;
					case Dir.left:
						np = { x: fp.x - 1, y: fp.y };
						break;
					default:
						np = { x: fp.x + 1, y: fp.y };
				}

				Game.i_.player.pos.unshift(np);
				if (np.x == Game.i_.food.pos.x && np.y == Game.i_.food.pos.y) Game.i_.player.expandPlayer(np);
				else {
					var lp = Game.i_.player.pos.pop(); // last position item
					Game.i_.player.movePlayerPiece(np, lp);
				}
				Game.i_.params.CURRENT_FRAME = 0;

				if (Game.i_.params.NEXT_MOVE)
				{
					Game.i_.params.DIRECTION = Game.i_.params.NEXT_MOVE;
					Game.i_.params.NEXT_MOVE = null;
				}
			}

			if (Game.i_.params.STARTED)
			{
				Game.i_.params.CURRENT_FRAME++;
				window.requestAnimationFrame(Game.i_.gameProgress.bind(this));
			}
		},

		/**
		* Function for key events actions
		*
		* @example
		*  this.keyPressAction(e);
		*
		* @param e {Event} key press event
		*/
		keyPressAction: function(e) {
			switch(e.which) {
				case 32: // SPACE
					e.preventDefault();
					if (!Game.i_.params.STARTED)
					{
						Game.i_.params.STARTED = true;
						var l = document.getElementsByClassName(Game.classes.PLAYER); // piece list
						if (l.length > 0) while (l[0]) { Game.i_.containerElement.removeChild(l[0]); }

						var fi = document.getElementById('food_item'); // food item
						if (fi) Game.i_.containerElement.removeChild(fi);

						document.getElementById('lblScore').innerHTML = 0;
						Game.i_.params.SPEED = Game.i_.config.SPEED;
						Game.i_.params.CAN_MOVE = true;
						Game.i_.params.DIRECTION = Dir.right;
						Game.i_.player = new Player();
						Game.i_.food = new Food();
						document.getElementById('lblStatus').innerHTML = 'Game in progress, level: ' + Game.i_.params.SPEED;
						Game.i_.gameProgress();
					}
					break;
				case 37: // LEFT ARROW
				case 39: // RIGHT ARROW
					e.preventDefault();
					if (Game.i_.params.STARTED && Game.i_.params.DIRECTION != Dir.left && Game.i_.params.DIRECTION != Dir.right)
					{
						if (Game.i_.params.CAN_MOVE)
						{
							Game.i_.params.NEXT_MOVE = null;
							Game.i_.params.CAN_MOVE = false;
							Game.i_.params.DIRECTION = e.which == 37 ? Dir.left : Dir.right;
						}
						else  Game.i_.params.NEXT_MOVE = e.which == 37 ? Dir.left : Dir.right;
					}
					break;
				case 38: // UP ARROW
				case 40: // DOWN ARROW
					e.preventDefault();
					if (Game.i_.params.STARTED && Game.i_.params.DIRECTION != Dir.down && Game.i_.params.DIRECTION != Dir.up)
					{
						if (Game.i_.params.CAN_MOVE)
						{
							Game.i_.params.NEXT_MOVE = null;
							Game.i_.params.CAN_MOVE = false;
							Game.i_.params.DIRECTION = e.which == 38 ? Dir.up : Dir.down;
						}
						else Game.i_.params.NEXT_MOVE = e.which == 38 ? Dir.up : Dir.down;
					}
					break;
				case 88: // X key
					if (Game.i_.params.SPEED < 10 && Game.i_.params.STARTED)
					{
						 Game.i_.params.SPEED++;
						 Game.i_.params.CURRENT_FRAME = 0;
						 document.getElementById('lblStatus').innerHTML = 'Game in progress, level: ' + Game.i_.params.SPEED;
				 	}
					break;
				case 90: // Z key
					if (Game.i_.params.SPEED > 1 && Game.i_.params.STARTED)
					{
						Game.i_.params.SPEED--;
						Game.i_.params.CURRENT_FRAME = 0;
						document.getElementById('lblStatus').innerHTML = 'Game in progress, level: ' + Game.i_.params.SPEED;
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
		var cY =  Math.ceil((Game.i_.config.BOARD_HEIGHT - 2) / 2); // center y of game board
		this.pos = [{x: 4, y: cY}, {x: 3, y: cY} , {x: 2, y: cY}];
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
			for(var i = 0; i < this.pos.length; i++) this.drawPlayer(this.pos[i]);
		},

		/**
		* Function for move player piece
		*
		* @example
		*  this.movePlayerPiece({x: 3, y: 1}, {x: 1, y: 1});
		*
		* @param n {Object} position for next player piece
		* @param l {Object} position for last player piece
		*/
		movePlayerPiece: function(n, l) {
			coll = this.checkForCollision(n); // check for collision
			if (!coll)
			{
				var pl = document.getElementById('p_' + l.x + '_' + l.y); // player piece
				pl.id = 'p_' + n.x + '_' + n.y;
				pl.style.top = n.y * Game.i_.params.PIECE_WIDTH;
				pl.style.left = n.x * Game.i_.params.PIECE_WIDTH;
			}
		},

		/**
		* Function for expand player piece after food eating
		*
		* @example
		*  this.expandPlayer({x: 1, y: y});
		*
		* @param p {Object} position for next player piece
		*/
		expandPlayer: function(p) {
			var el = document.getElementById('lblScore');
			var score = parseInt(el.innerHTML) + 1;
			el.innerHTML = parseInt(el.innerHTML) + 1;

			if (score == Game.i_.params.LEVEL_UP[Game.i_.params.SPEED - 1] && Game.i_.params.SPEED < 10)
			{
				Game.i_.params.SPEED++;
				Game.i_.params.CURRENT_FRAME = 0;
				document.getElementById('lblStatus').innerHTML = 'Game in progress, level: ' + Game.i_.params.SPEED;
			}

			this.drawPlayer(p);
			Game.i_.containerElement.removeChild(document.getElementById('food_item'));
			Game.i_.food = new Food();
		},

		/**
		* Function for check if there is a obstacle on next position
		*
		* @example
		*  this.checkForCollision({x: 1, y: 1});
		*
		* @param p {Object} next player piece position
		*/
		checkForCollision: function(p) {
			var pp = document.getElementById('p_' + p.x + '_' + p.y); // player piece item
			if ((Game.i_.params.DIRECTION == Dir.up && p.y == 0) ||
				(Game.i_.params.DIRECTION == Dir.down && p.y == Game.i_.config.BOARD_HEIGHT - 1) ||
				(Game.i_.params.DIRECTION == Dir.right && p.x == Game.i_.config.BOARD_WIDTH - 1) ||
				(Game.i_.params.DIRECTION == Dir.left && p.x == 0) || pp)
			{
				Game.i_.params.STARTED = false;

				var ph = document.getElementById('p_' + Game.i_.player.pos[1].x + '_' + Game.i_.player.pos[1].y); // player head
				ph.style.backgroundColor = '#aa0000';

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
		*  this.drawItem({x: 1, y: 1});
		*
		* @param p {Object} position of piece for adding
		*/
		drawPlayer: function(p) {
			var el = document.createElement('div');
			el.id = 'p_' + p.x + '_' + p.y;
			el.className = Game.classes.PLAYER;
			el.style.width = Game.i_.params.PIECE_WIDTH + 'px';
			el.style.height = Game.i_.params.PIECE_WIDTH + 'px';
			el.style.top = p.y * Game.i_.params.PIECE_WIDTH;
			el.style.left = p.x * Game.i_.params.PIECE_WIDTH;
			Game.i_.containerElement.appendChild(el);
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
			this.drawBorder(0, 0, Game.i_.config.BOARD_WIDTH * Game.i_.params.PIECE_WIDTH, Game.i_.params.PIECE_WIDTH); // draw top border
			this.drawBorder((Game.i_.config.BOARD_HEIGHT - 1) * Game.i_.params.PIECE_WIDTH, 0, Game.i_.config.BOARD_WIDTH * Game.i_.params.PIECE_WIDTH, Game.i_.params.PIECE_WIDTH); // draw bottom border
			this.drawBorder(0, 0, Game.i_.params.PIECE_WIDTH, Game.i_.config.BOARD_HEIGHT * Game.i_.params.PIECE_WIDTH); // draw left border
			this.drawBorder(0, (Game.i_.config.BOARD_WIDTH - 1) * Game.i_.params.PIECE_WIDTH, Game.i_.params.PIECE_WIDTH, Game.i_.config.BOARD_HEIGHT * Game.i_.params.PIECE_WIDTH); // draw right border
		},

		/**
	   * Function for render board border
	   *
	   * @example
	   *  this.drawBorder(0, 0, 100, 100);
	   *
	   * @param t {Number} border top position in pixels
		* @param l {Number} border left position in pixels
		* @param w {Number} border width position in pixels
		* @param h {Number} border height position in pixels
	   */
		drawBorder: function(t, l, w, h) {
			var el = document.createElement('div');
			el.className = Game.classes.BORDER;
			el.style.top = t + 'px';
			el.style.left = l + 'px';
			el.style.width = w + 'px';
			el.style.height = h + 'px';
			Game.i_.containerElement.appendChild(el);
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
			var arr = [];
			for (var i = 0; i < Game.i_.config.BOARD_HEIGHT - 2; i++)
				for (var j = 0; j < Game.i_.config.BOARD_WIDTH - 2; j++)
					if (!document.getElementById('p_' + (j + 1) + '_' + (i + 1))) arr.push({ x: j + 1, y: i + 1 });

			var rf = Math.floor((Math.random() * (arr.length - 1)));
			var rnd = {x: 1, y: 1};
			if (arr.length > 0) rnd = arr[rf];

			this.pos = { x: rnd.x, y: rnd.y };
			var el = document.createElement('div');
			el.id = 'food_item';
			el.className = Game.classes.FOOD;
			el.style.top = (rnd.y * Game.i_.params.PIECE_WIDTH) + 'px';
			el.style.left = (rnd.x * Game.i_.params.PIECE_WIDTH) + 'px';
			el.style.width = Game.i_.params.PIECE_WIDTH + 'px';
			el.style.height = Game.i_.params.PIECE_WIDTH + 'px';
			Game.i_.containerElement.appendChild(el);
		}
	}
})();
