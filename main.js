var Phaser;
var game;
var fruitTime = 2;
var fallos = 0;
var max = 100;
var min = -100;
var isMousePressed = false;
var puntuacion = 0;
var dificultad = 1;
var bmd;
var bmdCounter = 30;
var ancho = 800;
var alto = 480;
var color;
var sprite;
var oldLineX, oldLineY, newLineX, newLineY;
var bdrawLine = true;
//var frutas = Array('orange', 'apple', 'mellon', 'pineapple', 'bomb', 'grapes', 'peach', 'banana', 'fruitspree');
var frutas = Array('orange', 'apple', 'mellon', 'pineapple', 'bomb', 'grapes', 'peach', 'banana');

// Define our main state
var main = {
    preload: function () {
        "use strict";
        game.load.image('titlescreen', 'assets/title.png');
        game.load.image('orange', 'assets/orange.png');
        game.load.image('orangetop', 'assets/orangetop.png');
        game.load.image('orangebottom', 'assets/orangebottom.png');
        game.load.image('apple', 'assets/apple.png');
        game.load.image('appletop', 'assets/appletop.png');
        game.load.image('applebottom', 'assets/applebottom.png');
        game.load.image('mellon', 'assets/mellon.png');
        game.load.image('mellontop', 'assets/mellontop.png');
        game.load.image('mellonbottom', 'assets/mellonbottom.png');
        game.load.image('pineapple', 'assets/pineapple.png');
        game.load.image('pineappletop', 'assets/pineappletop.png');
        game.load.image('pineapplebottom', 'assets/pineapplebottom.png');
        game.load.image('grapes', 'assets/grapes.png');
        game.load.image('grapestop', 'assets/grapestop.png');
        game.load.image('grapesbottom', 'assets/grapesbottom.png');
        game.load.image('peach', 'assets/peach.png');
        game.load.image('peachtop', 'assets/peachtop.png');
        game.load.image('peachbottom', 'assets/peachbottom.png');
        game.load.image('banana', 'assets/banana.png');
        game.load.image('bananatop', 'assets/bananatop.png');
        game.load.image('bananabottom', 'assets/bananabottom.png');
        game.load.image('bomb', 'assets/bomb.png');
        game.load.image('bg', 'assets/bg.jpg');
        game.load.image('particula', 'assets/particula.png');
        game.load.image('linea', 'assets/line.png');
        //fuente
        this.load.bitmapFont('ninjafont', 'assets/font/font.png', 'assets/font/font.fnt');
        //audio
        this.load.audio('sfxcut', 'assets/snd/cut.mp3');
        this.load.audio('sfxbomb', 'assets/snd/bomb.mp3');
        //manchas
        game.load.image('stain0', 'assets/stain/ink-stain-texture-0.png');
        game.load.image('stain1', 'assets/stain/ink-stain-texture-1.png');
        game.load.image('stain2', 'assets/stain/ink-stain-texture-2.png');
        game.load.image('stain3', 'assets/stain/ink-stain-texture-3.png');
        game.load.image('stain4', 'assets/stain/ink-stain-texture-4.png');
        game.load.image('stain5', 'assets/stain/ink-stain-texture-5.png');
        game.load.image('stain6', 'assets/stain/ink-stain-texture-6.png');
        //marcador de fallos
        game.load.image('0fail', 'assets/fail/0fail.png');
        game.load.image('1fail', 'assets/fail/1fail.png');
        game.load.image('2fail', 'assets/fail/2fail.png');
        game.load.image('3fail', 'assets/fail/3fail.png');
        game.load.image('4fail', 'assets/fail/4fail.png');
        game.load.image('5fail', 'assets/fail/5fail.png');
    },

    create: function () {
        "use strict";

        var background = game.add.tileSprite(0, 0, ancho, alto, "bg");

        //Inicializa motor físicas
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.physics.arcade.gravity.y = 900;

        //Inicializa teclas
        this.cursor = game.input.keyboard.createCursorKeys();

        //grupo manchas (se renderiza antes de las frutas, el marcador o la estela)
        this.manchas = game.add.group();

        //crea frutas
        this.fruitGen = this.game.time.events.loop(Phaser.Timer.SECOND * fruitTime, this.fruitGenerator, this);
        this.fruitGen.timer.start();
        game.input.onDown.add(this.isPressed, this);
        game.input.onUp.add(this.isNotPressed, this);

        //crea el marcador
        this.marcador = this.game.add.bitmapText(this.game.width / 2, 10, 'ninjafont', puntuacion.toString(), 64);
        this.marcador.visible = true;
        this.basuraGrp = game.add.group();
        this.frutasGrp = game.add.group();
        this.fallos = this.game.add.sprite(game.width, 10, '0fail');
        this.fallos.x = game.width - this.fallos.width / 2;
        this.fallos.anchor.setTo(0.5, 0);

        //efectos de sonido
        this.sfxcut = game.add.audio('sfxcut');
        this.sfxbomb = game.add.audio('sfxbomb');

        //pantalla completa
        //this.goFullScreen();

        //linea recolectora de basura
        this.linea = game.add.sprite(game.width / 2, game.height + 50, 'linea');
        this.linea.anchor.setTo(0.5, 0.5);
        game.physics.arcade.enable(this.linea);
        this.linea.body.allowGravity = false;
        this.linea.body.immovable = true;

        //inicia la estela
        bmd = game.add.bitmapData(ancho, alto);
        color = '#b30303';
        bmd.ctx.beginPath();
        bmd.ctx.lineWidth = "4";
        bmd.ctx.strokeStyle = color;
        bmd.alpha = 0.1;
        bmd.ctx.stroke();
        sprite = game.add.sprite(0, 0, bmd);
        newLineX = game.input.x;
        newLineY = game.input.y;
        oldLineX = game.input.x;
        oldLineY = game.input.y;

        //hace que las manchas generadas al cortar la fruta se desvanezcan
        this.mrProper = this.game.time.events.loop(Phaser.Timer.SECOND * 2, this.donLimpio, this);

    },

    update: function () {
        "use strict";

        this.drawLine();

        //if (!isMousePressed && drawLine) {
        if (!isMousePressed && bdrawLine) {
            bdrawLine = !bdrawLine;
            bmd.clear();
        } else {
            bdrawLine = !bdrawLine;
        }

        //las frutas se destruyen al salir de pantalla, afectando a la puntuacion
        this.game.physics.arcade.collide(this.frutasGrp, this.linea, function (spr, mmb) {
            fallos++;
            this.actualizaFallos();
            mmb.kill();
        }, null, this);

        //las bombas o pedazos se destruyen al salir de pantalla, pero no afectan a la puntuacion
        this.game.physics.arcade.collide(this.frutasGrp, this.linea, function (spr, mmb) {
            mmb.kill();
        }, null, this);

    },

    goFullScreen: function () {
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.setScreenSize(true);
    },

    drawLine: function () {
        oldLineX = newLineX;
        oldLineY = newLineY;
        newLineX = game.input.x;
        newLineY = game.input.y;
        if (isMousePressed) {

            if (oldLineX != newLineX || oldLineY != newLineY) {
                bmd.clear();
                bmd.ctx.beginPath();
                bmd.ctx.moveTo(oldLineX, oldLineY);
                bmd.ctx.lineTo(newLineX, newLineY);
                bmd.ctx.lineWidth = 3;
                bmd.ctx.stroke();
                bmd.ctx.closePath();
                bmd.render();
                bmd.refreshBuffer();
            }
        }
    },

    isPressed: function () {
        isMousePressed = true;
    },

    isNotPressed: function () {
        isMousePressed = false;
    },

    fruitGenerator: function () {
        "use strict";
        // Crea un número aleatorio de frutas  
        var numFrutas = Math.floor(Math.random() * 5);
        if (numFrutas == 0) {
            numFrutas = 1;
        }

        //angulo de lanzamiento de las frutas


        var posInicX = ancho / 2;
        var posInicY = game.height;
        var velInicY = 0;
        var rotInic = 0;



        while (numFrutas) {
            var selecPos = Math.floor(Math.random() * 4);
            if (selecPos == 1) { //izquierda
                posInicX = 0;
                posInicY = game.height;
                velInicY = 250;
                rotInic = 15;
            } else if (selecPos == 2) { //cebtri
                posInicX = ancho / 2;
                posInicY = game.height;
                velInicY = 0;
                rotInic = 0;
            } else if (selecPos == 3) { //derecha
                posInicX = ancho;
                posInicY = game.height;
                velInicY = -250;
                rotInic = -15;
            }

            var fruta = frutas[Math.floor(Math.random() * frutas.length)];
            this.frutaObj = this.game.add.sprite(posInicX, posInicY, fruta);
            this.frutaObj.tipo = fruta;
            this.frutaObj.anchor.setTo(0.5, 0.5);
            game.physics.arcade.enable(this.frutaObj);
            this.frutaObj.rotation = Math.floor(Math.random() * (30) - rotInic);
            this.frutaObj.body.velocity.y = -((Math.random() * 250) + 600);
            this.frutaObj.body.velocity.x = Math.floor(Math.random() * (max - min + 1)) + min + velInicY;
            this.frutaObj.inputEnabled = true;
            //this.frutaObj.checkWorldBounds = true;
            //this.frutaObj.outOfBoundsKill = true;
            if (this.frutaObj.tipo == 'bomb') {
                this.basuraGrp.add(this.frutaObj);
            } else {
                this.frutasGrp.add(this.frutaObj);
            }

            /*if(this.frutaObj.tipo == 'bomb') {
                                    //crea particulas
                    var emitter = game.add.emitter(0, 0, 100);
                    emitter.makeParticles('particula');
                    //emitter.lifespan = 1000;
                      emitter.maxParticleSpeed = new Phaser.Point(-100,50);
                      emitter.minParticleSpeed = new Phaser.Point(-200,-50);
                    //emitter.y = 0;
                    //emitter.x = this.frutaObj.width/2;
                    this.frutaObj.addChild(emitter);
                emitter.start();
                emitter.x = 0;
                emitter.y = 0;
                emitter.emitX = 500;
                emitter.emitY = 500;
            }*/
            //this.frutaObj.events.onInputDown.add(this.hit(this.frutaObj.tipo, this.frutaObj.x, this.frutaObj.y), this);

            this.frutaObj.hit = function (origen) {

                if (origen.tipo == 'bomb') {
                    //si le damos a una bomba
                    if (isMousePressed) {
                        this.sfxbomb.play();
                        fallos++;
                        this.actualizaFallos();
                        //TODO: animación de explosión
                        origen.kill();
                    }
                } else if (origen.tipo == 'fruitspree') {
                    //si se inicia el evento 'fruit spree' :-)
                } else {
                    //si es una fruta normal
                    if (isMousePressed) {

                        //reproduce efecto de sonido
                        this.sfxcut.play();

                        //aumenta la puntuación en 1 y actualiza el marcador
                        puntuacion++;
                        if(puntuacion==10) {
							this.guardarLogros(1, "Aprendiz Ninja", 1);
                        } else if (puntuacion==20) {
							this.guardarLogros(2, "Adepto Ninja", 2);
                        } else if (puntuacion==30) {
							this.guardarLogros(3, "Maestro Ninja", 3);
                        }
                        this.marcador.setText(puntuacion.toString());

                        //crea una mancha al azar
                        var tipomancha = Math.floor(Math.random() * 6); //escoge una de las manchas al azar
                        this.mancha = this.game.add.sprite(origen.x, origen.y, 'stain' + tipomancha); //crea la mancha en la posicion de la fruta cortada
                        this.mancha.anchor.setTo(0.5, 0.5);
                        this.mancha.tint = Phaser.Color.getRandomColor(); //tinta la mancha de un color al azar
                        this.manchas.add(this.mancha); //añade mancha al grupo (por prioridad de renderizado);                  
                        this.mancha.alpha = 0.8; //mancha semitransparente
                        this.mancha.rotation = Math.floor(Math.random() * 359); //rota la mancha al azar

                        //crea los pedazos de la fruta
                        this.frutaS = this.game.add.sprite(origen.x, origen.y, origen.tipo + 'top');
                        this.frutaI = this.game.add.sprite(origen.x, origen.y, origen.tipo + 'bottom');
                        game.physics.arcade.enable(this.frutaS);
                        game.physics.arcade.enable(this.frutaI);
                        this.basuraGrp.add(this.frutaS);
                        this.basuraGrp.add(this.frutaI);
                        origen.kill(); //destruye la fruta golpeada

                        //trayectoria e inclinación de los pedazos
                        this.frutaS.anchor.setTo(0.5, 0.5);
                        this.frutaI.anchor.setTo(0.5, 0.5);
                        this.frutaS.body.velocity.x = -30;
                        this.frutaI.body.velocity.x = 30;
                        this.frutaS.body.velocity.y = -200;
                        this.frutaI.body.velocity.y = -10;
                        //this.frutaS.outOfBoundsKill = true;
                        //this.frutaI.outOfBoundsKill = true;
                        this.frutaI.rotation = Math.floor(Math.random() * (30) - 15);
                        this.frutaS.rotation = Math.floor(Math.random() * (30) - 15);
                    }
                }
            }
            this.frutaObj.events.onInputOver.add(this.frutaObj.hit, this);
            numFrutas--;
        }
    },

    marcadorOnline: function (puntuacion, dificultad, juego, fecha, invitado) {
        //guarda la puntuacion si NO es invitado, en caso contrario sólo lee los datos
        //devuelve un listado de los cinco primeros O devuelve un mensaje de error
        var resul = "ERROR";
        if (!invitado) {
            //guarda en BBDD
        }

        //consulta a la BBDD mediante AJAX
        if (resul.length == 5 || (resul.length < 5 && resul.length > 0)) {
            //CONVIERTE RESULTADOS EN UN STRING SEPARADO POR PUNTO Y COMA
        } else {
            //NO HAY RESULTADOS PARA HOY
        }
        return resul;
    },


    guardaPuntuacion: function () {

        $.ajax({
            data: {
                "userid": parent.document.getElementById('userid').value,
                "idjuego": location.search.split('id=')[1],
                "idjuego": 7,
                "puntuacion": puntuacion,
                "dificultad": dificultad,
                "guardar": "ok"
            },
            url: '//localhost/prj/puntuaciones.php',
            type: 'post',
            beforeSend: function () {
                //alert("antes");
            },
            success: function (response) {
                parent.refreshRanking();
            }
        });

    },
    //asigna a todas las manchas un tween con fadeout
    donLimpio: function () {
        var len = this.manchas.children.length
        for (var i = 0; i < len; i++) {
            var tween = game.add.tween(this.manchas.children[i]);
            tween.to({
                alpha: 0
            }, 5000, Phaser.Easing.Linear.None);
            tween.onComplete.add(function () {
                //this.manchas.children[i] = null;
                //obj.kill();
            });
            tween.start();
        }
    },

    actualizaFallos: function () {
        this.fallos.loadTexture(fallos + 'fail');
        if (fallos == 5) {
            this.findelJuego();
        }
    },

    findelJuego: function () {
        this.guardaPuntuacion();
        fallos = 0;
        puntuacion = 0;
        game.state.start('title');
    },
    
    guardarLogros: function (idlog, nomlog, tipolog) {
		var params = {
				"guardar" : true, //automático
				"idjuego" : parent.location.search.split('id=')[1], //automático
				//"idjuego" : 7, //automático
				"idusuario" : parent.document.getElementById('userid').value, //automático
				//"idusuario" : 2, //automático
				"idlogro" : idlog,
				"nombrelogro" : nomlog,
				"tipologro" : tipolog
				}
			$.ajax({
				data: params,
				url: '//localhost/prj/logros.php',
				type: 'post',
				beforeSend: function () {
					
				},
				success: function(response) {
					//lanzar notificacion segun respuesta
					if(response.length > 8) {
						$.notify(response, {globalPosition: 'top left', className: 'success'});
					}
				}
			});
	}

};