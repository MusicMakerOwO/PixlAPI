import {IGameClass} from '../types.js';

import TicTacToe from '../Games/TicTacToe';

const GAMES = new Map<string, IGameClass>();

GAMES.set(TicTacToe.name, TicTacToe);

export default GAMES;