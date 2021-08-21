/**
 * @author Caleb Tham
 */

const io = require("socket.io")(process.env.PORT || 3000, {
    cors: {
        origin: "*",
    }
});

const { Game } = require("./game.js");
const { Player } = require("./player.js");
const { makeid } = require("./utils.js");

const state = {};
const clientRooms = {};
const blacklistedRooms = {};

io.on("connection", client => {
    
    client.on("newGame", handleNewGame);
    client.on("joinGame", handleJoinGame);
    client.on("moveMade", handleMoveMade);
    client.on("rematchRequest", handleRematchRequest);
    client.on("rematchAccept", handleRematchAccept);
    client.on("drawRequest", handleDrawRequest);
    client.on("drawAccept", handleDrawAccept);
    client.on("takebackRequest", handleTakebackRequest);
    client.on("takebackAccept", handleTakebackAccept);
    client.on("decline", handleDecline);
    client.on("resign", handleResign);
    client.on("disconnect", handleDisconnect);
    
    function handleDisconnect() {
        var roomName = clientRooms[client.id];
        
        if (roomName) {
            let room = io.sockets.adapter.rooms.get(roomName);

            // if one player left, notify player
            if (room) {
                blacklistedRooms[roomName] = true;
    
                state[roomName].game.endGame();
                state[roomName][3 - client.player.number].selectBooleanFlag("opponentDisconnected");
                emitState(roomName);
    
                // room destroyed automatically when all clients leave - just remove room from blacklist
            } else {
                blacklistedRooms[roomName] = undefined;
            }
        }

    }

    function handleNewGame() {
        let roomName;
        while (!roomName || io.sockets.adapter.rooms.get(roomName)) {
            roomName = makeid(5);
        }

        initRoomState(roomName);
        initClient(roomName, 1);
    }

    function initRoomState(roomName) {
        state[roomName] = {}
        state[roomName].game = new Game();
        state[roomName][1] = new Player(1);
        state[roomName][2] = new Player(2);
    }

    function initClient(roomName, playerNumber) {
        clientRooms[client.id] = roomName;
        client.join(roomName);
        
        if (playerNumber == 1) {
            client.player = state[roomName][1];
        } else {
            client.player = state[roomName][2];
        }

        if (playerNumber == state[roomName].game.board.startingPlayer) {
            state[roomName][playerNumber].colour = Game.Piece.white;
            state[roomName][3 - playerNumber].colour = Game.Piece.black;
        } else {
            state[roomName][playerNumber].colour = Game.Piece.black;
            state[roomName][3 - playerNumber].colour = Game.Piece.white;
        }

        client.emit("init", roomName, state[roomName], playerNumber);
    }

    function handleJoinGame(roomName) {
        if (blacklistedRooms[roomName]) {
            client.emit("tooManyPlayers");
            return;
        }

        let room = io.sockets.adapter.rooms.get(roomName);

        if (room) {
            if (room.size === 0) {
                client.emit("unknownGame");
                return;
            } else if (room.size > 1) {
                client.emit("tooManyPlayers");
                return;
            }
        } else {
            client.emit("unknownGame");
            return;
        }

        initClient(roomName, 2);

        state[roomName][1].opponentJoined = true;
        state[roomName][2].opponentJoined = true;

        emitAll(roomName, "opponentJoined"); 
        emitState(roomName); 
    }

    function handleMoveMade(nextBoard) {
        var roomName = clientRooms[client.id];

        if (roomName) {
            var initBoard = state[roomName].game.board; 
            var valid = false;
    
            var move = Game.getStartAndTarget(initBoard, nextBoard); // Checks there is a potential move to get from init board to next board and returns the move if so
    
            if (!initBoard.isGameFinished && move) {
                if (state[roomName].game.makeMove(move.start, move.target)) { 
                    valid = true;
    
                    if (state[roomName].game.board.checkmate) {
                        checkmate(roomName);
                    } else if (state[roomName].game.board.stalemate) {
                        draw(roomName);
                    }
                } 
            }
    
            emitState(roomName);
            return valid;
        }
        
    }

    function checkmate(roomName) {
        state[roomName][client.player.number].score++;
        state[roomName][client.player.number].selectBooleanFlag("won");
        state[roomName][3 - client.player.number].selectBooleanFlag("lost");

        state[roomName].game.endGame();
        emitState(roomName);
    }

    function handleResign() {
        var roomName = clientRooms[client.id];

        if (roomName) {
            state[roomName][3 - client.player.number].selectBooleanFlag("opponentResigned");
            state[roomName][3 - client.player.number].score++;
            state[roomName][client.player.number].selectBooleanFlag("lost");
    
            state[roomName].game.endGame();
            emitState(roomName); 
        }
        
    }

    function handleRematchRequest() {
        var roomName = clientRooms[client.id];

        if (roomName) {
            state[roomName][client.player.number].selectBooleanFlag("rematchRequestSent")
            state[roomName][3 - client.player.number].selectBooleanFlag("rematchRequestRecieved");
            emitState(roomName);
        }
        
    }

    function handleRematchAccept() {
        var roomName = clientRooms[client.id];

        if (roomName && state[roomName][3 - client.player.number].rematchRequestSent) { // Check opponent actually requested this
            var startingPlayer = (state[roomName].game.board.startingPlayer == 1) ? 2 : 1; //switch starting player
            state[roomName].game = new Game();
            state[roomName].game.board.startingPlayer = startingPlayer;

            var temp = state[roomName][1].colour;
            state[roomName][1].colour = state[roomName][2].colour;
            state[roomName][2].colour = temp;

            state[roomName][1].selectBooleanFlag("none");
            state[roomName][2].selectBooleanFlag("none");

            emitState(roomName);
        }
        
    }

    function handleDrawRequest() {
        var roomName = clientRooms[client.id];

        if (roomName) {
            state[roomName][client.player.number].selectBooleanFlag("drawRequestSent");
            state[roomName][3 - client.player.number].selectBooleanFlag("drawRequestRecieved");
            emitState(roomName);
        }
        
    }

    function handleDrawAccept() {
        var roomName = clientRooms[client.id];

        if (roomName && state[roomName][3 - client.player.number].drawRequestSent) { // Check opponent actually requested this
            draw(roomName);
        }
    }

    function draw(roomName) {
        state[roomName][client.player.number].score++;
        state[roomName][3 - client.player.number].score++;

        state[roomName][client.player.number].selectBooleanFlag("stalemate");
        state[roomName][3 - client.player.number].selectBooleanFlag("stalemate");

        state[roomName].game.endGame();
        emitState(roomName);
    }

    function handleTakebackRequest() {
        var roomName = clientRooms[client.id];

        if (roomName) {
            state[roomName][client.player.number].selectBooleanFlag("takebackRequestSent");
            state[roomName][3 - client.player.number].selectBooleanFlag("takebackRequestRecieved");
            emitState(roomName);
        }
        
    }

    function handleTakebackAccept() {
        var roomName = clientRooms[client.id];

        if (roomName && state[roomName][3 - client.player.number].takebackRequestSent) { // Check opponent actually requested this
            state[roomName][1].selectBooleanFlag("none");
            state[roomName][2].selectBooleanFlag("none");

            state[roomName].game.serviceTakeback(state[roomName][client.player.number].colour);
            emitState(roomName);
        }
    }

    function handleDecline() {
        var roomName = clientRooms[client.id];

        if (roomName) {
            state[roomName][client.player.number].selectBooleanFlag("decline");
            state[roomName][3 - client.player.number].selectBooleanFlag("requestDeclined");
            emitState(roomName) 
        }
        
    }

    function forEachClientIn(roomName, func) {
        for (const clientId of io.sockets.adapter.rooms.get(roomName)) {
            const clientSocket = io.sockets.sockets.get(clientId);
            
            func(clientSocket);
        }
    }
    
    function emitOpponent(roomName, event, data1, data2) {
        forEachClientIn(roomName, function(c) {
            if (c.id != client.id) {
                c.emit(event, data1, data2);
            }
        })
    }
    
    function emitAll(roomName, event, data) {
        io.sockets.in(roomName).emit(event, data);
    }
    
    function emitState(roomName) {
        client.emit("gameState", state[roomName], client.player.number);
        emitOpponent(roomName, "gameState", state[roomName], 3 - client.player.number);
    }

});