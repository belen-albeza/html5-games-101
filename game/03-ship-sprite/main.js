let PlayState = {};

PlayState.preload = function () {
    // load our image assets
    this.game.load.image('background', '../assets/background.png');
    this.game.load.image('ship', '../assets/ship.png');
};

PlayState.create = function () {
    // create an image using the game's factory (.add)
    this.game.add.image(0, 0, 'background');

    // create the sprite ship
    this.ship = this.game.add.sprite(256, 436, 'ship');
    this.ship.anchor.setTo(0.5); // handle the sprite by its center
    // setup physics for the ship sprite
    this.game.physics.arcade.enable(this.ship);
    this.ship.body.velocity.x = 100;
};


window.onload = function() {
    new Phaser.Game(512, 512, Phaser.AUTO, 'game', PlayState);
};
