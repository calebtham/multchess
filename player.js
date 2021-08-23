class Player {
    number;
    colour;
    score;
    opponentJoined;
    rematchRequestRecieved;
    takebackRequestRecieved;
    drawRequestRecieved;
    rematchRequestSent;
    takebackRequestSent;
    drawRequestSent;
    requestDeclined;
    opponentDisconnected;
    opponentResigned;
    won;
    lost;
    stalemate;
    opponentTimedOut;
    timedOut;
    timeLeft;
    timeLastMoved;

    constructor(number, timer) {
        this.number = number;
        this.timeLeft = timer * 60;
        this.timeLastMoved = undefined;
        this.colour = undefined;
        this.score = 0;
        this.opponentJoined = false;
        this.rematchRequestRecieved = false;
        this.takebackRequestRecieved = false;
        this.drawRequestRecieved = false;
        this.rematchRequestSent = false;
        this.takebackRequestSent = false;
        this.drawRequestSent = false;
        this.requestDeclined = false;
        this.opponentDisconnected = false;
        this.opponentResigned = false;
        this.won = false;
        this.lost = false;
        this.stalemate = false;
        this.opponentTimedOut = false;
        this.timedOut = false;
    }

    selectBooleanFlag(flag) {
        this.rematchRequestRecieved = false;
        this.takebackRequestRecieved = false;
        this.drawRequestRecieved = false;
        this.rematchRequestSent = false;
        this.takebackRequestSent = false;
        this.drawRequestSent = false;
        this.requestDeclined = false;
        this.opponentDisconnected = false;
        this.opponentResigned = false;
        this.won = false;
        this.lost = false;
        this.stalemate = false;
        this.opponentTimedOut = false;
        this.timedOut = false;
    
        switch (flag) {
            case "rematchRequestSent":
                this.rematchRequestSent = true;
                break;
            case "takebackRequestSent":
                this.takebackRequestSent = true;
                break;
            case "drawRequestSent":
                this.drawRequestSent = true;
                break;
            case "rematchRequestRecieved":
                this.rematchRequestRecieved = true;
                break;
            case "takebackRequestRecieved":
                this.takebackRequestRecieved = true;
                break;
            case "drawRequestRecieved":
                this.drawRequestRecieved = true;
                break;
            case "requestDeclined":
                this.requestDeclined = true;
                break;
            case "opponentDisconnected":
                this.opponentDisconnected = true;
                break;
            case "opponentResigned":
                this.opponentResigned = true;
                break;
            case "won":
                this.won = true;
                break;
            case "lost":
                this.lost = true;
                break;
            case "stalemate":
                this.stalemate = true;
                break;
            case "opponentTimedOut":
                this.opponentTimedOut = true;
                break;
            case "timedOut":
                this.timedOut = true;
                break;
        }
    }
}

module.exports = {
    Player
}
