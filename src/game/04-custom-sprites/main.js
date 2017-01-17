let PlayState = {};

//
// Ship sprite
//
function Ship(game, x, y) {
    // call Phaser.Sprite parent constructor
    Phaser.Sprite.call(this, game, x, y, 'ship');

    this.anchor.setTo(0.5); // handle the sprite by its center
    this.game.physics.arcade.enable(this); // enable physics
    this.body.velocity.x = 100;
}

// inherit from Phaser.Sprite
Ship.prototype = Object.create(Phaser.Sprite.prototype);
Ship.prototype.constructor = Ship;

//
// Play game state
//

PlayState.preload = function () {
    // load our image assets
    this.game.load.image('background', '../assets/background.png');
    this.game.load.image('ship', '../assets/ship.png');
};

PlayState.create = function () {
    // create an image using the game's factory (.add)
    this.game.add.image(0, 0, 'background');

    // create the sprite ship
    this.ship = new Ship(this.game, 256, 436);
    // since we are instantiating the sprite and not using the factory method,
    // we need to manually add it to the game world
    this.game.add.existing(this.ship);
};


window.onload = function() {
    new Phaser.Game(512, 512, Phaser.AUTO, 'game', PlayState);
};
