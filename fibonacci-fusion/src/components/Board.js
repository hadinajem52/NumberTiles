import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import Tile from './Tile';
import { generateInitialTiles } from '../utils/fibonacci';

class Board extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tiles: generateInitialTiles(),
        };
    }

    renderTiles() {
        return this.state.tiles.map((tile, index) => (
            <Tile key={index} value={tile.value} />
        ));
    }

    render() {
        return (
            <View style={styles.board}>
                {this.renderTiles()}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    board: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
    },
});

export default Board;