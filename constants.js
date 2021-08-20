const BOARD_WHITE = "#f0d9b5";
const BOARD_BLACK = "#b58863";
const BG_COLOUR = "#eeece0";
const SQUARE_SIZE = 80;
const Piece = {
    none: 0,
    king: 1,
    pawn: 2,
    knight: 3,
    bishop: 4,
    rook: 5,
    queen: 6,

    white: 8,
    black: 16,
}
// for, e.g., white king, use (Piece.king | Piece.white)

module.exports = {
    BOARD_WHITE,
    BOARD_BLACK,
    BG_COLOUR,
    SQUARE_SIZE,
    Piece
}