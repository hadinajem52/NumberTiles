const soundEffects = {
    merge: new Audio(require('./merge.mp3')),
    click: new Audio(require('./click.mp3')),
    gameOver: new Audio(require('./gameOver.mp3')),
};

const playEffect = (effect) => {
    if (soundEffects[effect]) {
        soundEffects[effect].currentTime = 0; // Reset the sound to the start
        soundEffects[effect].play();
    }
};

export { playEffect };