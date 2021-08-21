/**
 * Functions and constants used for game mechanics
 * @author Caleb Tham
 */

// numSquaresToEdge[x][y] gives the number of squares there are from the square with the board index x in the direction of y
// values of y: 0=north, 1=south, 2=west, 3=east, 4=north-west, 5=south-east, 6=north-east, 7=south-west
const numSquaresToEdge = [[0,7,0,7,0,7,0,0],[0,7,1,6,0,6,0,1],[0,7,2,5,0,5,0,2],[0,7,3,4,0,4,0,3],[0,7,4,3,0,3,0,4],[0,7,5,2,0,2,0,5],[0,7,6,1,0,1,0,6],[0,7,7,0,0,0,0,7],[1,6,0,7,0,6,1,0],[1,6,1,6,1,6,1,1],[1,6,2,5,1,5,1,2],[1,6,3,4,1,4,1,3],[1,6,4,3,1,3,1,4],[1,6,5,2,1,2,1,5],[1,6,6,1,1,1,1,6],[1,6,7,0,1,0,0,6],[2,5,0,7,0,5,2,0],[2,5,1,6,1,5,2,1],[2,5,2,5,2,5,2,2],[2,5,3,4,2,4,2,3],[2,5,4,3,2,3,2,4],[2,5,5,2,2,2,2,5],[2,5,6,1,2,1,1,5],[2,5,7,0,2,0,0,5],[3,4,0,7,0,4,3,0],[3,4,1,6,1,4,3,1],[3,4,2,5,2,4,3,2],[3,4,3,4,3,4,3,3],[3,4,4,3,3,3,3,4],[3,4,5,2,3,2,2,4],[3,4,6,1,3,1,1,4],[3,4,7,0,3,0,0,4],[4,3,0,7,0,3,4,0],[4,3,1,6,1,3,4,1],[4,3,2,5,2,3,4,2],[4,3,3,4,3,3,4,3],[4,3,4,3,4,3,3,3],[4,3,5,2,4,2,2,3],[4,3,6,1,4,1,1,3],[4,3,7,0,4,0,0,3],[5,2,0,7,0,2,5,0],[5,2,1,6,1,2,5,1],[5,2,2,5,2,2,5,2],[5,2,3,4,3,2,4,2],[5,2,4,3,4,2,3,2],[5,2,5,2,5,2,2,2],[5,2,6,1,5,1,1,2],[5,2,7,0,5,0,0,2],[6,1,0,7,0,1,6,0],[6,1,1,6,1,1,6,1],[6,1,2,5,2,1,5,1],[6,1,3,4,3,1,4,1],[6,1,4,3,4,1,3,1],[6,1,5,2,5,1,2,1],[6,1,6,1,6,1,1,1],[6,1,7,0,6,0,0,1],[7,0,0,7,0,0,7,0],[7,0,1,6,1,0,6,0],[7,0,2,5,2,0,5,0],[7,0,3,4,3,0,4,0],[7,0,4,3,4,0,3,0],[7,0,5,2,5,0,2,0],[7,0,6,1,6,0,1,0],[7,0,7,0,7,0,0,0]];

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

// i.e. is piece a bishop, rook, queen
function isPieceSliding(p) {
    var pieceNoColour = p & 7;
    return pieceNoColour == 4
        || pieceNoColour == 5
        || pieceNoColour == 6;
} 

function isPieceColour(p, col) {
    var pieceNoType = p & 24;
    return pieceNoType == col;
}

function isPieceType(p, type) {
    var pieceNoColour = p & 7;
    return pieceNoColour == type;
}

/**
 * Switches the colour that is to make a move next
 */
function switchColour() {
    board.colourToMove ^= 24; 
}

/**
 * Returns an associative array of all legal moves that can be currently made on the board
 * @param {boolean} isCheckingCheck Boolean indicating whether the function should make checks for 
 * check
 * @returns An associative array of the moves
 */
