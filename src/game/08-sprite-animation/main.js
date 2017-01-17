
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
}

// inherit from Phaser.Sprite
Alien.prototype = Object.create(Phaser.Sprite.prototype);
Alien.prototype.constructor = Alien;

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
};

PlayState.create = function () {
    // create an image using the game's factory (.add)
    this.game.add.image(0, 0, 'background');

    // create the sprite ship and add it to the game world
    this.ship = new Ship(this.game, 256, 436);
    this.game.add.existing(this.ship);
    // create a group to manage bullets
    this.bullets = this.game.add.group();

    // add sample alien
    this.game.add.existing(new Alien(this.game, 50, 50));

    // register keys
    this.keys = this.game.input.keyboard.addKeys({
        left: Phaser.KeyCode.LEFT,
        right: Phaser.KeyCode.RIGHT,
        space: Phaser.KeyCode.SPACEBAR
    });

    this.keys.space.onDown.add(function () {
        this.ship.shoot(this.bullets);
    }, this);
};

PlayState.update = function () {
    if (this.keys.left.isDown) { // move left
        this.ship.move(-1);
    }
    else if (this.keys.right.isDown) { // move right
        this.ship.move(1);
    }
    else { // stop
        this.ship.move(0);
    }
};


window.onload = function() {
    new Phaser.Game(512, 512, Phaser.AUTO, 'game', PlayState);
};
