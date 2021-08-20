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
    declinedRequest;
    disconnected;
    resigned;
    won;
    lost;
    stalemate;

    constructor(number) {
        this.number = number;
        this.colour = undefined;
        this.score = 0;
        this.opponentJoined = false;
        this.rematchRequestRecieved = false;
        this.takebackRequestRecieved = false;
        this.drawRequestRecieved = false;
        this.rematchRequestSent = false;
        this.takebackRequestSent = false;
        this.drawRequestSent = false;
        this.declinedRequest = false;
        this.disconnected = false;
        this.resigned = false;
        this.won = false;
        this.lost = false;
        this.stalemate = false;
    }

    selectBooleanFlag(flag) {
        this.rematchRequestRecieved = false;
        this.takebackRequestRecieved = false;
        this.drawRequestRecieved = false;
        this.rematchRequestSent = false;
        this.takebackRequestSent = false;
        this.drawRequestSent = false;
        this.declinedRequest = false;
        this.disconnected = false;
        this.resigned = false;
        this.won = false;
        this.lost = false;
        this.stalemate = false;
    
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
            case "declinedRequest":
                this.declinedRequest = true;
                break;
            case "disconnected":
                this.disconnected = true;
                break;
            case "resigned":
                this.resigned = true;
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
        }
    }
}

module.exports = {
    Player
}
