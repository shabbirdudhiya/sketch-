////////////////////////////////////////////////////////////
// GAME v1.1
////////////////////////////////////////////////////////////

/*!
 * 
 * GAME SETTING CUSTOMIZATION START
 * 
 */

var sketchAnswers = ["NAMAZ","ZAKAT","HAJ","ASHARA","DEEDAR","MATAM","TAKHT","THAAL","THALI","BARAKAT","DUA","RIDA","TOPI","HAFTI","TASBEEH","MASALLA","MASJID","ZAREEH","MADINA","MISR"];

//board settings
var gameSettings = {
	totalRound:1, //total round to complete
	randomAnswer:true, //random answer
	keyboard:["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"], //keyboard
	keyWidth:60,
	keyHeight:60,
	keySpace:5,
	blankColor:"#91181D",
	correctColor:"#000",
	keyColor:"#91181D",
	keyDisabledColor:"#848484",
	keyFontSize:35,
	keyboardLayout:[
		["","","","","","","remove"],
		["","","","","","",""]
	],
	strokeNum:5,
	strokeColor:"#000",
	score:500,
	timer:60000
};

//game text display
var textDisplay = {
	startDraw:'START DRAWING',
	playerTurn:'[PLAYER] TURN',
	playerTurnIsDrawing:'Start drawing...',
	playerIsDrawing:'[PLAYER] is drawing...',
	playerScore:"[NUMBER]PTS",
	timer:"[NUMBER]sec",
	timeUp:'Time\'s Up',
	correct:'CORRECT!',
	playerCorrect:'[PLAYER] GOT IT RIGHT!',
	roundComplete:'ROUND COMPLETE!',
	exitTitle:'EXIT GAME',
	exitMessage:'Are you sure you want\nto quit game?',
	share:'Share your score:',
	resultTitle:'YOUR SCORE:',
	resultDesc:'[NUMBER]PTS',
}

//Social share, [SCORE] will replace with game score
var shareEnable = true; //toggle share
var shareTitle = 'Highscore on Guess the Sketch is [SCORE]pts';//social share score title
var shareMessage = '[SCORE]pts is mine new highscore on Guess the Sketch game! Try it now!'; //social share score message

/*!
 *
 * GAME SETTING CUSTOMIZATION END
 *
 */
$.editor = {enable:false};
var playerData = {score:0};
var gameData = {paused:true, seq:[], seqNum:0, round:0, answerNum:0, drawing:false, lineData:{x:0, y:0}, complete:false};
var timeData = {enable:false, startDate:null, nowDate:null, timer:0, oldTimer:0};
var tweenData = {score:0, tweenScore:0};

/*!
 * 
 * GAME BUTTONS - This is the function that runs to setup button event
 * 
 */
function buildGameButton(){
	if($.browser.mobile || isTablet){

	}else{
		var isInIframe = (window.location != window.parent.location) ? true : false;
		if(isInIframe){
			this.document.onkeydown = keydown;
			this.document.onkeyup = keyup;
		
			$(window).blur(function() {
				appendFocusFrame();
			});
			appendFocusFrame();
        }else{
            this.document.onkeydown = keydown;
			this.document.onkeyup = keyup;
        }
	}

	buttonStart.cursor = "pointer";
	buttonStart.addEventListener("click", function(evt) {
		playSound('soundButton');
		if ( typeof initSocket == 'function' && multiplayerSettings.enable) {
			checkQuickGameMode();
		}
	});
	
	itemExit.addEventListener("click", function(evt) {
	});
	
	buttonContinue.cursor = "pointer";
	buttonContinue.addEventListener("click", function(evt) {
		playSound('soundButton');
		goPage('main');
	});
	
	buttonFacebook.cursor = "pointer";
	buttonFacebook.addEventListener("click", function(evt) {
		share('facebook');
	});
	
	buttonTwitter.cursor = "pointer";
	buttonTwitter.addEventListener("click", function(evt) {
		share('twitter');
	});
	buttonWhatsapp.cursor = "pointer";
	buttonWhatsapp.addEventListener("click", function(evt) {
		share('whatsapp');
	});
	
	buttonSoundOff.cursor = "pointer";
	buttonSoundOff.addEventListener("click", function(evt) {
		toggleGameMute(true);
	});
	
	buttonSoundOn.cursor = "pointer";
	buttonSoundOn.addEventListener("click", function(evt) {
		toggleGameMute(false);
	});
	
	buttonFullscreen.cursor = "pointer";
	buttonFullscreen.addEventListener("click", function(evt) {
		toggleFullScreen();
	});
	
	buttonExit.cursor = "pointer";
	buttonExit.addEventListener("click", function(evt) {
		togglePop(true);
		toggleOption();
	});
	
	buttonSettings.cursor = "pointer";
	buttonSettings.addEventListener("click", function(evt) {
		toggleOption();
	});
	
	buttonConfirm.cursor = "pointer";
	buttonConfirm.addEventListener("click", function(evt) {
		playSound('soundButton');
		togglePop(false);
		
		stopAudio();
		stopGame();
		goPage('main');
		if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
			exitSocketRoom();
		}
	});
	
	buttonCancel.cursor = "pointer";
	buttonCancel.addEventListener("click", function(evt) {
		playSound('soundButton');
		togglePop(false);
	});

	for(var n=0; n<sketchAnswers.length; n++){
		gameData.seq.push(n);
	}
}

