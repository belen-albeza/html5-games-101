
// =============================================================================
// Sprites
// =============================================================================

//
// Alien sprite
//

function Alien(game, x, y) {
    // call Phaser.Sprite parent constructor
    Phaser.Sprite.call(this, game, x, y, 'alien');

    this.anchor.setTo(0.5); // handle sprite from its center
    this.game.physics.enable(this); // enable physics

    this.animations.add('fly', [0, 1]); // add animation from sprite sheet
    this.animations.play('fly', 2, true); // play at 2fps, looped

    this.reset(x, y);
}

// inherit from Phaser.Sprite
Alien.prototype = Object.create(Phaser.Sprite.prototype);
Alien.prototype.constructor = Alien;

// Creates a new bullet object, using sprite pooling
// NOTE: since all of these spawner functions are very similar, we could
//       do some DRY and code a curried spawner method. See:
//       https://www.sitepoint.com/currying-in-functional-javascript/
Alien.spawn = function (group, x, y) {
    let alien = group.getFirstExists(false);
    // no free slot found, we need to create a new sprite
    if (alien === null) {
        alien = new Alien(group.game, x, y);
        group.add(alien);
    }
    // free slot found! we just need to reset the sprite to the initial position
    else {
        alien.reset(x, y);
    }

    return alien;
};

Alien.prototype.reset = function (x, y) {
    // call Phaser.Sprite reset
    Phaser.Sprite.prototype.reset.call(this, x, y);

    // set random horizontal and vertical speed for the alien
    const MIN_SPEEDY = 100, MAX_SPEEDY = 400;
    const MAX_SPEEDX = 100;
    this.body.velocity.y = this.game.rnd.between(MIN_SPEEDY, MAX_SPEEDY);
    this.body.velocity.x = this.game.rnd.between(-MAX_SPEEDX, MAX_SPEEDX);
};

Alien.prototype.update = function () {
    // kill the alien when they go off screen
    if (this.y > this.game.world.height + this.height) {
        this.kill(); // this sets its alive and exists properties to false
    }
};

//
// Bullet sprite
//

function Bullet(game, x, y) {
    // call Phaser.Sprite parent constructor
    Phaser.Sprite.call(this, game, x, y, 'bullet');

    this.anchor.setTo(0.5, 1); // handle from the bottom
    this.game.physics.arcade.enable(this); // enable physics

    this.reset(x, y);
}

// inherit from Phaser.Sprite
Bullet.prototype = Object.create(Phaser.Sprite.prototype);
Bullet.prototype.constructor = Bullet;

// Creates a new bullet object, using sprite pooling
Bullet.spawn = function (group, x, y) {
    let bullet = group.getFirstExists(false);
    // no free slot found, we need to create a new sprite
    if (bullet === null) {
        bullet = new Bullet(group.game, x, y);
        group.add(bullet);
    }
    // free slot found! we just need to reset the sprite to the initial position
    else {
        bullet.reset(x, y);
    }

    return bullet;
};

Bullet.prototype.reset = function (x, y) {
    // call parent method
    Phaser.Sprite.prototype.reset.call(this, x, y);

    const SPEED = 400;
    this.body.velocity.y = -SPEED;
};

Bullet.prototype.update = function () {
    // kill bullet (this sets both alive and exists properties to false)
    if (this.y < 0) {
        this.kill();
    }
};


//
// Ship sprite
//

function Ship(game, x, y) {
    // call Phaser.Sprite parent constructor
    Phaser.Sprite.call(this, game, x, y, 'ship');

    this.anchor.setTo(0.5); // handle the sprite by its center
    this.game.physics.arcade.enable(this); // enable physics
}

// inherit from Phaser.Sprite
Ship.prototype = Object.create(Phaser.Sprite.prototype);
Ship.prototype.constructor = Ship;

Ship.prototype.move = function (dir) {
    const SPEED = 400;
    this.body.velocity.x = SPEED * dir;
};

Ship.prototype.shoot = function (group) {
    let y = this.y - 12; // vertical offset for bullets, rounded
    const HALF = 22; // width of our sprite, rounded

    Bullet.spawn(group, this.x + HALF, y);
    Bullet.spawn(group, this.x - HALF, y);
};


// =============================================================================
// Play game state
// =============================================================================

let PlayState = {};

PlayState.preload = function () {
    // load our image assets
    this.game.load.image('background', '../assets/background.png');
    this.game.load.image('ship', '../assets/ship.png');
    this.game.load.image('bullet', '../assets/bullet.png');
    this.game.load.spritesheet('alien', '../assets/alien.png', 40, 44);
    // bitmap fonts are just regular images
    this.game.load.image('font', '../assets/retrofont.png');

    // load audio assets
    this.game.load.audio('music', '../assets/bgm.mp3');
    this.game.load.audio('shoot', '../assets/shoot.wav');
    this.game.load.audio('boom', '../assets/boom.wav');
};

PlayState.create = function () {
    // init game vars
    this.score = 0;

    // create monospaced, bitmap font for displaying the score
    this.scoreFont = this.game.add.retroFont('font', 16, 24,
        Phaser.RetroFont.TEXT_SET6);

    // create Sound objects
    this.audio = {
        music: this.game.add.audio('music'),
        shoot: this.game.add.audio('shoot'),
        explosion: this.game.add.audio('boom')
    };

    // play background music, looped
    this.audio.music.loopFull();

    // create an image using the game's factory (.add)
    this.game.add.image(0, 0, 'background');

    // create the sprite ship and add it to the game world
    this.ship = new Ship(this.game, 256, 436);
    this.game.add.existing(this.ship);
    // create a group to manage bullets
    this.bullets = this.game.add.group();
    // create a group to manage enemy aliens
    this.aliens =  this.game.add.group();

    // create score text - note that we need to do this *in addition*
    // to create the retro font. This is actually an image linked to the
    // retro font instead of an PNG asset.
    this.scoreLabel = this.game.add.image(4, this.game.world.height,
        this.scoreFont);
    this.scoreLabel.anchor.setTo(0, 1);

    // register keys
    this.keys = this.game.input.keyboard.addKeys({
        left: Phaser.KeyCode.LEFT,
        right: Phaser.KeyCode.RIGHT,
        space: Phaser.KeyCode.SPACEBAR
    });

    this.keys.space.onDown.add(function () {
        this.ship.shoot(this.bullets);
        this.audio.shoot.play();
    }, this);
};

PlayState.update = function () {
    // handle input
    if (this.keys.left.isDown) { // move left
        this.ship.move(-1);
    }
    else if (this.keys.right.isDown) { // move right
        this.ship.move(1);
    }
    else { // stop
        this.ship.move(0);
    }

    // randomly spawn new aliens (10% chance every frame)
    if (this.game.rnd.between(0, 100) < 10) {
        let x = this.game.rnd.between(0, this.game.world.width); // random x
        Alien.spawn(this.aliens, x, -50);
    }

    // handle collisions
    // bullet vs aliens overlap text with bounding boxes
    this.game.physics.arcade.overlap(this.bullets, this.aliens,
    function (bullet, alien) {
        // kill both of them
        bullet.kill();
        alien.kill();
        // play explosion sfx
        this.audio.explosion.play();
        // add points
        this.score += 50;
    }, null, this);

    // update score text label
    this.scoreFont.text = `Score:${this.score}`;
};


window.onload = function() {
    new Phaser.Game(512, 512, Phaser.AUTO, 'game', PlayState);
};
