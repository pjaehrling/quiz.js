$(function() {
    var playerCount = 0,
        quiz = new Quiz( 4, function(sec) { $('#time').html(sec); } );
        
    /**
     *
     */
    function showQuestion() {
        var question = quiz.getQuestion();
        $('#questionText').html(question.text);
        $('#answer1').html("A) " + question.answers[0]);
        $('#answer2').html("B) " + question.answers[1]);
        $('#answer3').html("C) " + question.answers[2]);
        $('#answer4').html("D) " + question.answers[3]);
        $('.blocked').removeClass('blocked');
        $('.answer').addClass('blocked');
    }

    /**
     *
     */
    function initQuiz() {
        $.getJSON('/quiz.js/js/questions/example.json')
        .done( function(json) {
            quiz.loadQuestionsFromJSON(json);
            $('#topic').html(quiz.getTopic());
            showQuestion();
        })
        .fail( function(jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            console.log( 'Request Failed: ' + err );
        });
    }

    /**
     *
     */
    function showOverlay(ms, content, cssClass, callback) {
        var div = $('#overlay');

        console.log(cssClass);
        div.find('span').html(content).removeClass().addClass(cssClass);
        div.show(0);

        if (ms > 0) {
            setTimeout(function(){
                div.hide(0, callback);
                div.find('span').removeClass(cssClass);
            }, ms);
        }
    }

    /**
     *
     */
    function updatePlayerScores() {
        var scores = quiz.getPoints(),
            playerDivs = $('.player');

        $.each(playerDivs, function(key, value) {
            $(this).find('span').html( scores[$(this).data('index')] );
        });
    }

    /**
     *
     */
    function registerEvents() {
        $('.player').on('touchstart click', function() {
            var playerIndex = ($(this).data("index"));
            if ( quiz.lockQuestion(playerIndex) ) {
                $('.blocked').removeClass('blocked');
                $('.player').addClass('blocked');
                $(this).removeClass('blocked');
            }
        });

        $('.answer').on('touchstart click', function() {
            var answerIndex = ( $(this).data("index") );

            quiz.solveQuestion(answerIndex, function() {
                var overlayContent = "Right!";
                showOverlay(2000, overlayContent, "green", function() {
                    updatePlayerScores();
                    showQuestion();
                });
            }, function() {
                var overlayContent = "Wrong!";
                showOverlay(2000, overlayContent, "red", function() {
                    updatePlayerScores();
                    showQuestion();
                });
            });
        });

        document.addEventListener('newQuestion', function () {
            showQuestion();
        });

        document.addEventListener('answerTimedOut', function () {
            showOverlay(1000, "Time is over!", "red", function() {
                updatePlayerScores();
                showQuestion();
            });
        });

        document.addEventListener('questionTimedOut', function () {
            showOverlay(1000, "Time is over", "red", function() {
                showQuestion();
            });
        });

        document.addEventListener('gameEnd', function () {
            var scores = quiz.getPoints(),
                highScore = 0,
                highScoreIndex = [],
                playerDivs = $('.player');

            $(playerDivs).off();
            $('.hideUnactive').hide('slow');

            // Find player index of highest score
            for (var i = 0; i < scores.length; i++) {
                if (scores[i] > highScore) {
                    highScore       = scores[i];
                    highScoreIndex  = [i];
                } else if (scores[i] === highScore) {
                    highScoreIndex.push(i);
                }
            }

            for (var j = 0; j < highScoreIndex.length; j++) {
                $(playerDivs).filter('[data-index=' + highScoreIndex[j] + ']').html( "Winner!!" );
            }
        });
    }

    /**
     * Start
     */
    registerEvents();
    initQuiz();
});