/*!
 * 
 * TOGGLE GAME TYPE - This is the function that runs to toggle game type
 * 
 */

function toggleMainButton(con){
	if ( typeof initSocket == 'function' && multiplayerSettings.enable) {
		gameLogsTxt.visible = true;
		gameLogsTxt.text = '';
	}

	buttonStart.visible = false;

	if(con == 'start'){
		buttonStart.visible = true;
	}
}

function checkQuickGameMode(){
	socketData.online = true;
	if(!multiplayerSettings.enterName){
		buttonStart.visible = false;
		addSocketRandomUser();
	}else{
		goPage('name');
	}
}

function resizeSocketLog(){
	if(curPage == 'main'){
		if(viewport.isLandscape){
			gameLogsTxt.x = canvasW/2;
			gameLogsTxt.y = canvasH/100 * 75;
		}else{
			gameLogsTxt.x = canvasW/2;
			gameLogsTxt.y = canvasH/100 * 75;
		}
	}else if(curPage == 'custom'){
		if(viewport.isLandscape){
			gameLogsTxt.x = canvasW/2;
			gameLogsTxt.y = canvasH/100 * 67;
		}else{
			gameLogsTxt.x = canvasW/2;
			gameLogsTxt.y = canvasH/100 * 65;
		}
	}
}

function appendFocusFrame(){
	$('#mainHolder').prepend('<div id="focus" style="position:absolute; width:100%; height:100%; z-index:1000;"></div');
	$('#focus').click(function(){
		$('#focus').remove();
	});	
}


/*!
 * 
 * KEYBOARD EVENTS - This is the function that runs for keyboard events
 * 
 */
function keydown(event) {
	var letter = String.fromCharCode(event.which);
	
	if(event.keyCode == 8){
		removeKeyboard();
	}else{
		matchKeyboard(letter.toUpperCase());
	}
}

function keyup(event) {

}

/*!
 * 
 * TOGGLE POP - This is the function that runs to toggle popup overlay
 * 
 */
function togglePop(con){
	confirmContainer.visible = con;
}


/*!
 * 
 * DISPLAY PAGES - This is the function that runs to display pages
 * 
 */
var curPage=''
function goPage(page){
	curPage=page;

	$('#roomWrapper').hide();
	$('#roomWrapper .innerContent').hide();
	gameLogsTxt.visible = false;
	
	mainContainer.visible = false;
	nameContainer.visible = false;
	roomContainer.visible = false;
	gameContainer.visible = false;
	resultContainer.visible = false;
	
	var targetContainer = null;
	switch(page){
		case 'main':
			targetContainer = mainContainer;
			toggleMainButton('start');
		break;

		case 'name':
			targetContainer = nameContainer;
			$('#roomWrapper').show();
			$('#roomWrapper .nameContent').show();
			$('#roomWrapper .fontNameError').html('');
			$('#enterName').show();
		break;
			
		case 'room':
			targetContainer = roomContainer;
			$('#roomWrapper').show();
			$('#roomWrapper .roomContent').show();
			switchSocketRoomContent('lists');
		break;
		
		case 'game':
			targetContainer = gameContainer;

			startGame();
		break;
		
		case 'result':
			targetContainer = resultContainer;
			stopGame();
			togglePop(false);
			
			playSound('soundResult');
			
			if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
				playerData.score = $.players['gamePlayerContainer'+ socketData.gameIndex].score;
				tweenData.score = 0;
				TweenMax.to(tweenData, .5, {tweenScore:playerData.score, overwrite:true, onUpdate:function(){
					resultDescTxt.text = textDisplay.resultDesc.replace('[NUMBER]', addCommas(Math.floor(tweenData.tweenScore)));
				}});
				
				if(socketData.host){
					postSocketCloseRoom();
				}

				saveGame(playerData.score);
			}
		break;
	}
	
	if(targetContainer != null){
		targetContainer.visible = true;
		targetContainer.alpha = 0;
		TweenMax.to(targetContainer, .5, {alpha:1, overwrite:true});
	}
	
	resizeCanvas();
}

