class Tile {
    constructor(value) {
        this.value = value;
        this.merged = false; // Indicates if the tile has been merged in the current move
    }

    render() {
        // Logic to render the tile based on its value
        return `<div class="tile" style="background-color: ${this.getColor()};">${this.value}</div>`;
    }

    getColor() {
        // Define colors based on Fibonacci values
        const colors = {
            1: '#f9c74f',
            2: '#f3722c',
            3: '#f94144',
            5: '#90be6d',
            8: '#577590',
            13: '#43aa8b',
            21: '#f9c74f',
            34: '#f3722c',
            55: '#f94144',
            89: '#90be6d',
        };
        return colors[this.value] || '#f0efeb'; // Default color for unrecognized values
    }
}

export default Tile;