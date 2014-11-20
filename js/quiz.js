/**
 * 
 *
 * Author: Philipp Jährling <info@philippjaehrling.de>
 */

function Quiz(playerCount, timerCallback) {
    this.topic          = "";
    this.players        = [];
    this.questions      = [];
    this.questionIndex  = 0;

    // attributes with default values
    this.questionTime   = 60;
    this.answerTime     = 30;
    this.pointsByAnswer = 1;

    // timer
    this.secondsLeft    = 0;
    this.runningTimer   = null;
    this.timerCallback  = timerCallback;
    
    // fill player
    for (var i = 0; i < playerCount; i++) {
        this.players.push(new Player());
    }
}

/******************************* QUESTION STUFF *******************************/
/**
 * ToDo: public
 */
Quiz.prototype.getQuestion = function() {
    if (typeof this.questions[this.questionIndex] !== 'undefined') {
        this.startTimer(this.questionTime);
        return this.questions[this.questionIndex];
    }
};

/**
 * ToDo: public
 */
Quiz.prototype.getPoints = function() {
    var res = [];
    for (var i = 0; i < this.players.length; i++) {
        res.push(this.players[i].score);
    }
    return res;
};

/**
 * ToDo: public
 */
Quiz.prototype.getTopic = function() {
    return this.topic;
};

/**
 * ToDo: private
 */
Quiz.prototype.setNextQuestion = function() {
    if ( this.questionIndex < (this.questions.length - 1) ) {
        /* The next line is not active to prevent answering a question multiple times */
        //this.questions[this.questionIndex].unlock();
        this.questionIndex++;

        // throw event to let the UI now, that it need to get new question
        document.dispatchEvent( new Event('newQuestion') );
    } else {
        clearTimeout(this.runningTimer);
        // throw event to let the UI now, that it need to get new question
        document.dispatchEvent( new Event('gameEnd' ));
    }
};

/**
 * ToDo: private
 */
Quiz.prototype.distributePointsToActivePlayer = function() {
    var data = {};
    for (var i = 0; i < this.players.length; i++) {
        if (this.players[i].isActive) {
            this.players[i].addPoints(1);
            this.players[i].setUnactive();
            break;
        }
    }
};

/**
 * ToDo: private
 */
Quiz.prototype.distributePointsToUnactiveGroup = function() {
    for (var i = 0; i < this.players.length; i++) {
        if (!this.players[i].isActive) {
            this.players[i].addPoints(1);
        } else {
            this.players[i].setUnactive();
        }
    }
};

/**
 * ToDo: public
 */
Quiz.prototype.solveQuestion = function(answerIndex, rightCB, wrongCB) {
    var q = this.questions[this.questionIndex];
    if ( q.isLocked ) {
        if ( q.answer(answerIndex) ) {
            // RIGHT answer -> points go to active player
            this.distributePointsToActivePlayer();
            //this.setNextQuestion();
            rightCB();
        } else {
            // WRONG answer -> points go to inactive rest of players
            this.distributePointsToUnactiveGroup();
            //this.setNextQuestion();
            wrongCB();
        }
        // no matter if wrong or right, it's time for the next question
        this.setNextQuestion();
    }
};

/**
* 
*/
Quiz.prototype.lockQuestion = function(playerIndex) {
    if ( !this.questions[this.questionIndex].isLocked ) {
        // lock question and set player as active
        this.questions[this.questionIndex].lock();
        this.players[playerIndex].setActive();
        
        // start timer with the amount of time configured for an answer
        this.startTimer(this.answerTime);
        return true;
    } else {
        return false;
    }
};

/******************************** TIMER STUFF *******************************/
/**
 * 
 */
Quiz.prototype.startTimer = function(seconds) {
    clearTimeout(this.runningTimer);
    this.secondsLeft = seconds;
    this.runTimer();
};

/**
 * 
 */
Quiz.prototype.runTimer = function() {
    if (this.secondsLeft >= 0) {

        this.runningTimer = setTimeout(function(){ this.runTimer(); }.bind(this), 1000 );
        this.timerCallback(this.secondsLeft);
        this.secondsLeft--;

    } else {

        // question was locked but timed out -> unactive players get points
        if ( this.questions[this.questionIndex].isLocked ) {
            this.distributePointsToUnactiveGroup();
            document.dispatchEvent( new Event('answerTimedOut') );
        } else {
            document.dispatchEvent( new Event('questionTimedOut') );
        }
        this.setNextQuestion();
    }
};


/******************************** INIT STUFF ********************************/
/**
 * validate mandatory fields
 */
Quiz.prototype.validateJSON = function(obj) {
    if ( typeof obj === 'undefined' ) {
        return false;
    }
    if ( typeof obj.topic !== 'string') {
        return false;
    }
    if ( typeof obj.questions === 'undefined' || !Array.isArray(obj.questions) ) {
        return false;
    }
    // check answer array
    for (var i = 0; i < obj.questions; i++) {
        if ( !obj.questions[i].hasOwnProperty('text') ) { return false; }
        if ( !obj.questions[i].hasOwnProperty('answers') ) { return false; }
        if ( !obj.questions[i].hasOwnProperty('correctIndex') ) { return false; }
        if ( !Array.isArray(obj.questions[i].answers) ) { return false; }
    }

    return true;
};

/**
 * load object attributes from jsonObject
 */
Quiz.prototype.loadQuestionsFromJSON = function(jsonObj) {
    if ( this.validateJSON(jsonObj) ) {
        this.topic = jsonObj.topic;

        // load question-array
        for (var i = 0; i < jsonObj.questions.length; i++) {
            var q = jsonObj.questions[i];
            this.questions.push( new Question(q.text, q.answers, q.correctIndex) );
        }

        // (try to) load optional fields
        if ( typeof jsonObj.questionTime !== 'undefined' && !isNaN(jsonObj.questionTime) ) {
            this.questionTime = jsonObj.questionTime;
        }
        if ( typeof jsonObj.answerTime !== 'undefined' && !isNaN(jsonObj.answerTime) ) {
            this.answerTime = jsonObj.answerTime;
        }
        if ( typeof jsonObj.pointsByAnswer !== 'undefined' && !isNaN(jsonObj.pointsByAnswer) ) {
            this.pointsByAnswer = jsonObj.pointsByAnswer;
        }
    } else {
        return false;
    }
};