/*!
 * 
 * START GAME - This is the function that runs to start game
 * 
 */
function startGame(){
	gameData.paused = false;
	gameData.answerNum = 0;
	gameData.seqNum = 0;
	gameData.round = 0;

	for(var n=0; n<4; n++){
		$.players['gamePlayerContainer'+ n].score = 0;
	}
	loadSketchAnswer();
}

 /*!
 * 
 * STOP GAME - This is the function that runs to stop play game
 * 
 */
 function stopGame(){
	gameData.paused = true;
	TweenMax.killAll(false, true, false);
}

function saveGame(score){
	if ( typeof toggleScoreboardSave == 'function' ) { 
		$.scoreData.score = score;
		if(typeof type != 'undefined'){
			$.scoreData.type = type;	
		}
		toggleScoreboardSave(true);
	}

	/*$.ajax({
      type: "POST",
      url: 'saveResults.php',
      data: {score:score},
      success: function (result) {
          console.log(result);
      }
    });*/
}

/*!
 * 
 * BUILD PLAYERS - This is the function that runs to build players
 * 
 */
function buildPlayers(){
	for(var n=0; n<4; n++){
		$.players['gameIconContainer'+ n].removeAllChildren();
	}
}

/*!
 * 
 * RESIZE GAME LAYOUT - This is the function that runs to resize layout
 * 
 */
function resizeGameLayout(){
	for(var n=0; n<4; n++){
		$.players['gamePlayerContainer'+ n].visible = false;
		if(n < gameData.players){
			$.players['gamePlayerContainer'+ n].visible = true;
		}
	}

	if(viewport.isLandscape){
		boardContainer.x = canvasW/2;
		boardContainer.y = canvasH/100 * 39;
		blankContainer.y = canvasH/100 * 25;
		keyContainer.y = canvasH/100 * 43;

		$.players['gamePlayerContainer'+ 0].x = canvasW/2 - 380;
		$.players['gamePlayerContainer'+ 1].x = canvasW/2 + 380;
		$.players['gamePlayerContainer'+ 2].x = canvasW/2 - 380;
		$.players['gamePlayerContainer'+ 3].x = canvasW/2 + 380;

		if(gameData.players <= 2){
			$.players['gamePlayerContainer'+ 0].y = canvasH/2 - 70;
			$.players['gamePlayerContainer'+ 1].y = canvasH/2 - 70;
		}else{
			$.players['gamePlayerContainer'+ 0].y = canvasH/2 - 70;
			$.players['gamePlayerContainer'+ 1].y = canvasH/2 - 70;
			$.players['gamePlayerContainer'+ 2].y = canvasH/2 + 70;
			$.players['gamePlayerContainer'+ 3].y = canvasH/2 + 70;
		}
	}else{
		boardContainer.x = canvasW/2;
		boardContainer.y = canvasH/100 * 30;
		blankContainer.y = canvasH/100 * 18;
		keyContainer.y = canvasH/100 * 59;

		if(gameData.players <= 2){
			keyContainer.y = canvasH/100 * 45;
		}

		$.players['gamePlayerContainer'+ 0].x = canvasW/2 - 120;
		$.players['gamePlayerContainer'+ 1].x = canvasW/2 + 120;
		$.players['gamePlayerContainer'+ 2].x = canvasW/2 - 120;
		$.players['gamePlayerContainer'+ 3].x = canvasW/2 + 120;

		$.players['gamePlayerContainer'+ 0].y = canvasH/100 * 57;
		$.players['gamePlayerContainer'+ 1].y = canvasH/100 * 57;
		$.players['gamePlayerContainer'+ 2].y = canvasH/100 * 70;
		$.players['gamePlayerContainer'+ 3].y = canvasH/100 * 70;
	}
}

/*!
 * 
 * LOAD SKETCH ANSWER - This is the function that runs to load answer
 * 
 */
