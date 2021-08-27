/**
 * @author Caleb Tham
 */
const {
    arrayEqual,
    arrayRemoveItemOnce
} = require("./util.js");

class Game {

    startTime;
    increment;
    timer;
    board;

    // In binary, the 2 most significant digits indicate colour, and the 3 least significant digits
    // indicate type
    static Piece = {
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

    /**
     * @param {Object} board The board
     * @param {number} timer Timer in minutes
     * @param {number} increment Increment in seconds
     * @param {number} colour Colour player 1 starts as
     */
    constructor(board = undefined, timer = Infinity, increment = 0, colour = undefined) {
        if (board) {
            this.board = board;
        } else {
            this.board = Game.createInitBoard();
        }

        if (colour) {
            this.board.startingPlayer = (colour == Game.Piece.white) ? 1 : 2;
        } else {
            this.board.startingPlayer = Math.floor(Math.random() * 2) + 1; // If colour not set, means should be randomly assigned
        }

        this.increment = increment;
        this.timer = timer;
    }

    /**
     * @param {number} p The piece
     * @returns The piece with the colour flipped
     */
    static flipPieceColour(p) {
        return (p & 7) | (Game.isPieceColour(p, Game.Piece.white) ? Game.Piece.black : Game.Piece.white);
    }

    /**
     * @param {number} p The piece
     * @returns The standard valuation of the piece
     */
    static pieceValue(p) {
        let pieceValue = [0,1000,1,3,3,5,9];
        return pieceValue[p & 7] * (Game.isPieceColour(p, Game.Piece.white) ? 1 : -1);
    }

    /**
     * @param {number} p The piece
     * @returns True iff the piece is a bishop, rook or queen
     */
    static isPieceSliding(p) {
        let pieceNoColour = p & 7; // Remove colour of piece with bitwise AND
        return pieceNoColour == 4
            || pieceNoColour == 5
            || pieceNoColour == 6;
    } 

    /**
     * @param {number} p The piece
     * @param {number} col The colour
     * @returns True iff the piece is the colour given
     */
    static isPieceColour(p, col) {
        let pieceNoType = p & 24; // Remove type of piece with bitwise AND
        return pieceNoType == col;
    }
    
    /**
     * @param {number} p The piece
     * @param {number} type The type
     * @returns True iff the piece is the type given
     */
    static isPieceType(p, type) {
        let pieceNoColour = p & 7; // Remove colour of piece with bitwise AND
        return pieceNoColour == type;
    }
    
    /**
     * @param {number} p1 A piece
     * @param {number} p2 Another piece
     * @returns True iff the pieces are the same type
     */
    static isSameType(p1, p2) {
        return (p1 & 7) == (p2 & 7); // Remove colour of piece with bitwise AND
    }

    /**
     * @param {number} p1 A piece
     * @param {number} p2 Another piece
     * @returns True iff the pieces are the same colour
     */
    static isSameColour(p1, p2) {
        return (p1 & 24) == (p2 & 24); // Remove type of piece with bitwise AND
    }

    /**
     * Gets the key for the associative array of valid moves given the start and end indices on board
     * @param {number} start Board index of starting square of move
     * @param {number} end Board index of target square of move
     * @returns The key for the associative array of valid moves
     */
    static encode(start, end) {
        return start * 100 + end;
    }
    
    /**
     * Given a key used in the associative array of valid moves, returns the start and target square
     * indices represented by the key/code
     * @param {number} code Key used in the associative array of valid moves
     * @returns The start and target square indices represented by the code
     */
    static decode(code) {
        let start = Math.floor(code / 100)
        return {"start": start,
                "target": code - start*100};
    }
    
    /**
     * Given a board index, returns the corresponding x and y coordinates for that square
     * @param {number} i The board index
     * @returns The x and y coordinate
     */
    static convert1dTo2d(i) {
        return {"x": i % 8,
                "y": Math.floor(i / 8)}
    }
    
    /**
     * Given an x and y coordinate, returns the corresponding board index
     * @param {number} x The x coordinate
     * @param {number} y The y coordinate
     * @returns The board index
     */
    static convert2dTo1d(x,y) {
        return x + y*8;
    }

    /**
     * @returns Initial board object
     */
    static createInitBoard() {
        return {
            square: [21,19,20,22,17,20,19,21,18,18,18,18,18,18,18,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10,10,10,10,10,10,10,10,13,11,12,14,9,12,11,13],
            inHand: 0,
            movedTo: -1,
            movedFrom: -1,
            hiddenSquare: -1,
            isLegalMove: new Array(64).fill(false),
            enPassantSquare: -1,
            canWhiteLeftCastle: true,
            canWhiteRightCastle: true,
            canBlackLeftCastle: true,
            canBlackRightCastle: true,
            whiteInCheck: false,
            blackInCheck: false,
            directionOffsets: [-8, 8, -1, 1, -9, 9, -7, 7], // 0=north, 1=south, 2=west, 3=east, 4=north-west, 5=south-east, 6=north-east, 7=south-west
            numSquaresToEdge: [[0,7,0,7,0,7,0,0],[0,7,1,6,0,6,0,1],[0,7,2,5,0,5,0,2],[0,7,3,4,0,4,0,3],[0,7,4,3,0,3,0,4],[0,7,5,2,0,2,0,5],[0,7,6,1,0,1,0,6],[0,7,7,0,0,0,0,7],[1,6,0,7,0,6,1,0],[1,6,1,6,1,6,1,1],[1,6,2,5,1,5,1,2],[1,6,3,4,1,4,1,3],[1,6,4,3,1,3,1,4],[1,6,5,2,1,2,1,5],[1,6,6,1,1,1,1,6],[1,6,7,0,1,0,0,6],[2,5,0,7,0,5,2,0],[2,5,1,6,1,5,2,1],[2,5,2,5,2,5,2,2],[2,5,3,4,2,4,2,3],[2,5,4,3,2,3,2,4],[2,5,5,2,2,2,2,5],[2,5,6,1,2,1,1,5],[2,5,7,0,2,0,0,5],[3,4,0,7,0,4,3,0],[3,4,1,6,1,4,3,1],[3,4,2,5,2,4,3,2],[3,4,3,4,3,4,3,3],[3,4,4,3,3,3,3,4],[3,4,5,2,3,2,2,4],[3,4,6,1,3,1,1,4],[3,4,7,0,3,0,0,4],[4,3,0,7,0,3,4,0],[4,3,1,6,1,3,4,1],[4,3,2,5,2,3,4,2],[4,3,3,4,3,3,4,3],[4,3,4,3,4,3,3,3],[4,3,5,2,4,2,2,3],[4,3,6,1,4,1,1,3],[4,3,7,0,4,0,0,3],[5,2,0,7,0,2,5,0],[5,2,1,6,1,2,5,1],[5,2,2,5,2,2,5,2],[5,2,3,4,3,2,4,2],[5,2,4,3,4,2,3,2],[5,2,5,2,5,2,2,2],[5,2,6,1,5,1,1,2],[5,2,7,0,5,0,0,2],[6,1,0,7,0,1,6,0],[6,1,1,6,1,1,6,1],[6,1,2,5,2,1,5,1],[6,1,3,4,3,1,4,1],[6,1,4,3,4,1,3,1],[6,1,5,2,5,1,2,1],[6,1,6,1,6,1,1,1],[6,1,7,0,6,0,0,1],[7,0,0,7,0,0,7,0],[7,0,1,6,1,0,6,0],[7,0,2,5,2,0,5,0],[7,0,3,4,3,0,4,0],[7,0,4,3,4,0,3,0],[7,0,5,2,5,0,2,0],[7,0,6,1,6,0,1,0],[7,0,7,0,7,0,0,0]], // numSquaresToEdge[x][y] gives the number of squares there are from the square with the index x in the direction of y. Values of y: 0=north, 1=south, 2=west, 3=east, 4=north-west, 5=south-east, 6=north-east, 7=south-west
            whitePiecesTaken: [],
            blackPiecesTaken: [],
            whiteAdvantage: 0,
            colourToMove: 8,
            history: undefined,
            startingPlayer: 1,
            invalid: -1,
            isGameFinished: false,
            checkmate: false,
            stalemate: false
        };
    }
    
    // 
    /**
     * Attempts to find a start and target to move from initial board to next board
     * @param {Object} initBoard The initial board
     * @param {Object} nextBoard The board after making a move
     * @returns An object containing start and target if found, else false
     */
    static getStartAndTarget(initBoard, nextBoard) {
        let diffSquares = []
    
        // Get number of differences between the initial board and the next board
        for (let i = 0; i < 64; i++) {
            if (nextBoard.square[i] - initBoard.square[i]) {
                diffSquares.push(i);
    
                if (diffSquares.length > 4) {
                    return false;
                }
            }
        }
    
        if (diffSquares.length == 4) { // Assume castling

            // Try and get the king and rook for start and target
            let initKingSquare;
            let initRookSquare;
            let initNoneCount = 0;
            let nextKingSquare;
            let nextRookSquare;
            let nextNoneCount = 0;
            for (let i = 0; i < 4; i++) {
                if (Game.isPieceType(initBoard.square[diffSquares[i]], Game.Piece.king)) {
                    initKingSquare = diffSquares[i];
                } else if (Game.isPieceType(initBoard.square[diffSquares[i]], Game.Piece.rook)) {
                    initRookSquare = diffSquares[i];
                } else if (Game.isPieceType(initBoard.square[diffSquares[i]], Game.Piece.none)) {
                    initNoneCount++;
                }
                
                if (Game.isPieceType(nextBoard.square[diffSquares[i]], Game.Piece.king)) {
                    nextKingSquare = diffSquares[i];
                } else if (Game.isPieceType(nextBoard.square[diffSquares[i]], Game.Piece.rook)) {
                    nextRookSquare = diffSquares[i];
                } else if (Game.isPieceType(nextBoard.square[diffSquares[i]], Game.Piece.none)) {
                    nextNoneCount++;
                }
            }
    
            if (initKingSquare && nextKingSquare
                && initRookSquare && nextRookSquare
                && initNoneCount == 2 && nextNoneCount == 2) { // If possible valid castling
    
                    return {
                        start: initKingSquare,
                        target: initRookSquare
                    };
    
            }

        } else if (diffSquares.length == 3) { // Assume en passant
            let start;
            let target = initBoard.enPassantSquare;

            // The start would be the square on a diagonal to the enPassantSquare
            for (let i = 0; i < 3; i++) {
                if (Math.abs(target - diffSquares[i]) != 8 && Math.abs(target - diffSquares[i]) != 0) {
                    start = diffSquares[i];
                    break;
                }
            }

            return {
                start: start,
                target: target
            }
    
        } else if (diffSquares.length == 2) { // Assume standard move
            let start = diffSquares[0];
            let target = diffSquares[1];
            if (nextBoard.square[start] != 0) { 
                start = diffSquares[1];
                target = diffSquares[0];
            }
    
            return {
                start: start, 
                target: target
            }
    
        }
    
        return false;
    
    }
    
    /**
     * Toggles the colour to move on the board
     */
    switchColour() {
        this.board.colourToMove ^= 24; // Flip 2 left-most digits with bitwise XOR
    }
    
    /**
     * Returns an associative array of all legal moves that can be currently made on the board
     * @param {boolean} isCheckingCheck Boolean indicating whether the function should make checks for 
     * check
     * @returns An associative array of the moves
     */
    generateAllLegalMoves(isCheckingCheck = false) {
        let moves = []
        for (let i = 0; i < 64; i++) {
            this.generateLegalMoves(i, isCheckingCheck).forEach(move => {
                moves[move] = move;
            });
        }
        return moves;
    }
    
    /**
     * Given a start index for the board, returns an associative array of all legal moves that can be
     * made from that start index
     * @param {number} start The index on the board that a piece is to be moved from
     * @param {boolean} isCheckingCheck Boolean indicating whether the function should make checks for 
     * check
     * @returns  An associative array of the moves
     */
    generateLegalMoves(start, isCheckingCheck = false) {
        let moves = []
        let piece = this.board.square[start];
        if (Game.isPieceColour(piece, this.board.colourToMove)) {
    
            // Generate piece moves then add them to associative array
            if (Game.isPieceSliding(piece)) {
                this.generateSlidingMoves(start, piece).forEach(code => {
                    let move = Game.decode(code);
                    // If checking check, only add move if it does not move into check
                    if (!isCheckingCheck || this.makeMove(move.start, move.target, true)) {
                        moves[code] = code;
                    }
                });
    
            } else if (Game.isPieceType(piece, Game.Piece.king)) {
                this.generateKingMoves(start).forEach(code => {
                    let move = Game.decode(code);
                    // If checking check, only add move if it does not move into check
                    if (!isCheckingCheck || this.makeMove(move.start, move.target, true)) {
                        moves[code] = code;
                    }
                });
            
            } else if (Game.isPieceType(piece, Game.Piece.knight)) {
                this.generateKnightMoves(start).forEach(code => {
                    let move = Game.decode(code);
                    // If checking check, only add move if it does not move into check
                    if (!isCheckingCheck || this.makeMove(move.start, move.target, true)) {
                        moves[code] = code;
                    }
                });
            
            } else if (Game.isPieceType(piece, Game.Piece.pawn)) {
                this.generatePawnMoves(start).forEach(code => {
                    let move = Game.decode(code);
                    // If checking check, only add move if it does not move into check
                    if (!isCheckingCheck || this.makeMove(move.start, move.target, true)) {
                        moves[code] = code;
                    }
                });
            }
    
        }
        return moves;
    }
    
    /**
     * Given a start index for the board, returns an associative array of all legal moves that can be
     * made from that start index by a king
     * @param {number} start The index on the board that a king is to be moved from
     * @returns  An associative array of the moves
     */
    generateKingMoves(start) {
        let moves = [];
        let key;
    
        // Standard move (to surrounding squares)
        for (let i = 0; i < 8; i++) {
    
            if (this.board.numSquaresToEdge[start][i] >= 1) { // Check move in boundaries of board
                let target = start + this.board.directionOffsets[i];
                let pieceOnTarget = this.board.square[target];
        
                if (!Game.isPieceColour(pieceOnTarget, this.board.colourToMove)) {
                    key = Game.encode(start, target)
                    moves[key] = key;                
                }
            }   
        }
    
        // Castling
        let pieceOnStart = this.board.square[start];
        if (!this.board.whiteInCheck) {
            // white queen-side castle
            if (this.board.canWhiteLeftCastle && Game.isPieceColour(pieceOnStart, Game.Piece.white)) {
                if (this.board.square[57] == Game.Piece.none && this.board.square[58] == Game.Piece.none && this.board.square[59] == Game.Piece.none) {
                    key = Game.encode(start, 56)
                    moves[key] = key;
                }
            }
            // white king-side castle
            if (this.board.canWhiteRightCastle && Game.isPieceColour(pieceOnStart, Game.Piece.white)) {
                if (this.board.square[62] == Game.Piece.none && this.board.square[61] == Game.Piece.none) {
                    key = Game.encode(start, 63)
                    moves[key] = key;
                }
            }
        }
        
        if (!this.board.blackInCheck) {
            // black queen-side castle
            if (this.board.canBlackLeftCastle && Game.isPieceColour(pieceOnStart, Game.Piece.black)) {
                if (this.board.square[1] == Game.Piece.none && this.board.square[2] == Game.Piece.none && this.board.square[3] == Game.Piece.none) {
                    key = Game.encode(start, 0)
                    moves[key] = key;
                }
            }
            // black king-side castle
            if (this.board.canBlackRightCastle && Game.isPieceColour(pieceOnStart, Game.Piece.black)) {
                if (this.board.square[5] == Game.Piece.none && this.board.square[6] == Game.Piece.none) {
                    key = Game.encode(start, 7)
                    moves[key] = key;
                }
            }
        }
    
        return moves;
    }
    
    /**
     * Given a start index for the board, returns an associative array of all legal moves that can be
     * made from that start index by a knight
     * @param {number} start The index on the board that a knight is to be moved from
     * @returns  An associative array of the moves
     */
    generateKnightMoves(start) {
        let moves = [];
        let offsets = [[2,1], [1,2], [-2,1], [1,-2], [2,-1], [-1,2], [-2,-1], [-1,-2]];
        // [i,k], where i is difference in x index, j is difference in y index from start to target
        
        for (let i = 0; i < 8; i++) {
            let xOffset = offsets[i][0];
            let yOffset = offsets[i][1];
            let x = Game.convert1dTo2d(start).x;
            let y = Game.convert1dTo2d(start).y;
    
            if (x + xOffset >= 0 && x + xOffset <= 7
                && y + yOffset >= 0 && y + yOffset <= 7) { // Check move in boundaries of board
                    let target = start + Game.convert2dTo1d(xOffset, yOffset);
                    let pieceOnTarget = this.board.square[target];
    
                    if (!Game.isPieceColour(pieceOnTarget, this.board.colourToMove)) {
                        let key = Game.encode(start, target)
                        moves[key] = key;
                    }   
                }
        }
    
        return moves;
    }
    
    /**
     * Given a start index for the board, returns an associative array of all legal moves that can be
     * made from that start index by a pawn
     * @param {number} start The index on the board that a pawn is to be moved from
     * @returns  An associative array of the moves
     */
    generatePawnMoves(start) {
        let moves = [];
        let yOffset, initRank;
    
        if (this.board.colourToMove == Game.Piece.white) {
            yOffset = -8;
            initRank = 6;
        } else {
            yOffset = 8;
            initRank = 1;
        }
    
        // Standard move (one forward)
        let target = start + yOffset;
        let pieceOnTarget = this.board.square[target];
        let key;
    
        if (Game.isPieceType(pieceOnTarget, Game.Piece.none)) {
            key = Game.encode(start, target)
            moves[key] = key;
        }
    
        // West capture (including en passant)
        target -= 1;
        pieceOnTarget = this.board.square[target];
    
        if (this.board.numSquaresToEdge[start][2] >= 1 
            && ((!Game.isPieceType(pieceOnTarget, Game.Piece.none) 
                    && !Game.isPieceColour(pieceOnTarget, this.board.colourToMove)) 
                || this.board.enPassantSquare == target)) {
                key = Game.encode(start, target)
                moves[key] = key;
        }
    
        // East capture (including en passant)
        target += 2;
        pieceOnTarget = this.board.square[target];
    
        if (this.board.numSquaresToEdge[start][3] >= 1 
            && ((!Game.isPieceType(pieceOnTarget, Game.Piece.none) 
                    && !Game.isPieceColour(pieceOnTarget, this.board.colourToMove))
                || this.board.enPassantSquare == target)) {
                key = Game.encode(start, target)
                moves[key] = key;
        }
    
        // Double move
        if (Game.convert1dTo2d(start).y == initRank) {
            target = start + yOffset * 2;
            pieceOnTarget = this.board.square[target];
    
            if (Game.isPieceType(pieceOnTarget, Game.Piece.none) && Game.isPieceType(this.board.square[target - yOffset], Game.Piece.none)) {
                key = Game.encode(start, target)
                moves[key] = key;
            }
    
        }
        return moves;
    }
    
    /**
     * Given a start index for the board, returns an associative array of all legal moves that can be
     * made from that start index by the sliding piece given (bishop, rook, or queen)
     * @param {number} start The index on the board that a sliding piece is to be moved from
     * @param {number} piece The sliding piece moving (bishop, rook, or queen)
     * @returns  An associative array of the moves
     */
    generateSlidingMoves(start, piece) {
        let moves = []
        let startDirIndex = (Game.isPieceType(piece, Game.Piece.bishop)) ? 4 : 0; // Bishop can only move in last 4 directions in board.directionOffsets
        let endDirIndex = (Game.isPieceType(piece, Game.Piece.rook)) ? 4 : 8;     // Rook can only move in first 4 directions in board.directionOffsets
    
        for (let directionIndex = startDirIndex; directionIndex < endDirIndex; directionIndex++) {
            for (let n = 0; n < this.board.numSquaresToEdge[start][directionIndex]; n++) {
                let target = start + this.board.directionOffsets[directionIndex] * (n+1);
                let pieceOnTarget = this.board.square[target];
    
                // If own piece blocking
                if (Game.isPieceColour(pieceOnTarget, this.board.colourToMove)) {
                    break;
                }
    
                let key = Game.encode(start, target)
                moves[key] = key;
    
                // If opponent piece blocking
                if (!Game.isPieceType(pieceOnTarget, Game.Piece.none) && !Game.isPieceColour(pieceOnTarget, this.board.colourToMove)) {
                    break;
                }
            }
        }
        return moves
    }
    
    /**
     * Checks whether a move is valid
     * @param {number} start The index on the board that a sliding piece is to be moved from
     * @param {number} target The index on the board that a sliding piece is to be moved to
     * @returns True iff the move is legal
     */
    isMoveLegal(start, target) {
        if (this.generateLegalMoves(start, true)[Game.encode(start,target)]) {
            return true;
        } else {
            return false;
        }
    }
    
    /**
     * Attempts to move a piece from the start index to the target index. If trying to actually move
     * piece, only moves piece if it is a valid move
     * @param {number} start The index on the board that a sliding piece is to be moved from
     * @param {number} target The index on the board that a sliding piece is to be moved to
     * @param {boolean} isGeneratingMoves Boolean indicating whether the function is being used to
     * generate moves (false indicates that the function is being used to actually make the move)
     * @returns A Boolean indicating whether the move was valid
     */
    makeMove(start, target, isGeneratingMoves = false) {
    
        // If called for purpose of generating moves or checked it is a valid move
        if (isGeneratingMoves || this.generateLegalMoves(start, false)[Game.encode(start,target)]) {
    
            // UPDATE HISTORY
            this.board.history = JSON.parse(JSON.stringify(this.board));
    
            // MAKE MOVE
            let piece = this.board.square[start]
    
            // Castling
            if (Game.isPieceType(this.board.square[target], Game.Piece.rook)
                && Game.isPieceColour(this.board.square[target], this.board.colourToMove)
                && (target == 0 || target == 7 || target == 56 || target == 63)) {
    
                    if (target == 0) { // black queen-side castle

                        // Check if squares inbetween king and castle are under attack
                        this.board.square[1] = Game.Piece.king | Game.Piece.black;
                        this.board.square[2] = Game.Piece.king | Game.Piece.black;
                        this.board.square[3] = Game.Piece.king | Game.Piece.black;
                        if (this.isInCheck()) {
                            this.undoMove();
                            return false;
                        }

                        // Perform castle
                        this.board.square[0] = Game.Piece.none;
                        this.board.square[1] = Game.Piece.none;
                        this.board.square[2] = Game.Piece.king | Game.Piece.black;
                        this.board.square[3] = Game.Piece.rook | Game.Piece.black;
                        this.board.square[4] = Game.Piece.none;

                    } else if (target == 7) { // black king-side castle

                        // Check if squares inbetween king and castle are under attack
                        this.board.square[6] = Game.Piece.king | Game.Piece.black;
                        this.board.square[5] = Game.Piece.king | Game.Piece.black;
                        if (this.isInCheck()) {
                            this.undoMove();
                            return false;
                        }

                        // Perform castle
                        this.board.square[4] = Game.Piece.none;
                        this.board.square[5] = Game.Piece.rook | Game.Piece.black;
                        this.board.square[6] = Game.Piece.king | Game.Piece.black;
                        this.board.square[7] = Game.Piece.none;

                    } else if (target == 56) { // white queen-side castle

                        // Check if squares inbetween king and castle are under attack
                        this.board.square[57] = Game.Piece.king | Game.Piece.white;
                        this.board.square[58] = Game.Piece.king | Game.Piece.white;
                        this.board.square[59] = Game.Piece.king | Game.Piece.white;
                        if (this.isInCheck()) {
                            this.undoMove();
                            return false;
                        }

                        // Perform castle
                        this.board.square[56] = Game.Piece.none;
                        this.board.square[57] = Game.Piece.none;
                        this.board.square[58] = Game.Piece.king | Game.Piece.white;
                        this.board.square[59] = Game.Piece.rook | Game.Piece.white;
                        this.board.square[60] = Game.Piece.none;

                    } else { // white king-side castle

                        // Check if squares inbetween king and castle are under attack
                        this.board.square[62] = Game.Piece.king | Game.Piece.white;
                        this.board.square[61] = Game.Piece.king | Game.Piece.white;
                        if (this.isInCheck()) {
                            this.undoMove();
                            return false;
                        }
                        
                        // Perform castle
                        this.board.square[60] = Game.Piece.none;
                        this.board.square[61] = Game.Piece.rook | Game.Piece.white;
                        this.board.square[62] = Game.Piece.king | Game.Piece.white;
                        this.board.square[63] = Game.Piece.none;
                    }

                    
                
            // Not castling
            } else {
    
                this.board.square[target] = piece;
                this.board.square[start] = Game.Piece.none;
    
                // En passant capture
                if (target == this.board.enPassantSquare && Game.isPieceType(piece, Game.Piece.pawn)) {
                    if (Game.isPieceColour(piece, Game.Piece.white)) {
                        this.board.square[this.board.enPassantSquare + 8] = Game.Piece.none;
                    } else {
                        this.board.square[this.board.enPassantSquare - 8] = Game.Piece.none;
                    }
                }
    
                // Promotion
                if (Game.isPieceType(piece, Game.Piece.pawn)) {
                    if (Game.isPieceColour(piece, Game.Piece.white)) {
                        if (Game.convert1dTo2d(target).y == 0) {
                            this.board.square[target] = Game.Piece.queen | Game.Piece.white;
                        }
                    } else {
                        if (Game.convert1dTo2d(target).y == 7) {
                            this.board.square[target] = Game.Piece.queen | Game.Piece.black;
                        }
                    }
                }
     
            }        
    
            // UPDATE VARIABLES
    
            // Update ability to en passant
            this.board.enPassantSquare = -1;
            if (Game.isPieceType(piece, Game.Piece.pawn) 
                && Math.abs(start - target) == 16) {
                    if (Game.isPieceColour(piece, Game.Piece.black) && Game.convert1dTo2d(start).y == 1) {
                        this.board.enPassantSquare = start + 8;
                    } else if (Game.isPieceColour(piece, Game.Piece.white) && Game.convert1dTo2d(start).y == 6) {
                        this.board.enPassantSquare = start - 8;
                    }
            }
    
            // Update ability to castle
            if (Game.isPieceType(piece, Game.Piece.king)) {
                if (Game.isPieceColour(piece, Game.Piece.white)) {
                    this.board.canWhiteLeftCastle = false;
                    this.board.canWhiteRightCastle = false;
                } else {
                    this.board.canBlackLeftCastle = false;
                    this.board.canBlackRightCastle = false;
                }
            }
            if (start == 0 || target == 0) { // move/take rook in corner (may activate again for non rook, so set to false)
                this.board.canBlackLeftCastle = false;
            } else if (start == 7 || target == 7) {
                this.board.canBlackRightCastle = false;
            } else if (start == 56 || target == 56) {
                this.board.canWhiteLeftCastle = false;
            } else if (start == 63 || target == 63) {
                this.board.canWhiteRightCastle = false;
            }
    
            // DEALING WITH CHECK
    
            // Initialise check boolean
            this.board.whiteInCheck = false;
            this.board.blackInCheck = false;
            
            // Check moving into check
            if (this.isInCheck()) {
                this.undoMove()
                return false;
            }
    
            // Undo move made if generating moves
            if (isGeneratingMoves) {
                this.undoMove();
                return true;
            
            // CHECK END OF GAME STATES
            } else {
    
                let validMoves = this.hasValidMoves();
    
                this.switchColour();
    
                let check = this.isInCheck();
    
                if (check && this.board.colourToMove == Game.Piece.white) {
                    this.board.whiteInCheck = true;
                } else if (check) {
                    this.board.blackInCheck = true;
                }
    
                // Next player has no valid moves
                if (!validMoves) {
                    if (check) { // Checkmate
                        this.board.checkmate = true;
                        this.board.isGameFinished = true;
                        return this.madeMove(start, target);
                    } else { // Stalemate
                        this.board.stalemate = true;
                        this.board.isGameFinished = true;
                        return this.madeMove(start, target);
                    }
                }
    
                // Stalemate: threefold reptition
                let count = 1;
                let temp = this.board;
                while (temp.history) {
                    temp = temp.history;
    
                    if (arrayEqual(this.board.square, temp.square)) {
                        count++;
                    }
    
                    if (count == 3) {
                        this.board.stalemate = true;
                        this.board.isGameFinished = true;
                        return this.madeMove(start, target);
                    }
                }
    
                // Stalemate: insufficient material (both sides have either of: lone king, king and knight, king and bishop)
                let whiteTotal = 0;
                let blackTotal = 0;
                let thereIsPawn = false;
                for (let i=0; i<64; i++) {
                    if (!Game.isPieceType(this.board.square[i], Game.Piece.pawn)) {
                        if (Game.isPieceColour(this.board.square[i], Game.Piece.white)) {
                            whiteTotal += this.board.square[i] & 7;
                            if (whiteTotal > 5) { 
                                break;
                            }
    
                        } else if (Game.isPieceColour(this.board.square[i], Game.Piece.black)) {
                            blackTotal += this.board.square[i] & 7;
                            if (blackTotal > 5) { 
                                break;
                            }
                        }
                    } else if (!Game.isPieceType(this.board.square[i], Game.Piece.none)) {
                        thereIsPawn = true;
                        break;
                    }
                }
    
                if (!thereIsPawn && whiteTotal <= 5 && blackTotal <= 5) {
                    this.board.stalemate = true;
                    this.board.isGameFinished = true;
                    return this.madeMove(start, target);
                }

                return this.madeMove(start, target);
            }
            
        }
        
        return false;
    }

    /**
     * Updates relevant variables for when a move is made. Updates variables for when a piece is captured
     * @param {number} start The index on the board that a sliding piece is to be moved from
     * @param {number} target The index on the board that a sliding piece is to be moved to
     * @returns True
     */
    madeMove(start, target) {
        this.board.movedFrom = start;
        this.board.movedTo = target;

        if (this.board.history 
            && (!Game.isSameColour(this.board.history.square[start], this.board.history.square[target])
                || this.board.history.enPassantSquare == target)) { // check not same colour to rule out castling, and check for en passant capture
                
                let piece;

                // Captured
                piece = (this.board.history.enPassantSquare == target) ? (Game.Piece.pawn | (this.board.colourToMove)) : this.board.history.square[target];
                if (!Game.isPieceType(piece, Game.Piece.none)) {
                    this.captured(piece);

                }

                // Promotion
                piece = this.board.square[target];
                if (Game.isPieceType(piece, Game.Piece.queen)
                    && Game.isPieceType(this.board.history.square[start], Game.Piece.pawn)) {
                        this.captured(Game.flipPieceColour(piece));
                }
        }

        return true;
    }

    /**
     * Update variables for when a piece is captured
     * @param {number} piece Piece captured
     */
    captured(piece) {
        let sameColourTaken;    // To store the pieces taken of same colour
        let otherColourTaken;   // To store the pieces taken of different colour

        if (Game.isPieceColour(piece, Game.Piece.white)) {
            sameColourTaken = this.board.whitePiecesTaken;
            otherColourTaken = this.board.blackPiecesTaken;
        } else {
            sameColourTaken = this.board.blackPiecesTaken; 
            otherColourTaken = this.board.whitePiecesTaken;
        }

        // Checks if there is an equivalent piece taken by other colour
        let removePiece;
        otherColourTaken.every(p => {
            if (Game.isSameType(piece, p)) {
                removePiece = p;
                return false;
            }
            return true;
        });

        // If equivalent piece taken by other colour, remove the equivalent piece
        if (removePiece) {
            arrayRemoveItemOnce(otherColourTaken, removePiece);

        // Otherwise add the taken piece
        } else {
            sameColourTaken.push(piece);
            sameColourTaken.sort((a,b) => b-a); // sort descending
        }

        // Update the advantage of white
        this.board.whiteAdvantage -= Game.pieceValue(piece);
    }
    
    /**
     * Returns whether the current player has valid moves to make
     * @returns True iff there are valid moves
     */
    hasValidMoves() {
    
        this.switchColour();
    
        for (let i = 0; i < 64; i++) {
            if (this.generateLegalMoves(i, true).length > 0) {
                this.switchColour();
                return true;
            }
        }
    
        this.switchColour();
        return false;
    }
    
    /**
     * Returns whether the current player is in check
     * @returns True iff the player is in check
     */
    isInCheck() {
    
        this.switchColour();
        let inCheck = false;
    
        // Loop over all legal moves and checks if the opponent can move to the king's position
        for (let i = 0; i < 64; i++) {
    
            this.generateLegalMoves(i, false).every(move => {
                let target = Game.decode(move).target;
                if (Game.isPieceType(this.board.square[target], Game.Piece.king)) {
                    inCheck = true;
                    return false;
                }
                return true;
            });
            
            if (inCheck) {
                this.switchColour();
                return true
            }
        }
    
        this.switchColour();
        return false;
    }
    
    /**
     * Function to undo the last move made
     */
    undoMove() {
        if (this.board.history) {
            this.board = this.board.history;

            this.board.hiddenSquare = -1;
            this.board.inHand = Game.Piece.none;
            this.board.isLegalMove = new Array(64).fill(false);
            this.board.movedTo = -1;
            this.board.movedFrom = -1;
        }
    }
    
    /**
     * Carries out operations to service a request takeback for the colour given
     */
    serviceTakeback(playerColour) {
        this.undoMove();
        if (this.board.colourToMove == playerColour) {
            this.undoMove();
        }
        return this.board;
    }

    /**
     * Updates variables for when game starts
     */
    startGame() {
        this.startTime = Date.now();
        this.board.isGameFinished = false;
    }
    
    /**
     * Updates variables for when the game has ended
     */
    endGame() {
        this.board.isGameFinished = true;
    }
}

module.exports = {
    Game
} 