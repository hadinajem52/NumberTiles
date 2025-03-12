// This file contains utility functions related to the 2048-style number merging game

export const generatePowersOfTwo = (n) => {
    const sequence = [];
    for (let i = 0; i < n; i++) {
        sequence.push(Math.pow(2, i+1)); // Start at 2 (2^1)
    }
    return sequence;
};

export const isPowerOfTwo = (num) => {
    return num > 0 && (num & (num - 1)) === 0;
};

export const getNextPowerOfTwo = (num) => {
    return num * 2;
};

export const getRandomStartingValue = () => {
    // 90% chance for 2, 10% chance for 4
    return Math.random() < 0.9 ? 2 : 4;
};

export const canMergeNumbers = (a, b) => {
    return a === b; // In 2048, identical numbers can merge
};