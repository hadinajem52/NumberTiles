const music = {
    audio: new Audio(require('./background-music.mp3')),
    isPlaying: false,

    play() {
        if (!this.isPlaying) {
            this.audio.play();
            this.isPlaying = true;
        }
    },

    pause() {
        if (this.isPlaying) {
            this.audio.pause();
            this.isPlaying = false;
        }
    },

    stop() {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.isPlaying = false;
    }
};

export default music;