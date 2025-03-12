const config = {
    initialBoardState: [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
    ],
    gridSize: 5,
    availablePowerUps: [
        {
            name: "Double Merge",
            description: "Merge two tiles of the same value to double their value.",
            cost: 100,
        },
        {
            name: "Undo Move",
            description: "Undo the last move made.",
            cost: 50,
        },
    ],
    maxScore: 10000,
    animations: {
        tile: {
            moveSpeed: 150, // ms
            appearSpeed: 200, // ms
            mergeSpeed: 200, // ms
            mergeEffects: {
                flash: true,
                rotate: true,
                scale: 1.2,
                duration: 120
            }
        }
    }
};

export default config;