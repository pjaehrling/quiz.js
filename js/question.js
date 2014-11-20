/**
 * 
 *
 * Author: Philipp Jährling <info@philippjaehrling.de>
 */

function Question(text, answers, correctIndex) {
    this.text          = text;
    this.answers       = answers;
    this.correctIndex  = correctIndex;
    this.isLocked      = false;
}

/**
 * 
 */
Question.prototype.answer = function(index) {
    if ( this.isLocked ) {
        return (index === this.correctIndex) ? true : false;
    } else {
        return false;
    }
};

/**
 * 
 */
Question.prototype.lock = function() {
    if ( this.isLocked ) {
        return false;
    } else {
        this.isLocked = true;
        return true;
    }
};

/**
 * 
 */
Question.prototype.unlock = function() {
    if ( this.isLocked ) {
        this.isLocked = false;
        return true;
    } else {
        return false;
    }
};