function loadSketchAnswer(){
	blankContainer.removeAllChildren();
	keyContainer.removeAllChildren();

	boardDrawing.graphics.clear();
	gameStatusContainer.alpha = 0;
	playSound('soundStart');

	gameData.complete = false;
	gameData.answerNum = gameData.seq[gameData.seqNum];
	gameData.sketchAnswer = sketchAnswers[gameData.answerNum].toUpperCase();
	gameData.blanks = [];
	gameData.keyboard = [];
	gameData.letters = [];
	gameData.answers = [];
	console.log(gameData.sketchAnswer);

	for(var n=0; n<gameData.sketchAnswer.length; n++){
		var newButton = insertTextType("blank", gameData.sketchAnswer.substring(n, n+1));
		newButton.index = n;
		blankContainer.addChild(newButton);

		gameData.blanks.push(newButton);
		gameData.letters.push(gameData.sketchAnswer.substring(n, n+1));
	}

	shuffle(gameSettings.keyboard);
	gameData.letterNum = 0;
	for(var n=0; n<gameSettings.keyboardLayout.length; n++){
		for(var p=0; p<gameSettings.keyboardLayout[n].length; p++){
			if(gameSettings.keyboardLayout[n][p] != "remove"){
				gameData.letters.push(gameSettings.keyboard[gameData.letterNum]);
				gameData.letterNum++;
			}
		}
	}

	gameData.letters.length = gameData.letterNum;
	shuffle(gameData.letters);
	var letterCount = 0;
	var keyIndex = 0;
	for(var n=0; n<gameSettings.keyboardLayout.length; n++){
		for(var p=0; p<gameSettings.keyboardLayout[n].length; p++){
			var newButton;
			if(gameSettings.keyboardLayout[n][p] == "remove"){
				newButton = insertTextType("key", gameSettings.keyboardLayout[n][p]);
			}else{
				newButton = insertTextType("key", gameData.letters[letterCount]);
				letterCount++;
			}
			newButton.index = keyIndex;
			keyIndex++;
			keyContainer.addChild(newButton);
			gameData.keyboard.push(newButton);
		}
	}

	timeData.oldTimer = -1;
	timeData.countdown = gameSettings.timer;
	timerTxt.text = timerRedTxt.text = millisecondsToTimeGame(timeData.countdown);
	timerRedTxt.alpha = 0;

	positionLayout();
	resetPlayers();
}

/*!
 * 
 * DISPLAY PLAYER TURN - This is the function that runs to display player turn
 * 
 */
function displayPlayerTurn(){
	$.players['gameArrow'+ socketData.gameIndex].visible = true;
	focusPlayer(gameData.player);
	if(socketData.turn){
		disabledKeyboard();
		keyContainer.visible = false;
		drawStatusTxt.text = textDisplay.playerTurnIsDrawing;
		showGameStatus('startDraw');
		TweenMax.to(gameData, 3, {overwrite:true, onComplete:function(){
			setupStageEvents();	
			toggleGameTimer(true);
		}});
	}else{
		keyContainer.visible = true;
		drawStatusTxt.text = textDisplay.playerIsDrawing.replace("[PLAYER]", $.players['gamePlayer'+gameData.player].text);
		showGameStatus('playerTurn', gameData.player);
	}
}

function resetPlayers(){
	for(var n=0; n<4; n++){
		$.players['gamePlayerContainer'+ n].answers = [];
		$.players['gamePlayerContainer'+ n].scaleX = $.players['gamePlayerContainer'+ n].scaleY = 1;
		
		$.players['gamePlayerBgH'+ n].visible = false;
		$.players['gameArrow'+ n].visible = false;
		$.players['gamePlayer'+ n].color = '#91181D';
		$.players['gameScore'+ n].color = '#008C00';
		$.players['gameScore'+ n].alpha = 1;
		$.players['gameAnswers'+ n].removeAllChildren();
		$.players['gameScore'+ n].text = textDisplay.playerScore.replace("[NUMBER]", addCommas($.players['gamePlayerContainer'+ n].score));
	}
}

/*!
 * 
 * FOCUS PLAYER - This is the function that runs to focus player
 * 
 */
function focusPlayer(index){
	$.players['gamePlayerBgH'+ index].visible = true;
	$.players['gamePlayer'+ index].color = '#fff';
	$.players['gameScore'+ index].color = '#fff';

	$.players['gamePlayerContainer'+ index].scaleX = $.players['gamePlayerContainer'+ index].scaleY = .5;
	TweenMax.to($.players['gamePlayerContainer'+ index], 1, {scaleX:1, scaleY:1, ease:Elastic.easeOut, overwrite:true});
}

