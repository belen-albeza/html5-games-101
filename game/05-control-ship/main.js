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

Ship.prototype.shoot = function () {
    // TODO: implement
    console.log('Payun!');
};

// =============================================================================
// Play game state
// =============================================================================

let PlayState = {};

PlayState.preload = function () {
    // load our image assets
    this.game.load.image('background', '../assets/background.png');
    this.game.load.image('ship', '../assets/ship.png');
};

PlayState.create = function () {
    // create an image using the game's factory (.add)
    this.game.add.image(0, 0, 'background');

    // create the sprite ship and add it to the game world
    this.ship = new Ship(this.game, 256, 436);
    this.game.add.existing(this.ship);

    // register keys
    this.keys = this.game.input.keyboard.addKeys({
        left: Phaser.KeyCode.LEFT,
        right: Phaser.KeyCode.RIGHT,
        space: Phaser.KeyCode.SPACEBAR
    });
    // subscribe to keyboard events
    this.keys.space.onDown.add(function () {
        this.ship.shoot();
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
