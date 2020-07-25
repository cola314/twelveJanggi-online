const NOTHING = 0;
const PLAYER1 = 1;
const PLAYER2 = 2;

const BOARD = 0;
const HAVING = 1;

const Wang = 0;
const Sang = 1;
const Jang = 2;
const Ja = 3;
const Hu = 4;
const Mu = 5;

const SELECTED = 1;
const MOVED = 2;

const MAL_DIR = [
    [[1, -1], [1, 0], [1, 1], [0, -1], [0, 1], [-1, 1], [-1, 0], [-1, -1]],
    [[1, 1], [1, -1], [-1, 1], [-1, -1]],
    [[1, 0], [-1, 0], [0, 1], [0, -1]],
    [[-1, 0]],
    [[-1, -1], [-1, 0], [-1, 1], [0, 1], [0, -1], [1, 0]],
    []
];

function MAL(player, type, pos, highlighted) {
    this.player = player;
    this.type = type;
    this.pos = pos;
    this.highlighted = highlighted;
}

function POS(from, y, x) {
    this.from = from;
    this.y = y;
    this.x = x;
}

function GAME() {
    this.init_game();
}

GAME.prototype.init_game = function () {
    this.turn = PLAYER1;
    this.state = 0;
    this.player1 = [null, null, null, null, null, null];
    this.player2 = [null, null, null, null, null, null];
    this.board = Array(4);
    for (var i = 0; i < 4; i++) {
        this.board[i] = [null, null, null];
    }
    this.board[0][0] = new MAL(PLAYER2, Jang, new POS(BOARD, 0, 0), false);
    this.board[0][1] = new MAL(PLAYER2, Wang, new POS(BOARD, 0, 1), false);
    this.board[0][2] = new MAL(PLAYER2, Sang, new POS(BOARD, 0, 2), false);
    this.board[1][0] = new MAL(NOTHING, Mu, new POS(BOARD, 1, 0), false);
    this.board[1][1] = new MAL(PLAYER2, Ja, new POS(BOARD, 1, 1), false);
    this.board[1][2] = new MAL(NOTHING, Mu, new POS(BOARD, 1, 2), false);
    this.board[2][0] = new MAL(NOTHING, Mu, new POS(BOARD, 2, 0), false);
    this.board[2][1] = new MAL(PLAYER1, Ja, new POS(BOARD, 2, 1), false);
    this.board[2][2] = new MAL(NOTHING, Mu, new POS(BOARD, 2, 2), false);
    this.board[3][0] = new MAL(PLAYER1, Sang, new POS(BOARD, 3, 0), false);
    this.board[3][1] = new MAL(PLAYER1, Wang, new POS(BOARD, 3, 1), false);
    this.board[3][2] = new MAL(PLAYER1, Jang, new POS(BOARD, 3, 2), false);
}

GAME.prototype.set_turn = function (player) {
    this.turn = player;
}

GAME.prototype.get_board = function () {
    return this.board;
}

GAME.prototype.get_having = function (player) {
    if (player == PLAYER1) return this.player1;
    else if (player == PLAYER2) return this.player2;
    return null;
}

GAME.prototype.button_click = function (player, pos) {
    if (player != this.turn) return 0;
    if (pos.from == HAVING) {
        if (player == PLAYER1) {
            this.selected = this.player1[pos.y];
            clear_highlighted(this.board);
            for (let i = 1; i < 4; i++) {
                for (let j = 0; j < 3; j++) {
                    if (this.board[i][j].type == Mu) {
                        this.board[i][j].highlighted = true;
                    }
                }
            }
        }
        else if (player == PLAYER2) {
            this.selected = this.player2[pos.y];
            clear_highlighted(this.board);
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (this.board[i][j].type == Mu) {
                        this.board[i][j].highlighted = true;
                    }
                }
            }
        }
        return SELECTED;
    }
    else if (pos.from == BOARD) {
        if (this.board[pos.y][pos.x].highlighted) {
            if (this.board[pos.y][pos.x].type == Wang) {
                this.state = player;
            }
            else if (this.board[pos.y][pos.x].type != Mu) {
                let this_player = (player == PLAYER1 ? this.player1 : this.player2);
                for (let i = 0; i < 6; i++) {
                    if (this_player[i] == null) {
                        this_player[i] = new MAL(player, this.board[pos.y][pos.x].type, new POS(HAVING, i, 0), false);
                        break;
                    }
                }
            }

            if (this.selected.pos.from == BOARD) this.board[this.selected.pos.y][this.selected.pos.x] = new MAL(NOTHING, Mu, new POS(BOARD, this.selected.pos.y, this.selected.pos.x), false);
            else if (this.selected.pos.from == HAVING) {
                let this_player = (player == PLAYER1 ? this.player1 : this.player2);
                for (let i = this.selected.pos.y; i < 5; i++) {
                    if(this_player[i + 1] != null) {
                        this_player[i] = new MAL(player, this_player[i+1].type, new POS(HAVING, i, 0), false);
                    }
                    else this_player[i] = null;
                }
                this_player[5] = null;
            }
            this.board[pos.y][pos.x] = new MAL(player, this.selected.type, new POS(BOARD, pos.y, pos.x), false);
            if (this.board[pos.y][pos.x].type == Ja && (player == PLAYER1 && pos.y == 0 || player == PLAYER2 && pos.y == 3)) {
                this.board[pos.y][pos.x].type = Hu;
            }
            clear_highlighted(this.board);

            if (player == PLAYER1) {
                for (let i = 0; i < 3; i++) {
                    if (this.board[3][i].type == Wang && this.board[3][i].player == PLAYER2) {
                        this.state = PLAYER2;
                    }
                }
            }
            else if (player == PLAYER2) {
                for (let i = 0; i < 3; i++) {
                    if (this.board[0][i].type == Wang && this.board[0][i].player == PLAYER1) {
                        this.state = PLAYER1;
                    }
                }
            }
            return MOVED;
        }
        else if (this.board[pos.y][pos.x].player == player) {
            this.selected = this.board[pos.y][pos.x];
            clear_highlighted(this.board);
            for (let i = 0; i < MAL_DIR[this.selected.type].length; i++) {
                let y = pos.y + (player == PLAYER1 ? 1 : -1) * MAL_DIR[this.selected.type][i][0];
                let x = pos.x + MAL_DIR[this.selected.type][i][1];
                if (0 <= x && x < 3 && 0 <= y && y < 4 && this.board[y][x].player != player) {
                    this.board[y][x].highlighted = true;
                }
            }
            return SELECTED;
        }
    }
}

function clear_highlighted(board) {
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 3; j++) {
            board[i][j].highlighted = false;
        }
    }
}