/*!
 * 
 * DISABLED KEYBOARD - This is the function that runs to disabled keyboard
 * 
 */
function disabledKeyboard(){
	for(var n=0; n<gameData.blanks.length; n++){
		gameData.blanks[n].text.text = gameData.sketchAnswer.substring(n,n+1);
		gameData.blanks[n].bgH.visible = true;
		gameData.blanks[n].text.color = gameSettings.correctColor;
	}

	for(var n=0; n<gameData.keyboard.length; n++){
		var thisKey = gameData.keyboard[n];
		thisKey.bgH.visible = true;
	}
}

/*!
 * 
 * FILL PLAYER ANSWER - This is the function that runs to full player answer
 * 
 */
function fillPlayerAnswer(index, answers, con){
	$.players['gameAnswers'+ index].removeAllChildren();
	var playerAnswers = [];
	for(var n=0; n<answers.length; n++){
		var newAnswer = insertTextType("blank", answers.substring(n,n+1));
		newAnswer.text.text = answers.substring(n,n+1);
		if(con){
			newAnswer.bgH.visible = true;
			newAnswer.text.color = gameSettings.correctColor;
		}
		playerAnswers.push(newAnswer);
		$.players['gameAnswers'+ index].addChild(newAnswer);
	}

	var pos = {x:0, y:0, w:0, h:0};
	pos.w = gameSettings.keyWidth * (playerAnswers.length-1);
	pos.w += gameSettings.keySpace * (playerAnswers.length-1);
	pos.x = -(pos.w/2);

	for(var n=0; n<playerAnswers.length; n++){
		var thisType = playerAnswers[n];
		thisType.x = pos.x;
		thisType.y = pos.y;
		pos.x += gameSettings.keyWidth + gameSettings.keySpace;
	}
}

/*!
 * 
 * ADD PLAYER SCORE - This is the function that runs to add player score
 * 
 */
function addPlayerScore(index, score){
	$.players['gameScore'+ index].text = "+" + textDisplay.playerScore.replace("[NUMBER]", addCommas(Math.floor(score)));
	$.players['gamePlayerContainer'+ index].score += score;

	$.players['gamePlayerContainer'+ index].scaleX = $.players['gamePlayerContainer'+ index].scaleY = .5;
	TweenMax.to($.players['gamePlayerContainer'+ index], 1, {scaleX:1, scaleY:1, ease:Elastic.easeOut, overwrite:true});
	
	var tweenSpeed = .5;
	var newScore = $.players['gamePlayerContainer'+ index].score;
	TweenMax.to($.players['gameScore'+ index], tweenSpeed, {alpha:0, overwrite:true, onComplete:function(){
		TweenMax.to($.players['gameScore'+ index], tweenSpeed, {alpha:1, overwrite:true, onComplete:function(){
			var playerScoreTween = {score:0};
			TweenMax.to(playerScoreTween, 1, {score:newScore, overwrite:true, onUpdate:function(){
				$.players['gameScore'+ index].text = textDisplay.playerScore.replace("[NUMBER]", addCommas(Math.floor(playerScoreTween.score)));
			}});
		}});
	}});
}

/*!
 * 
 * INSERT TEXT TYPE - This is the function that runs to insert text
 * 
 */
function insertTextType(type, text){
	var newType = new createjs.Container();
	var newBg,newBgH;
	var textColor = gameSettings.blankColor;

	if(type == "blank"){
		newBg = new createjs.Bitmap(loader.getResult('itemBlank'));
		centerReg(newBg);
		newBgH = new createjs.Bitmap(loader.getResult('itemCorrect'));
		centerReg(newBgH);
		text = "";
	}else{
		newBg = new createjs.Bitmap(loader.getResult('itemKey'));
		centerReg(newBg);
		newBgH = new createjs.Bitmap(loader.getResult('itemKeyDisabled'));
		centerReg(newBgH);

		newType.cursor = "pointer";
		newType.addEventListener("click", function(evt) {
			if(gameData.complete){
				return;
			}
			
			if(newType.bgH.visible == false){
				if(evt.currentTarget.keyType == "remove"){
					removeAnswer();
				}else{
					insertAnswer(evt.currentTarget.index);
				}
			}
		});
	}

	if(text == "remove"){
		newType.keyType = "remove";
		newBg = new createjs.Bitmap(loader.getResult('itemRemove'));
		centerReg(newBg);
		newBgH = new createjs.Bitmap(loader.getResult('itemRemove'));
		centerReg(newBgH);
		text = "";
	}
	newBgH.visible = false;

	var newText = new createjs.Text();
	newText.font = gameSettings.keyFontSize + "px bodo_amatregular";
	newText.color = textColor;
	newText.textAlign = "center";
	newText.textBaseline='alphabetic';
	newText.text = text;
	newText.y += 13;

	newType.bg = newBg;
	newType.bgH = newBgH;
	newType.text = newText;
	newType.addChild(newBg, newBgH, newText);
	return newType;
}

