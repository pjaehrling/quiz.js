/**
 * 
 *
 * Author: Philipp Jährling <info@philippjaehrling.de>
 */

function Player() {
    this.score    = 0;
    this.isActive = false;
}

/**
 * Add <increase> amount of points to the players score
 */
Player.prototype.addPoints = function(increase) {
    this.score += increase;
};

/**
 * 
 */
 Player.prototype.setActive = function() {
    this.isActive = true;
 };

 /**
 * 
 */
 Player.prototype.setUnactive = function() {
    this.isActive = false;
 };