function generateAllLegalMoves(isCheckingCheck = false) {
    var moves = []
    for (let i = 0; i < 64; i++) {
        generateLegalMoves(i, isCheckingCheck).forEach(move => {
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
function generateLegalMoves(start, isCheckingCheck = false) {
    var moves = []
    var piece = board.square[start];
    if (isPieceColour(piece, board.colourToMove)) {

        if (isPieceSliding(piece)) {
            generateSlidingMoves(start, piece, isCheckingCheck).forEach(code => {
                var move = decode(code);
                if (!isCheckingCheck || makeMove(move.start, move.target, true)) {
                    moves[code] = code;
                }
            });

        } else if (isPieceType(piece, Piece.king)) {
            generateKingMoves(start, isCheckingCheck).forEach(code => {
                var move = decode(code);
                if (!isCheckingCheck || makeMove(move.start, move.target, true)) {
                    moves[code] = code;
                }
            });
        
        } else if (isPieceType(piece, Piece.knight)) {
            generateKnightMoves(start, isCheckingCheck).forEach(code => {
                var move = decode(code);
                if (!isCheckingCheck || makeMove(move.start, move.target, true)) {
                    moves[code] = code;
                }
            });
        
        } else if (isPieceType(piece, Piece.pawn)) {
            generatePawnMoves(start, isCheckingCheck).forEach(code => {
                var move = decode(code);
                if (!isCheckingCheck || makeMove(move.start, move.target, true)) {
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
function generateKingMoves(start) {
    var moves = []
    var key;

    // Standard moves
    for (let i = 0; i < 8; i++) {

        if (numSquaresToEdge[start][i] >= 1) {
            let target = start + board.directionOffsets[i];
            let pieceOnTarget = board.square[target];
    
            if (isPieceColour(pieceOnTarget, board.colourToMove)) {
                continue;
            }
    
            key = encode(start, target)
            moves[key] = key;
        }
        
    }

    // Castling
    let pieceOnStart = board.square[start];
    if (!board.whiteInCheck) {
        if (board.canWhiteLeftCastle && isPieceColour(pieceOnStart, Piece.white)) {
            if (board.square[57] == Piece.none && board.square[58] == Piece.none && board.square[59] == Piece.none) {
                key = encode(start, 56)
                moves[key] = key;
            }
        }
        if (board.canWhiteRightCastle && isPieceColour(pieceOnStart, Piece.white)) {
            if (board.square[62] == Piece.none && board.square[61] == Piece.none) {
                key = encode(start, 63)
                moves[key] = key;
            }
        }
    }
    
    if (!board.blackInCheck) {
        if (board.canBlackLeftCastle && isPieceColour(pieceOnStart, Piece.black)) {
            if (board.square[1] == Piece.none && board.square[2] == Piece.none && board.square[3] == Piece.none) {
                key = encode(start, 0)
                moves[key] = key;
            }
        }
        if (board.canBlackRightCastle && isPieceColour(pieceOnStart, Piece.black)) {
            if (board.square[5] == Piece.none && board.square[6] == Piece.none) {
                key = encode(start, 7)
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
function generateKnightMoves(start) {
    var moves = [];
    var offsets = [[2,1], [1,2], [-2,1], [1,-2], [2,-1], [-1,2], [-2,-1], [-1,-2]];
    
    for (let i = 0; i < 8; i++) {
        var xOffset = offsets[i][0];
        var yOffset = offsets[i][1];
        var x = convert1dTo2d(start).x;
        var y = convert1dTo2d(start).y;

        if (x + xOffset >= 0 && x + xOffset <= 7
            && y + yOffset >= 0 && y + yOffset <= 7) {
                let target = start + convert2dTo1d(xOffset, yOffset);
                let pieceOnTarget = board.square[target];
                let key;

                if (isPieceColour(pieceOnTarget, board.colourToMove)) {
                    continue;
                }

                key = encode(start, target)
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
function generatePawnMoves(start) {
    var moves = [];
    var yOffset, initRank;

    if (board.colourToMove == Piece.white) {
        yOffset = -8;
        initRank = 6;
    } else {
        yOffset = 8;
        initRank = 1;
    }

    // Standard move
    let target = start + yOffset;
    let pieceOnTarget = board.square[target];
    let key;

    if (isPieceType(pieceOnTarget, Piece.none)) {
        key = encode(start, target)
        moves[key] = key;
    }

    // West capture (including en passant)
    target -= 1;
    pieceOnTarget = board.square[target];

    if (numSquaresToEdge[start][2] >= 1 
        && ((!isPieceType(pieceOnTarget, Piece.none) 
        && !isPieceColour(pieceOnTarget, board.colourToMove)) 
        || board.enPassantSquare == target)) {
            key = encode(start, target)
            moves[key] = key;
    }

    // East capture (including en passant)
    target += 2;
    pieceOnTarget = board.square[target];

    if (numSquaresToEdge[start][3] >= 1 
        && ((!isPieceType(pieceOnTarget, Piece.none) 
        && !isPieceColour(pieceOnTarget, board.colourToMove))
        || board.enPassantSquare == target)) {
            key = encode(start, target)
            moves[key] = key;
    }

    // Double move
    if (convert1dTo2d(start).y == initRank) {
        target = start + yOffset * 2;
        pieceOnTarget = board.square[target];

        if (isPieceType(pieceOnTarget, Piece.none) && isPieceType(board.square[target - yOffset], Piece.none)) {
            key = encode(start, target)
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
function generateSlidingMoves(start, piece) {
    var moves = []
    var startDirIndex = (isPieceType(piece, Piece.bishop)) ? 4 : 0;
    var endDirIndex = (isPieceType(piece, Piece.rook)) ? 4 : 8;

    for (let directionIndex = startDirIndex; directionIndex < endDirIndex; directionIndex++) {
        for (let n = 0; n < numSquaresToEdge[start][directionIndex]; n++) {
            let target = start + board.directionOffsets[directionIndex] * (n+1);
            let pieceOnTarget = board.square[target];
            let key;

            if (isPieceColour(pieceOnTarget, board.colourToMove)) {
                break;
            }

            key = encode(start, target)
            moves[key] = key;

            if (!isPieceType(pieceOnTarget, Piece.none) && !isPieceColour(pieceOnTarget, board.colourToMove)) {
                break;
            }
        }
    }
    return moves
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
function makeMove(start, target, isGeneratingMoves = false) {

    // If called for purpose of generating moves or checked it is a valid move
    if (isGeneratingMoves || generateLegalMoves(start, false)[encode(start,target)]) {

        // UPDATE HISTORY
        board.history = JSON.parse(JSON.stringify(board));

        // MAKE MOVE
        var piece = board.square[start]

        // castling
        if (isPieceType(board.square[target], Piece.rook)
            && isPieceColour(board.square[target], board.colourToMove)
            && (target == 0 || target == 7 || target == 56 || target == 63)) {

                if (target == 0) {
                    board.square[0] = Piece.none;
                    board.square[1] = Piece.none;
                    board.square[2] = Piece.king | Piece.black;
                    board.square[3] = Piece.rook | Piece.black;
                    board.square[4] = Piece.none;
                } else if (target == 7) {
                    board.square[4] = Piece.none;
                    board.square[5] = Piece.rook | Piece.black;
                    board.square[6] = Piece.king | Piece.black;
                    board.square[7] = Piece.none;
                } else if (target == 56) {
                    board.square[56] = Piece.none;
                    board.square[57] = Piece.none;
                    board.square[58] = Piece.king | Piece.white;
                    board.square[59] = Piece.rook | Piece.white;
                    board.square[60] = Piece.none;
                } else {
                    board.square[60] = Piece.none;
                    board.square[61] = Piece.rook | Piece.white;
                    board.square[62] = Piece.king | Piece.white;
                    board.square[63] = Piece.none;
                }
            
        // not castling
        } else {

            board.square[target] = piece;
            board.square[start] = Piece.none;

            // en passant capture
            if (target == board.enPassantSquare) {
                if (isPieceColour(piece, Piece.white)) {
                    board.square[board.enPassantSquare + 8] = Piece.none;
                } else {
                    board.square[board.enPassantSquare - 8] = Piece.none;
                }
            }

            // promotion
            if (isPieceType(piece, Piece.pawn)) {
                if (isPieceColour(piece, Piece.white)) {
                    if (convert1dTo2d(target).y == 0) {
                        board.square[target] = Piece.queen | Piece.white;
                    }
                } else {
                    if (convert1dTo2d(target).y == 7) {
                        board.square[target] = Piece.queen | Piece.black;
                    }
                }
            }

        }        

        // UPDATE VARIABLES

        // update ability to en passant
        board.enPassantSquare = -1;
        if (isPieceType(piece, Piece.pawn) 
            && Math.abs(start - target) == 16) {
                if (isPieceColour(piece, Piece.black) && convert1dTo2d(start).y == 1) {
                    board.enPassantSquare = start + 8;
                } else if (isPieceColour(piece, Piece.white) && convert1dTo2d(start).y == 6) {
                    board.enPassantSquare = start - 8;
                }
        }

        // update ability to castle
        if (isPieceType(piece, Piece.king)) { // move king
            if (isPieceColour(piece, Piece.white)) {
                board.canWhiteLeftCastle = false;
                board.canWhiteRightCastle = false;
            } else {
                board.canBlackLeftCastle = false;
                board.canBlackRightCastle = false;
            }
        }
        if (start == 0 || target == 0) { // move/take rook in corner (may activate again for non rook, but set to false, so doesn"t matter)
            board.canBlackLeftCastle = false;
        } else if (start == 7 || target == 7) {
            board.canBlackRightCastle = false;
        } else if (start == 56 || target == 56) {
            board.canWhiteLeftCastle = false;
        } else if (start == 63 || target == 63) {
            board.canWhiteRightCastle = false;
        }

        // DEALING WITH CHECK

        // Initialise check boolean
        board.whiteInCheck = false;
        board.blackInCheck = false;
        
        // Check moving into check
        if (isInCheck()) {
            undoMove()
            return false;
        }

        // Undo move made if generating moves
        if (isGeneratingMoves) {
            undoMove();
        
            // Check game state if actually made move
        } else {

            var validMoves = hasValidMoves();

            switchColour();

            var check = isInCheck();

            if (check && board.colourToMove == Piece.white) {
                board.whiteInCheck = true;
            }

            else if (check) {
                board.blackInCheck = true;
            }

            // next player has no valid moves
            if (!validMoves) {
                if (check) {
                    board.isGameFinished = true;
                    return true;
                } else {
                    board.isGameFinished = true;
                    return true;
                }
            }

            // threefold reptition
            var count = 1;
            var temp = board;
            while (temp.history) {
                temp = temp.history;

                if (arrayEqual(board.square, temp.square)) {
                    count++;
                }

                if (count == 3) {
                    board.isGameFinished = true;
                    return true;
                }
            }

            // insufficient material (both sides have either of: lone king, king and knight, king and bishop)
            var whiteTotal = 0;
            var blackTotal = 0;
            var thereIsPawn = false;
            for (let i=0; i<64; i++) {
                if (!isPieceType(board.square[i], Piece.pawn)) {
                    if (isPieceColour(board.square[i], Piece.white)) {
                        whiteTotal += board.square[i] & 7;
                        if (whiteTotal > 5) { 
                            break;
                        }

                    } else if (isPieceColour(board.square[i], Piece.black)) {
                        blackTotal += board.square[i] & 7;
                        if (blackTotal > 5) { 
                            break;
                        }
                    }
                } else if (!isPieceType(board.square[i], Piece.none)) {
                    thereIsPawn = true;
                    break;
                }
            }

            if (!thereIsPawn && whiteTotal <= 5 && blackTotal <= 5) {
                board.isGameFinished = true;
                return true;
            }
        }

        return true;
    }
    
    return false;
}

/**
 * Returns whether the current player has valid moves to make
 * @returns A Boolean indicating whether there are valid moves
 */
function hasValidMoves() {

    switchColour();

    for (let i = 0; i < 64; i++) {
        if (generateLegalMoves(i, true).length > 0) {
            switchColour();
            return true;
        }
    }

    switchColour();
    return false;
}

/**
 * Returns whether the current player is in check
 * @returns A Boolean indicating whether the player is in check
 */
function isInCheck() {

    switchColour();
    var inCheck = false;

    for (let i = 0; i < 64; i++) {

        generateLegalMoves(i, false).every(move => {
            var target = decode(move).target;
            if (isPieceType(board.square[target], Piece.king)) {
                inCheck = true;
                return false;
            }
            return true;
        });
        
        if (inCheck) {
            switchColour();
            return true
        }
    }

    switchColour();
    return false;
}

/**
 * Function to undo the last move made
 */
function undoMove() {
    if (board.history) {
        board = board.history;
        board.hiddenSquare = -1;
        board.inHand = Piece.none;
        board.isLegalMove = new Array(64).fill(false);
        board.movedTo = -1;
        board.movedFrom = -1;
    }
}

/**
 * Gets the key for the associative array of valid moves given the start and end indices on board
 * @param {number} start Board index of starting square of move
 * @param {number} end Board index of target square of move
 * @returns The key for the associative array of valid moves
 */
function encode(start, end) {
    return start * 100 + end;
}

/**
 * Given a key used in the associative array of valid moves, returns the start and target square
 * indices represented by the key/code
 * @param {number} code Key used in the associative array of valid moves
 * @returns The start and target square indices represented by the code
 */
function decode(code) {
    var start = Math.floor(code / 100)
    return {"start": start,
            "target": code - start*100};
}

/**
 * Given a board index, returns the corresponding x and y coordinates for that square
 * @param {number} i The board index
 * @returns The x and y coordinate
 */
function convert1dTo2d(i) {
    return {"x": i % 8,
            "y": Math.floor(i / 8)}
}

/**
 * Given an x and y coordinate, returns the corresponding board index
 * @param {number} x The x coordinate
 * @param {number} y The y coordinate
 * @returns The board index
 */
function convert2dTo1d(x,y) {
    return x + y*8;
}