/*!
 * 
 * MATCH KEYBOARD - This is the function that runs to match keyboard
 * 
 */
function matchKeyboard(letter){
	if(gameData.paused){
		return;
	}

	if(gameData.complete){
		return;
	}

	var keyIndex = gameSettings.keyboard.indexOf(letter);
	if(keyIndex != -1){
		for(var n=0; n<gameData.keyboard.length; n++){
			var thisKey = gameData.keyboard[n];
			if(thisKey.bgH.visible == false && thisKey.text.text == letter.toUpperCase()){
				n = gameData.keyboard.length;
				insertAnswer(thisKey.index);
			}
		}
	}
}

function removeKeyboard(){
	if(gameData.paused){
		return;
	}

	if(gameData.complete){
		return;
	}

	removeAnswer();
}

/*!
 * 
 * POSITION LAYOUT - This is the function that runs to position layout
 * 
 */
function positionLayout(){
	//blank
	var pos = {x:0, y:0, w:0, h:0};
	pos.w = gameSettings.keyWidth * (gameData.blanks.length-1);
	pos.w += gameSettings.keySpace * (gameData.blanks.length-1);
	pos.x = -(pos.w/2);

	for(var n=0; n<gameData.blanks.length; n++){
		var thisType = gameData.blanks[n];
		thisType.x = pos.x;
		thisType.y = pos.y;
		pos.x += gameSettings.keyWidth + gameSettings.keySpace;
	}

	var pos = {x:0, y:0, w:0, h:0};
	pos.h = (gameSettings.keyHeight * gameSettings.keyboardLayout.length);
	pos.h = pos.h + (gameSettings.keySpace * (gameSettings.keyboardLayout.length - 1));
	pos.y = -(pos.h/2);

	var keyboardCount = 0;
	for(var n=0; n<gameSettings.keyboardLayout.length; n++){
		pos.w = gameSettings.keyWidth * (gameSettings.keyboardLayout[n].length-1);
		pos.w += gameSettings.keySpace * (gameSettings.keyboardLayout[n].length-1);
		pos.x = -(pos.w/2);
		
		for(var p=0; p<gameSettings.keyboardLayout[n].length; p++){
			var thisKey = gameData.keyboard[keyboardCount];
			thisKey.x = pos.x;
			thisKey.y = pos.y;
			pos.x += gameSettings.keyWidth + gameSettings.keySpace;
			keyboardCount++;
		}

		pos.y += gameSettings.keyHeight + gameSettings.keySpace;
	}
}

/*!
 * 
 * INSERT REMOVE ANSWER - This is the function that runs to insert answer
 * 
 */
function insertAnswer(index){
	if(gameData.answers.length < gameData.blanks.length){
		playSound("soundEnter");
		gameData.keyboard[index].visible = false;
		gameData.keyboard[index].bgH.visible = true;
		gameData.keyboard[index].text.color = gameSettings.keyDisabledColor;
		gameData.answers.push(index);
	}

	fillAnswers();
}

function removeAnswer(){
	if(gameData.answers.length > 0){
		playSound("soundKey");
		var lastIndex = gameData.answers.length-1;
		gameData.keyboard[gameData.answers[lastIndex]].visible = true;
		gameData.keyboard[gameData.answers[lastIndex]].bgH.visible = false;
		gameData.keyboard[gameData.answers[lastIndex]].text.color = gameSettings.keyColor;
		gameData.answers.splice(gameData.answers.length-1,1);
	}

	fillAnswers();
}

function fillAnswers(){
	var finalAnswer = "";
	for(var n=0; n<gameData.blanks.length; n++){
		gameData.blanks[n].text.text = "";

		if(n < gameData.answers.length){
			var answerIndex = gameData.answers[n];
			gameData.blanks[n].text.text = gameData.keyboard[answerIndex].text.text;
			finalAnswer += gameData.keyboard[answerIndex].text.text;
		}
	}
	
	if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
		postSocketUpdate('updateplayeranswer', {index:socketData.gameIndex, answers:finalAnswer});
	}
}

