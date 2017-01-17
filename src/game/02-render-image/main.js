let PlayState = {};

PlayState.preload = function () {
    // load our image assets
    this.game.load.image('background', '../assets/background.png');
};

PlayState.create = function () {
    // create an image using the game's factory (.add)
    this.game.add.image(0, 0, 'background');
};

window.onload = function() {
    new Phaser.Game(512, 512, Phaser.AUTO, 'game', PlayState);
};
