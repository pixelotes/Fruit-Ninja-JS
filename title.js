var Phaser;
var game;
var ancho = 800;
var alto = 480;
var color;
var sprite;

// Define our main state
var title = {
    preload: function () {
        "use strict";
        game.load.image('titlescreen', 'assets/title.png');
        game.load.image('bg', 'assets/bg.jpg');
    },

    create: function () {
        "use strict";

        var background = game.add.tileSprite(0, 0, ancho, alto, "bg");
		this.title = game.add.sprite(0,0,"titlescreen");
		
		this.touchArea = this.game.add.sprite(0, 0);
		this.touchArea.width = this.game.width;
		this.touchArea.height = this.game.height;
		this.touchArea.inputEnabled  = true;
		this.touchArea.events.onInputDown.add(this.startGame, this);
    },

    update: function () {
        "use strict";
    },

    goFullScreen: function () {
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.setScreenSize(true);
    },
    
    startGame: function () {
		game.state.start('main');
    }
	
};

                var game = new Phaser.Game(ancho, alto, Phaser.AUTO, 'game');
                game.state.add('main', main);
				game.state.add('title', title);
				game.state.start('title');