/*!
 * 
 * ANIMATE BOUNCE - This is the function that runs to animate answer bounce
 * 
 */
function animateBounce(obj, delay){
	TweenMax.to(obj, .2, {delay:delay, y:obj.oriY-20, overwrite:true, onComplete:function(){
		TweenMax.to(obj, 1, {y:obj.oriY, overwrite:true, ease: Elastic. easeOut.config( 1, 0.3)});
	}});
}


/*!
 * 
 * STAGE EVENTS - This is the function that runs to build stage events
 * 
 */
function setupStageEvents(){
	stage.addEventListener("mousedown", function(evt) {
		toggleStageEvent(evt, 'down')
	});
	
	stage.addEventListener("pressmove", function(evt) {
		toggleStageEvent(evt, 'move')
	});

	stage.addEventListener("pressup", function(evt) {
		toggleStageEvent(evt, 'release')
	});
}

function removeStageEvents(){
	stage.removeAllEventListeners("mousedown");
	stage.removeAllEventListeners("pressmove");
	stage.removeAllEventListeners("pressup");
}

/*!
 * 
 * TOGGLE STEGE EVENTS - This is the function that runs to toggle stage events
 * 
 */
function toggleStageEvent(obj, con){
	if(gameData.complete){
		return;
	}

	switch(con){
		case 'down':
			var startPos = drawContainer.globalToLocal(stage.mouseX, stage.mouseY);
			startDrawingLine(startPos.x, startPos.y);
			gameData.drawing = true;

			if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online && socketData.turn) {
				postSocketUpdate('startdrawingline', {x:startPos.x, y:startPos.y});
			}
		break;

		case 'move':
			if (gameData.drawing) {
				var movePos = drawContainer.globalToLocal(stage.mouseX, stage.mouseY);
				updateDrawingLine(movePos.x, movePos.y);

				if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online && socketData.turn) {
					postSocketUpdate('updatedrawingline', {x:movePos.x, y:movePos.y});
				}
			}
		break;
		
		case 'release':
			gameData.drawing = false;
		break;

		case 'out':
		break;
	}
}

function startDrawingLine(x,y){
	gameData.lineData.x = x;
	gameData.lineData.y = y;
}

function updateDrawingLine(x, y){
	boardDrawing.graphics.ss(gameSettings.strokeNum, "round").s(gameSettings.strokeColor);
	boardDrawing.graphics.mt(gameData.lineData.x, gameData.lineData.y);        
	boardDrawing.graphics.lt(x, y);
	
	gameData.lineData.x = x;
	gameData.lineData.y = y;
}


/*!
 * 
 * ANIMATE TIMER - This is the function that runs to animate countdown
 * 
 */
function animateTimer(){
	timerRedTxt.alpha = 0;
	TweenMax.to(timerRedTxt, .5, {alpha:1, overwrite:true});
}

/*!
 * 
 * GAME STATUS - This is the function that runs to show game status
 * 
 */
function showGameStatus(con, player){
	if(con == 'startDraw'){
		statusTxt.text = textDisplay.startDraw;
	}else if(con == 'playerTurn'){
		statusTxt.text = textDisplay.playerTurn.replace("[PLAYER]", $.players['gamePlayer'+player].text);
	}else if(con == 'timer'){
		statusTxt.text = textDisplay.timeUp;
	}else if(con == 'correct'){
		statusTxt.text = textDisplay.correct;
	}else if(con == 'playerCorrect'){
		statusTxt.text = textDisplay.playerCorrect.replace("[PLAYER]", $.players['gamePlayer'+player].text);
	}else if(con == 'complete'){
		statusTxt.text = textDisplay.roundComplete;
	}

	gameStatusContainer.alpha = 0;
	TweenMax.to(gameStatusContainer, .5, {alpha:1, overwrite:true, onComplete:function(){
		TweenMax.to(gameStatusContainer, .5, {delay:2, alpha:0, overwrite:true});
	}});
}

/*!
 * 
 * GAME TIMER - This is the function that runs for game timer
 * 
 */
function toggleGameTimer(con){	
	if(con){
		timeData.startDate = new Date();
	}else{
		
	}
	timeData.enable = con;
}

/*!
 * 
 * UPDATE GAME - This is the function that runs to loop game update
 * 
 */
