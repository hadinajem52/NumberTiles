const config = {
    initialBoardState: [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
    ],
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
};

export default config;