/**
 * @author Caleb Tham
 */
class Game {

    board;
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

    // i.e. is piece a bishop, rook, queen
    static isPieceSliding(p) {
        var pieceNoColour = p & 7;
        return pieceNoColour == 4
            || pieceNoColour == 5
            || pieceNoColour == 6;
    } 
    
    static isPieceColour(p, col) {
        var pieceNoType = p & 24;
        return pieceNoType == col;
    }
    
    static isPieceType(p, type) {
        var pieceNoColour = p & 7;
        return pieceNoColour == type;
    }
    
    static isSameType(p1, p2) {
        return (p1 & 7) == (p2 & 7);
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
            colourToMove: 8,
            history: undefined,
            startingPlayer: 1,
            invalid: -1,
            isGameFinished: false,
            checkmate: false,
            stalemate: false
        };
    }
    
    // Returns start and target only if the difference between init board and next board is valid
    static getStartAndTarget(initBoard, nextBoard) {
        var diffSquares = []
    
        for (let i = 0; i < 64; i++) {
            if (nextBoard.square[i] - initBoard.square[i]) {
                diffSquares.push(i);
    
                if (diffSquares.length > 4) {
                    return false;
                }
            }
        }
    
        if (diffSquares.length == 4) { // Check castling
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
                && initNoneCount == 2 && nextNoneCount == 2) { // If valid castling
    
                    return {
                        start: initKingSquare,
                        target: initRookSquare
                    };
    
            }
    
        } else if (diffSquares.length == 2) {
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
     * Given two numeric arrays, returns whether the arrays contain the equal data at equal indices
     * @param {array} a An array
     * @param {array} b Another array
     * @returns True iff the two arrays have the equal data at all indices
     */
    static arrayEqual(a, b) {
        for (let i = 0; i < a.length; i++) {
            if (a[i] != b[i]) {
                return false;
            }
        }
        return true;
    }

    /**
     * Removes a value from an array
     * @param {array} arr An array
     * @param {any} value The value to remove from the array
     * @returns The array with value removed
     */
    static arrayRemoveItemOnce(arr, value) {
        var index = arr.indexOf(value);
        if (index > -1) {
          arr.splice(index, 1);
        }
        return arr;
      }
      

    /**
     * Given two numbers, returns the largest number
     * @param {number} a A number
     * @param {number} b Another number
     * @returns The largest number
     */
    static max(a, b) {
        return (a > b) ? a : b;
    }

    /**
     * Given two numbers, returns the smallest number
     * @param {number} a A number
     * @param {number} b Another number
     * @returns The smallest number
     */
    static min(a,b) {
        return (a < b) ? a : b;
    }

    constructor(board = undefined) {
        if (board) {
            this.board = board;
        } else {
            this.board = Game.createInitBoard();
        }
    }
    
    /**
     * Switches the colour that is to make a move next
     */
    switchColour() {
        this.board.colourToMove ^= 24; 
    }
    
    /**
     * Returns an associative array of all legal moves that can be currently made on the board
     * @param {boolean} isCheckingCheck Boolean indicating whether the function should make checks for 
     * check
     * @returns An associative array of the moves
     */
    generateAllLegalMoves(isCheckingCheck = false) {
        var moves = []
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
        var moves = []
        var piece = this.board.square[start];
        if (Game.isPieceColour(piece, this.board.colourToMove)) {
    
            if (Game.isPieceSliding(piece)) {
                this.generateSlidingMoves(start, piece, isCheckingCheck).forEach(code => {
                    var move = Game.decode(code);
                    if (!isCheckingCheck || this.makeMove(move.start, move.target, true)) {
                        moves[code] = code;
                    }
                });
    
            } else if (Game.isPieceType(piece, Game.Piece.king)) {
                this.generateKingMoves(start, isCheckingCheck).forEach(code => {
                    var move = Game.decode(code);
                    if (!isCheckingCheck || this.makeMove(move.start, move.target, true)) {
                        moves[code] = code;
                    }
                });
            
            } else if (Game.isPieceType(piece, Game.Piece.knight)) {
                this.generateKnightMoves(start, isCheckingCheck).forEach(code => {
                    var move = Game.decode(code);
                    if (!isCheckingCheck || this.makeMove(move.start, move.target, true)) {
                        moves[code] = code;
                    }
                });
            
            } else if (Game.isPieceType(piece, Game.Piece.pawn)) {
                this.generatePawnMoves(start, isCheckingCheck).forEach(code => {
                    var move = Game.decode(code);
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
        var moves = [];
        var key;
    
        // Standard moves
        for (let i = 0; i < 8; i++) {
    
            if (this.board.numSquaresToEdge[start][i] >= 1) {
                let target = start + this.board.directionOffsets[i];
                let pieceOnTarget = this.board.square[target];
        
                if (Game.isPieceColour(pieceOnTarget, this.board.colourToMove)) {
                    continue;
                }
        
                key = Game.encode(start, target)
                moves[key] = key;
            }
            
        }
    
        // Castling
        let pieceOnStart = this.board.square[start];
        if (!this.board.whiteInCheck) {
            if (this.board.canWhiteLeftCastle && Game.isPieceColour(pieceOnStart, Game.Piece.white)) {
                if (this.board.square[57] == Game.Piece.none && this.board.square[58] == Game.Piece.none && this.board.square[59] == Game.Piece.none) {
                    key = Game.encode(start, 56)
                    moves[key] = key;
                }
            }
            if (this.board.canWhiteRightCastle && Game.isPieceColour(pieceOnStart, Game.Piece.white)) {
                if (this.board.square[62] == Game.Piece.none && this.board.square[61] == Game.Piece.none) {
                    key = Game.encode(start, 63)
                    moves[key] = key;
                }
            }
        }
        
        if (!this.board.blackInCheck) {
            if (this.board.canBlackLeftCastle && Game.isPieceColour(pieceOnStart, Game.Piece.black)) {
                if (this.board.square[1] == Game.Piece.none && this.board.square[2] == Game.Piece.none && this.board.square[3] == Game.Piece.none) {
                    key = Game.encode(start, 0)
                    moves[key] = key;
                }
            }
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
        var moves = [];
        var offsets = [[2,1], [1,2], [-2,1], [1,-2], [2,-1], [-1,2], [-2,-1], [-1,-2]];
        
        for (let i = 0; i < 8; i++) {
            var xOffset = offsets[i][0];
            var yOffset = offsets[i][1];
            var x = Game.convert1dTo2d(start).x;
            var y = Game.convert1dTo2d(start).y;
    
            if (x + xOffset >= 0 && x + xOffset <= 7
                && y + yOffset >= 0 && y + yOffset <= 7) {
                    let target = start + Game.convert2dTo1d(xOffset, yOffset);
                    let pieceOnTarget = this.board.square[target];
    
                    if (Game.isPieceColour(pieceOnTarget, this.board.colourToMove)) {
                        continue;
                    }
    
                    let key = Game.encode(start, target)
                    moves[key] = key;
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
        var moves = [];
        var yOffset, initRank;
    
        if (this.board.colourToMove == Game.Piece.white) {
            yOffset = -8;
            initRank = 6;
        } else {
            yOffset = 8;
            initRank = 1;
        }
    
        // Standard move
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
        var moves = []
        var startDirIndex = (Game.isPieceType(piece, Game.Piece.bishop)) ? 4 : 0;
        var endDirIndex = (Game.isPieceType(piece, Game.Piece.rook)) ? 4 : 8;
    
        for (let directionIndex = startDirIndex; directionIndex < endDirIndex; directionIndex++) {
            for (let n = 0; n < this.board.numSquaresToEdge[start][directionIndex]; n++) {
                let target = start + this.board.directionOffsets[directionIndex] * (n+1);
                let pieceOnTarget = this.board.square[target];
    
                if (Game.isPieceColour(pieceOnTarget, this.board.colourToMove)) {
                    break;
                }
    
                let key = Game.encode(start, target)
                moves[key] = key;
    
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
     * @returns A Boolean indicating whether the move is legal
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
            var piece = this.board.square[start]
    
            // castling
            if (Game.isPieceType(this.board.square[target], Game.Piece.rook)
                && Game.isPieceColour(this.board.square[target], this.board.colourToMove)
                && (target == 0 || target == 7 || target == 56 || target == 63)) {
    
                    if (target == 0) {
                        this.board.square[0] = Game.Piece.none;
                        this.board.square[1] = Game.Piece.none;
                        this.board.square[2] = Game.Piece.king | Game.Piece.black;
                        this.board.square[3] = Game.Piece.rook | Game.Piece.black;
                        this.board.square[4] = Game.Piece.none;
                    } else if (target == 7) {
                        this.board.square[4] = Game.Piece.none;
                        this.board.square[5] = Game.Piece.rook | Game.Piece.black;
                        this.board.square[6] = Game.Piece.king | Game.Piece.black;
                        this.board.square[7] = Game.Piece.none;
                    } else if (target == 56) {
                        this.board.square[56] = Game.Piece.none;
                        this.board.square[57] = Game.Piece.none;
                        this.board.square[58] = Game.Piece.king | Game.Piece.white;
                        this.board.square[59] = Game.Piece.rook | Game.Piece.white;
                        this.board.square[60] = Game.Piece.none;
                    } else {
                        this.board.square[60] = Game.Piece.none;
                        this.board.square[61] = Game.Piece.rook | Game.Piece.white;
                        this.board.square[62] = Game.Piece.king | Game.Piece.white;
                        this.board.square[63] = Game.Piece.none;
                    }
                
            // not castling
            } else {
    
                this.board.square[target] = piece;
                this.board.square[start] = Game.Piece.none;
    
                // en passant capture
                if (target == this.board.enPassantSquare) {
                    if (Game.isPieceColour(piece, Game.Piece.white)) {
                        this.board.square[this.board.enPassantSquare + 8] = Game.Piece.none;
                    } else {
                        this.board.square[this.board.enPassantSquare - 8] = Game.Piece.none;
                    }
                }
    
                // promotion
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
    
            // update ability to en passant
            this.board.enPassantSquare = -1;
            if (Game.isPieceType(piece, Game.Piece.pawn) 
                && Math.abs(start - target) == 16) {
                    if (Game.isPieceColour(piece, Game.Piece.black) && Game.convert1dTo2d(start).y == 1) {
                        this.board.enPassantSquare = start + 8;
                    } else if (Game.isPieceColour(piece, Game.Piece.white) && Game.convert1dTo2d(start).y == 6) {
                        this.board.enPassantSquare = start - 8;
                    }
            }
    
            // update ability to castle
            if (Game.isPieceType(piece, Game.Piece.king)) { // move king
                if (Game.isPieceColour(piece, Game.Piece.white)) {
                    this.board.canWhiteLeftCastle = false;
                    this.board.canWhiteRightCastle = false;
                } else {
                    this.board.canBlackLeftCastle = false;
                    this.board.canBlackRightCastle = false;
                }
            }
            if (start == 0 || target == 0) { // move/take rook in corner (may activate again for non rook, but set to false, so doesn"t matter)
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
            
                // Check game state if actually made move
            } else {
    
                var validMoves = this.hasValidMoves();
    
                this.switchColour();
    
                var check = this.isInCheck();
    
                if (check && this.board.colourToMove == Game.Piece.white) {
                    this.board.whiteInCheck = true;
                }
    
                else if (check) {
                    this.board.blackInCheck = true;
                }
    
                // next player has no valid moves
                if (!validMoves) {
                    if (check) {
                        this.board.checkmate = true;
                        this.board.isGameFinished = true;
                        return this.madeMove(start, target);
                    } else {
                        this.board.stalemate = true;
                        this.board.isGameFinished = true;
                        return this.madeMove(start, target);
                    }
                }
    
                // threefold reptition
                var count = 1;
                var temp = this.board;
                while (temp.history) {
                    temp = temp.history;
    
                    if (Game.arrayEqual(this.board.square, temp.square)) {
                        count++;
                    }
    
                    if (count == 3) {
                        this.board.stalemate = true;
                        this.board.isGameFinished = true;
                        return this.madeMove(start, target);
                    }
                }
    
                // insufficient material (both sides have either of: lone king, king and knight, king and bishop)
                var whiteTotal = 0;
                var blackTotal = 0;
                var thereIsPawn = false;
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
     * Updates relevant variables (for when a move is made)
     * @param {number} start The index on the board that a sliding piece is to be moved from
     * @param {number} target The index on the board that a sliding piece is to be moved to
     * @returns True
     */
    madeMove(start, target) {
        this.board.movedFrom = start;
        this.board.movedTo = target;

        if (this.board.history) {
            let piece = this.board.history.square[target];
            let removePiece;

            let sameColourTaken;
            let otherColourTaken;

            if (!Game.isPieceType(piece, Game.Piece.none)) {

                if (Game.isPieceColour(piece, Game.Piece.white)) {
                    sameColourTaken = this.board.whitePiecesTaken;
                    otherColourTaken = this.board.blackPiecesTaken;
                } else {
                    sameColourTaken = this.board.blackPiecesTaken;
                    otherColourTaken = this.board.whitePiecesTaken;
                }

                otherColourTaken.every(p => {
                    if (Game.isSameType(piece, p)) {
                        removePiece = p;
                        return false;
                    }
                    return true;
                });

                if (removePiece) {
                    Game.arrayRemoveItemOnce(otherColourTaken, removePiece);
                } else {
                    sameColourTaken.push(piece);
                    sameColourTaken.sort((a,b) => b-a); // sort descending
                }

            }
        }

        return true;
    }
    
    /**
     * Returns whether the current player has valid moves to make
     * @returns A Boolean indicating whether there are valid moves
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
     * @returns A Boolean indicating whether the player is in check
     */
    isInCheck() {
    
        this.switchColour();
        var inCheck = false;
    
        for (let i = 0; i < 64; i++) {
    
            this.generateLegalMoves(i, false).every(move => {
                var target = Game.decode(move).target;
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
     * Updates variables for when the game has ended
     */
    endGame() {
        this.board.isGameFinished = true;
    }
}

module.exports = {
    Game
} 