function updateGame(){
	if(!gameData.paused){
		if(timeData.enable){
			timeData.nowDate = new Date();
			timeData.elapsedTime = Math.floor((timeData.nowDate.getTime() - timeData.startDate.getTime()));
			timeData.timer = Math.floor((timeData.countdown) - (timeData.elapsedTime));

			if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
				postSocketUpdate('updatetimer', timeData.timer);
			}else{
				updateTimer();
			}
		}
	}
}

function updateTimer(){
	if(timeData.oldTimer == -1){
		timeData.oldTimer = timeData.timer;
	}

	if(timeData.timer <= 0){
		//stop
		showGameStatus('timer');
		if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online && socketData.turn) {
			endRound();
			postSocketUpdate('updatecomplete', {answers:"", complete:false});
		}
	}else{
		if((timeData.oldTimer - timeData.timer) > 1000){
			if(timeData.timer < 1000){
				animateTimer()
				playSound('soundCountdownEnd');
			}else if(timeData.timer < 6000){
				animateTimer()
				playSound('soundCountdown');
			}
			timeData.oldTimer = timeData.timer;
		}
		
		timerTxt.text = timerRedTxt.text = millisecondsToTimeGame(timeData.timer);
	}
}

function endRound(){
	gameData.complete = true;
	removeStageEvents();
	toggleGameTimer(false);
}

/*!
 * 
 * ROUND COMPLETE - This is the function that runs for round complete
 * 
 */
function roundComplete(index, drawIndex){
	playSound('soundComplete');

	var finalScore = Math.floor(timeData.timer/timeData.countdown * gameSettings.score);
	addPlayerScore(index,finalScore);
	addPlayerScore(drawIndex,finalScore/2);
}

/*!
 * 
 * END GAME - This is the function that runs for game end
 * 
 */
function endGame(){
	gameData.paused = true;

	showGameStatus("complete");
	TweenMax.to(gameContainer, 4, {overwrite:true, onComplete:function(){
		goPage('result')
	}});
}

/*!
 * 
 * MILLISECONDS CONVERT - This is the function that runs to convert milliseconds to time
 * 
 */
function millisecondsToTimeGame(milli) {
	var milliseconds = milli % 1000;
	var seconds = Math.floor((milli / 1000) % 60);
	var minutes = Math.floor((milli / (60 * 1000)) % 60);
	
	if(seconds<10){
		seconds = '0'+seconds;  
	}
	
	if(minutes<10){
		minutes = '0'+minutes;  
	}
	
	return textDisplay.timer.replace("[NUMBER]", seconds);
}

/*!
 * 
 * OPTIONS - This is the function that runs to toggle options
 * 
 */

function toggleOption(){
	if(optionsContainer.visible){
		optionsContainer.visible = false;
	}else{
		optionsContainer.visible = true;
	}
}


/*!
 * 
 * OPTIONS - This is the function that runs to mute and fullscreen
 * 
 */
function toggleGameMute(con){
	buttonSoundOff.visible = false;
	buttonSoundOn.visible = false;
	toggleMute(con);
	if(con){
		buttonSoundOn.visible = true;
	}else{
		buttonSoundOff.visible = true;	
	}
}

function toggleFullScreen() {
  if (!document.fullscreenElement &&    // alternative standard method
      !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  // current working methods
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
      document.documentElement.msRequestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
}

/*!
 * 
 * SHARE - This is the function that runs to open share url
 * 
 */
function share(action){
	gtag('event','click',{'event_category':'share','event_label':action});
	
	var loc = location.href
	loc = loc.substring(0, loc.lastIndexOf("/") + 1);
	
	var title = '';
	var text = '';
	
	title = shareTitle.replace("[SCORE]", addCommas(playerData.score));
	text = shareMessage.replace("[SCORE]", addCommas(playerData.score));
	
	var shareurl = '';
	
	if( action == 'twitter' ) {
		shareurl = 'https://twitter.com/intent/tweet?url='+loc+'&text='+text;
	}else if( action == 'facebook' ){
		shareurl = 'https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(loc+'share.php?desc='+text+'&title='+title+'&url='+loc+'&thumb='+loc+'share.jpg&width=590&height=300');
	}else if( action == 'google' ){
		shareurl = 'https://plus.google.com/share?url='+loc;
	}else if( action == 'whatsapp' ){
		shareurl = "whatsapp://send?text=" + encodeURIComponent(text) + " - " + encodeURIComponent(loc);
	}
	
	window.open(shareurl);
}