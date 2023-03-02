///////////////////////////////////////////////////////////
// SOCKET CUSTOM
////////////////////////////////////////////////////////////
function startSocketGame(){
	postSocketUpdate('init');
}

function updateSocketGame(status, data, time){
	if(multiplayerSettings.game == 'guessthesketch'){
		if(status == 'init'){
			toggleSocketLoader(false);
			socketData.socketGameLogs = [];
			gameLogsTxt.text = '';
			if(data[0].index == socketData.index){
				socketData.host = true;
			}
	
			for(var n=0; n<data.length; n++){
				if(data[n].index == socketData.index){
					socketData.gameIndex = n;
					if(!multiplayerSettings.enterName){
						showSocketNotification(textMultiplayerDisplay.playerNotification.replace('[USER]', data[n].username));
					}
				}
				$.players['gamePlayer'+ n].text = data[n].username;
			}
			gameData.players = data.length;

			if(socketData.host){
				if(gameSettings.randomAnswer){
					shuffle(gameData.seq);
				}
				postSocketUpdate('prepare', gameData.seq);
				postSocketUpdate('start');
			}
		}else if(status == 'prepare'){
			gameData.seq = data;
		}else if(status == 'start'){
			toggleSocketLoader(false);
			goPage('game');
			
			socketData.turn = false;
			if(socketData.gameIndex == 0){
				socketData.turn = true;
			}

			gameData.player = 0;
			displayPlayerTurn();
		}else if(status == 'updatetimer'){
			timeData.timer = data;
			updateTimer();
		}else if(status == 'startdrawingline'){
			if(!socketData.turn){
				startDrawingLine(data.x, data.y);
			}
		}else if(status == 'updatedrawingline'){
			if(!socketData.turn){
				updateDrawingLine(data.x, data.y);
			}
		}else if(status == 'updateplayeranswer'){
			if(socketData.gameIndex != data.index){
				fillPlayerAnswer(data.index, data.answers, false);
			}

			if(socketData.turn){
				if(data.answers == gameData.sketchAnswer && !gameData.complete){
					endRound();
					postSocketUpdate('updatecomplete', {index:data.index, turnIndex:socketData.gameIndex, answers:gameData.sketchAnswer, complete:true});
				}
			}
		}else if(status == 'updatecomplete'){
			gameData.complete = true;
			if(data.complete){
				if(socketData.gameIndex == data.index){
					showGameStatus('correct');
					for(var n=0; n<gameData.blanks.length; n++){
						gameData.blanks[n].oriY = gameData.blanks[n].y;
						gameData.blanks[n].bgH.visible = true;
						gameData.blanks[n].text.color = gameSettings.correctColor;
						animateBounce(gameData.blanks[n], n*.2);
					}
				}else{
					fillPlayerAnswer(data.index, data.answers, true);
					showGameStatus('playerCorrect', data.index);
				}
				roundComplete(data.index, data.turnIndex);
			}

			var nextDraw = false;
			gameData.player++;
			if(gameData.player >= gameData.players){
				gameData.round++;
				gameData.player = 0;
				if(gameData.round < gameSettings.totalRound){
					nextDraw = true;
				}
			}else{
				nextDraw = true;
			}

			if(nextDraw){
				socketData.turn = false;
				gameData.seqNum++;
				if(gameData.seqNum > gameData.seq.length){
					gameData.seqNum = 0;
					if(gameSettings.randomAnswer){
						shuffle(gameData.seq);
					}
				}

				if(gameData.player == socketData.gameIndex){
					socketData.turn = true;
				}

				TweenMax.to(gameData, 3, {overwrite:true, onComplete:function(){
					loadSketchAnswer();
					displayPlayerTurn();
				}});
			}else{
				endGame();
			}
		}
	}
	
	if(multiplayerSettings.game == 'bingobash'){
		if(status == 'init'){
			toggleSocketLoader(false);
			socketData.socketGameLogs = [];
			gameLogsTxt.text = '';
			if(data[0].index == socketData.index){
				socketData.host = true;
			}

			for(var n=0; n<data.length; n++){
				if(data[n].index == socketData.index){
					socketData.gameIndex = n;
					if(!multiplayerSettings.enterName){
						showSocketNotification(textMultiplayerDisplay.playerNotification.replace('[USER]', data[n].username));
					}
				}
			}
			
			postSocketUpdate('start');
		}else if(status == 'start'){
			createPlayerCard();
			goPage('game');
		}else if(status == 'ready'){
			socketData.players = data;
			startGame();
		}else if(status == 'revealnumbers'){
			socketData.players = data.users;
			gameData.numbers_arr = data.numbers;
			startGame();
		}else if(status == 'dropballs'){
			if(!socketData.host){
				dropBalls();
			}
		}else if(status == 'revealballs'){
			if(!socketData.host){
				revealBall();
			}
		}else if(status == 'updateusernumbers'){
			socketData.players = data;
			checkOtherPlayersNumber();
		}else if(status == 'bingo'){
			socketData.winners = data;
			checkOtherPlayersBingo();
		}else if(status == 'nowinner'){
			endGame();
		}
	}

	if(multiplayerSettings.game == 'spotthedifferences'){
		if(status == 'init'){
			toggleSocketLoader(false);
			socketData.socketGameLogs = [];
			gameLogsTxt.text = '';
			if(data[0].index == socketData.index){
				socketData.host = true;
			}
			
			socketData.players = [];
			for(var n=0; n<data.length; n++){
				if(data[n].index == socketData.index){
					socketData.gameIndex = n;
					if(!multiplayerSettings.enterName){
						showSocketNotification(textMultiplayerDisplay.playerNotification.replace('[USER]', data[n].username));
					}
				}
				$.players['gamePlayer'+ n].text = data[n].username;
				socketData.players.push({index:data[n].index, flipComplete:false})
			}
			gameData.players = data.length;
			postSocketUpdate('type');
		}else if(status == 'type'){
			if(socketData.host){
				if(gameMode.status){
					toggleMainButton("select");
				}else{
					if(gameMode.mode){
						gameData.mode = "quick";
						shufflePuzzle();
						postSocketUpdate('start', {mode:gameData.mode, seq:gameData.seq});
					}else{
						gameData.mode = "select";
						postSocketUpdate('level', gameData.mode);
					}
				}
			}else{
				gameLogsTxt.visible = true;
				toggleSocketLoader(true, textMultiplayerDisplay.waitingHost);
			}
		}else if(status == 'level'){
			goPage("level");
			selectPage(1);
			if(!socketData.host){
				gameLogsTxt.visible = true;
				toggleSocketLoader(true, textMultiplayerDisplay.waitingHost);
			}
		}else if(status == 'updatelevel'){
			selectPage(data);
		}else if(status == 'updatethumb'){
			selectBoardThumbs(data);
		}else if(status == 'start'){
			toggleSocketLoader(false);
			gameData.mode = data.mode;
			gameData.seq = data.seq;
			goPage('game');
			
			$.players['gamePlayer'+ socketData.gameIndex].text = textMultiplayerDisplay.playerIndicator;
		}else if(status == 'updatetimer'){
			if(!socketData.host){
				timeData.timer = data;
				updateStats();
			}
		}else if(status == 'wrong'){
			playerData.wrong = data.wrong;
			playerData.opponentWrong = data.opponentWrong;
			updateStats();
		}else if(status == 'timerup'){
			if(!socketData.host){
				displayGameStatus('timer');
			}
		}else if(status == 'spot'){
			updateHiddenSpot(data.spot, data.index);
			if(data.index == 0){
				playerData.found++;
			}else{
				playerData.opponentFound++;
			}
			updateStats();
		}
	}

	if(multiplayerSettings.game == 'snakesandladders'){
		if(status == 'init'){
			toggleSocketLoader(false);
			socketData.socketGamelogs = [];
			gameLogsTxt.text = '';
			if(data[0].index == socketData.index){
				socketData.host = true;
			}
	
			for(var n=0; n<data.length; n++){
				if(data[n].index == socketData.index){
					socketData.gameIndex = n;
					if(!multiplayerSettings.enterName){
						showSocketNotification(textMultiplayerDisplay.playerNotification.replace('[USER]', data[n].username));
					}
				}
			}
			gameData.players = data.length;
			postSocketUpdate('level');
		}else if(status == 'level'){
			goPage('level');
			selectBoardThumbs(0);
			selectPage(1);
			if(!socketData.host){
				gameLogsTxt.visible = true;
				toggleSocketLoader(true, textMultiplayerDisplay.waitingHost);
			}
		}else if(status == 'updatelevel'){
			selectPage(data);
		}else if(status == 'updatethumb'){
			selectBoardThumbs(data);
		}else if(status == 'start'){
			toggleSocketLoader(false);
			socketData.turn = false;
			if(data.index == socketData.index){
				socketData.turn = true;
				updateGameSocketLog(time + textMultiplayerDisplay.youStart);
				playerTurnTxt.text = textMultiplayerDisplay.youStart;
			}else{
				updateGameSocketLog(time + textMultiplayerDisplay.playerStart.replace('[USER]',data.username));
				playerTurnTxt.text = textMultiplayerDisplay.playerStart.replace('[USER]',data.username);
			}
			goPage('game');
			gameData.player = data.turn;
			prepareArrow();
		}else if(status == 'dice'){
			gameData.diceNum = data;
			diceAnimate.gotoAndStop(gameData.diceNum);
		}else if(status == 'roll'){
			animateDice();
		}else if(status == 'rollcomplete'){
			gameData.diceNum = data;
			updateAnimateDiceComplete();
		}else if(status == 'movecomplete'){
			socketData.turn = false;
			socketData.winner = data.username;
			if(data.index == socketData.index){
				socketData.turn = true;
				updateGameSocketLog(time + textMultiplayerDisplay.yourTurn);
				playerTurnTxt.text = textMultiplayerDisplay.yourTurn;
			}else{
				updateGameSocketLog(time + textMultiplayerDisplay.playerTurn.replace('[USER]',data.username));
				playerTurnTxt.text = textMultiplayerDisplay.playerTurn.replace('[USER]',data.username);
			}
			gameData.player = data.turn;
			prepareArrow();
		}
	}

	if(multiplayerSettings.game == 'quizgamevs'){
		if(status == 'init'){
			toggleSocketLoader(false);
			socketData.socketGamelogs = [];
			if(typeof gameLogsTxt != 'undefined'){
				gameLogsTxt.text = '';
			}
			if(data[0].index == socketData.index){
				socketData.host = true;
			}
			for(var n=0; n<data.length; n++){
				if(data[n].index == socketData.index){
					socketData.gameIndex = n;
					if(!multiplayerSettings.enterName){
						showSocketNotification(textMultiplayerDisplay.playerNotification.replace('[USER]', data[n].username));
					}
				}
				$('#player'+(n+1)).val(data[n].username);
			}
			totalPlayerData.total = data.length;
			buildGamePlayers();
			postSocketUpdate('mode');
		}else if(status == 'mode'){
			goPage('mode');
			$('.fontLogText').html('');
			if(!socketData.host){
				toggleSocketLoader(true, textMultiplayerDisplay.waitingHost);
			}
		}else if(status == 'grid'){
			toggleSocketLoader(false);
			gameData.type = 'grid';
			goPage('game');
		}else if(status == 'buildGridStyle'){
			playerData.gridCategory_arr = data;
			buildGridStyle();
			toggleGridStyle(true);
		}else if(status == 'focusGridStyle'){
			focusGridStyle($('#'+data));
		}else if(status == 'updateCounter'){
			playerData.chance = data.chance;
			playerData.updateChance = data.updateChance;
			playerData.index = data.index;
			updateCounter();
		}else if(status == 'updateCounterComplete'){
			$('#gridStyleHolder .fontGridStatus').html(gameTextDisplay.selectCategory);
			highlightPlayer();
		}else if(status == 'category'){
			toggleSocketLoader(false);
			gameData.type = data.type;
			categoryData.page = 1;
			goPage('category');

			$('.fontLogText').html('');
			if(!socketData.host){
				toggleSocketLoader(true, textMultiplayerDisplay.waitingHost);
			}
		}else if(status == 'updatecategorylevel'){
			categoryData.page = data.page;
			categoryData.level = data.level;
			categoryData.breadcrumb = data.breadcrumb;

			buildCategory();
			resizeGameDetail();
		}else if(status == 'updatecategory'){
			categoryData.page = data.page;
			categoryData.level = data.level;
			categoryData.breadcrumb = data.breadcrumb;

			displayCategory();
		}else if(status == 'start'){
			toggleSocketLoader(false);
			goPage('game');
		}else if(status == 'sequence'){
			gameData.sequence_arr = data;
		}else if(status == 'loadquestion'){
			loadQuestion();
		}else if(status == 'loadQuestionReady'){
			if(socketData.host){
				socketData.loaded++;
				if(socketData.loaded >= totalPlayerData.total){
					if(fileFest.length > 0){
						socketData.loaded = 0;
						postSocketUpdate('loadQuestionAssets', {quesLandscapeSequence_arr:quesLandscapeSequence_arr, audioLandscape_arr:audioLandscape_arr});
					}else{
						postSocketUpdate('buildQuestion', {quesLandscapeSequence_arr:quesLandscapeSequence_arr, audioLandscape_arr:audioLandscape_arr});
					}
				}
			}
		}else if(status == 'loadQuestionAssets'){
			quesLandscapeSequence_arr = data.quesLandscapeSequence_arr;
			quesPortraitSequence_arr = data.quesLandscapeSequence_arr;
			audioLandscape_arr = data.audioLandscape_arr;
			audioPortrait_arr = data.audioLandscape_arr;
			loadQuestionAssets();
		}else if(status == 'loadQuestionAssetsComplete'){
			if(socketData.host){
				socketData.loaded++;
				if(socketData.loaded >= totalPlayerData.total){
					postSocketUpdate('buildQuestion', {quesLandscapeSequence_arr:quesLandscapeSequence_arr, audioLandscape_arr:audioLandscape_arr});
				}
			}
		}else if(status == 'buildQuestion'){
			quesLandscapeSequence_arr = data.quesLandscapeSequence_arr;
			quesPortraitSequence_arr = data.quesLandscapeSequence_arr;
			audioLandscape_arr = data.audioLandscape_arr;
			audioPortrait_arr = data.audioLandscape_arr;
			buildQuestion();
		}else if(status == 'updatetimer'){
			timeData.timer = data;
			$('.gameTimer').show();
			updateTimerDisplay();
		}else if(status == 'actionGamePlayer'){
			actionGamePlayer(data);
		}else if(status == 'focusTapAnswer'){
			focusTapAnswer(data.id, data.type, data.submit, data.hide);
		}else if(status == 'updateGroupID'){
			updateGroupID($('#'+data.groupDrop), $('#'+data.groupDrag), data.con);
			setGroupPosition();
		}else if(status == 'groupDragStop'){
			setGroupPosition();
			revertPosition($('#'+data));
		}else if(status == 'groupDragDrop'){
			updateGroupID($(data.groupDrop), $('#'+data.groupDrag), data.con);
			revertPosition($('#'+data.groupDrag));
		}else if(status == 'dragStart'){
			if($('#'+data.drag).hasClass('occupied')){
				if(dragDropSettings.droppedAnswerAgain){
					$('#'+data.drag).removeClass('occupied');
					playerData.correctAnswer.splice(1,0);
					
					var currentID = $('#'+data.drag).attr('id');
					$('.drop').each(function(index, element) {
						if($('#'+data.drag).attr('data-drag-id') == currentID){
							$('#'+data.drag).attr('data-drag-id', '');	
						}
					});
				}else{
					return false;
				}
			}else{
				setDragIndex($('#'+data.drag));	
			}
			setDragIndex($('#'+data.drag));
		}else if(status == 'dragStop'){
			revertPosition($('#'+data.drag));
		}else if(status == 'dropDrop'){
			if($('#'+data.drop).hasClass('occupied')){
				if($('#'+data.drop).attr('data-drag-id') != ''){
					var lastDrag = $('#'+$('#'+data.drop).attr('data-drag-id'));
					lastDrag.removeClass('occupied');
					revertPosition(lastDrag);
				}
			}else{
				playerData.correctAnswer.push(0);
			}
			
			$('#'+data.drag).addClass('occupied');
			$('#'+data.drag).attr('data-top-drop', $('#'+data.drop).attr('data-top'));
			$('#'+data.drag).attr('data-left-drop', $('#'+data.drop).attr('data-left'));
			
			$('#'+data.drop).attr('data-drag-id', data.drag);
			$('#'+data.drop).addClass('occupied');
		}else if(status == 'checkInputAnswer'){
			$('#inputHolder input').each(function(index, element) {
				$(this).val(data[index]);
			});
			checkInputAnswer();
		}else if(status == 'prepareNextQuestion'){
			TweenMax.killAll();
			stopVideoPlayer(true);
			$('#questionHolder').hide();
			$('#questionResultHolder').show();
			$('#questionResultHolder').css('opacity',0);
			
			prepareNextQuestion();
		}
	}

	if(multiplayerSettings.game == 'tictactoe'){
		if(status == 'init'){
			toggleSocketLoader(false);
			socketData.socketGameLogs = [];
			gameLogsTxt.text = '';
			if(data[0].index == socketData.index){
				socketData.host = true;
			}
	
			for(var n=0; n<data.length; n++){
				if(data[n].index == socketData.index){
					socketData.gameIndex = n;
					if(!multiplayerSettings.enterName){
						showSocketNotification(textMultiplayerDisplay.playerNotification.replace('[USER]', data[n].username));
					}
				}
				$.players['gamePlayer'+ n].text = data[n].username;
			}
			gameData.players = data.length;
			postSocketUpdate('custom');
		}else if(status == 'custom'){
			gameData.custom.size = customSettings.sizeMin;
			gameData.custom.win = customSettings.winMin;
			goPage('custom');
			if(!socketData.host){
				gameLogsTxt.visible = true;
				toggleSocketLoader(true, textMultiplayerDisplay.waitingHost);
			}
		}else if(status == 'updatecustom'){
			gameData.custom.size = data.size;
			gameData.custom.win = data.win;
			checkCustomSettings();
		}else if(status == 'players'){
			goPage('players');
			if(!socketData.host){
				gameLogsTxt.visible = true;
				toggleSocketLoader(true, textMultiplayerDisplay.waitingHost);
			}
		}else if(status == 'updateplayers'){
			gameData.icon = data.icon;
			gameData.switch = data.switch;
			gameData.icons = data.icons;
			displayPlayerIcon();
		}else if(status == 'start'){
			toggleSocketLoader(false);
			goPage('game');
			
			socketData.turn = false;
			if(data.index == socketData.index){
				socketData.turn = true;
				updateGameSocketLog(time + textMultiplayerDisplay.youStart);
				gameData.player = socketData.host == true ? 0 : 1;
			}else{
				updateGameSocketLog(time + textMultiplayerDisplay.playerStart.replace('[USER]',data.username));
				gameData.player = socketData.host == true ? 1 : 0;
			}
			
			displayPlayerTurn();
		}else if(status == 'updatetimer'){
			timeData.timer = data;
			updateTimer();
		}else if(status == 'updateicon'){
			placeIcon(data.row, data.column, data.player);
		}else if(status == 'updatemovecomplete'){
			socketData.turn = false;
			if(data.index == socketData.index){
				socketData.turn = true;
				updateGameSocketLog(time + textMultiplayerDisplay.yourTurn);
				gameData.player = socketData.host == true ? 0 : 1;
			}else{
				updateGameSocketLog(time + textMultiplayerDisplay.playerTurn.replace('[USER]',data.username));
				gameData.player = socketData.host == true ? 1 : 0;
			}
			gameData.moving = false;
			displayPlayerTurn();
		}else if(status == 'updateroundcomplete'){
			socketData.turn = false;
			if(data.index == socketData.index){
				socketData.turn = true;
				updateGameSocketLog(time + textMultiplayerDisplay.yourTurn);
				gameData.player = socketData.host == true ? 0 : 1;
			}else{
				updateGameSocketLog(time + textMultiplayerDisplay.playerTurn.replace('[USER]',data.username));
				gameData.player = socketData.host == true ? 1 : 0;
			}
			gameData.moving = false;
			displayPlayerTurn();
		}
	}

	if(multiplayerSettings.game == 'connectfour'){
		if(status == 'init'){
			toggleSocketLoader(false);
			socketData.socketGameLogs = [];
			gameLogsTxt.text = '';
			if(data[0].index == socketData.index){
				socketData.host = true;
			}

			for(var n=0; n<data.length; n++){
				if(data[n].index == socketData.index){
					socketData.gameIndex = n;
					if(!multiplayerSettings.enterName){
						showSocketNotification(textMultiplayerDisplay.playerNotification.replace('[USER]', data[n].username));
					}
				}
				$.players['gamePlayer'+ n].text = data[n].username;
			}
			gameData.players = data.length;
			postSocketUpdate('custom');
		}else if(status == 'custom'){
			gameData.custom.column = customSettings.columnMin;
			gameData.custom.row = customSettings.rowMin;
			gameData.custom.connect = customSettings.connectMin;
			checkCustomSettings();
			goPage('custom');
			if(!socketData.host){
				gameLogsTxt.visible = true;
				toggleSocketLoader(true, textMultiplayerDisplay.waitingHost);
			}
		}else if(status == 'updatecustom'){
			gameData.custom.row = data.row;
			gameData.custom.column = data.column;
			gameData.custom.connect = data.connect;
			checkCustomSettings();
		}else if(status == 'players'){
			goPage('players');
			if(!socketData.host){
				gameLogsTxt.visible = true;
				toggleSocketLoader(true, textMultiplayerDisplay.waitingHost);
			}
		}else if(status == 'updateplayers'){
			gameData.icon = data.icon;
			gameData.switch = data.switch;
			gameData.icons = data.icons;
			displayPlayerIcon();
		}else if(status == 'start'){
			toggleSocketLoader(false);
			goPage('game');
			
			socketData.turn = false;
			if(data.index == socketData.index){
				socketData.turn = true;
				updateGameSocketLog(time + textMultiplayerDisplay.youStart);
				gameData.player = socketData.host == true ? 0 : 1;
			}else{
				updateGameSocketLog(time + textMultiplayerDisplay.playerStart.replace('[USER]',data.username));
				gameData.player = socketData.host == true ? 1 : 0;
			}
			
			displayPlayerTurn();
		}else if(status == 'updatetimer'){
			timeData.timer = data;
			updateTimer();
		}else if(status == 'updatemove'){
			placeMove(data.column);
		}else if(status == 'updatemovecomplete'){
			socketData.turn = false;
			if(data.index == socketData.index){
				socketData.turn = true;
				updateGameSocketLog(time + textMultiplayerDisplay.yourTurn);
				gameData.player = socketData.host == true ? 0 : 1;
			}else{
				updateGameSocketLog(time + textMultiplayerDisplay.playerTurn.replace('[USER]',data.username));
				gameData.player = socketData.host == true ? 1 : 0;
			}

			gameData.moving = false;
			displayPlayerTurn();
		}else if(status == 'updateroundcomplete'){
			socketData.turn = false;
			if(data.index == socketData.index){
				socketData.turn = true;
				updateGameSocketLog(time + textMultiplayerDisplay.yourTurn);
				gameData.player = socketData.host == true ? 0 : 1;
			}else{
				updateGameSocketLog(time + textMultiplayerDisplay.playerTurn.replace('[USER]',data.username));
				gameData.player = socketData.host == true ? 1 : 0;
			}

			gameData.moving = false;
			displayPlayerTurn();
		}
	}

	if(multiplayerSettings.game == 'wordsearch'){
		if(status == 'init'){
			toggleSocketLoader(false);
			socketData.socketGameLogs = [];
			gameLogsTxt.text = '';
			if(data[0].index == socketData.index){
				socketData.host = true;
			}
		
			for(var n=0; n<data.length; n++){
				if(data[n].index == socketData.index){
					socketData.gameIndex = n;
					if(!multiplayerSettings.enterName){
						showSocketNotification(textMultiplayerDisplay.playerNotification.replace('[USER]', data[n].username));
					}
				}
				$.players['gamePlayer'+ n].text = data[n].username;
			}
			gameData.players = data.length;
			postSocketUpdate('category');
		}else if(status == 'category'){
			categoryData.page = 1;
			goPage('category');
			if(!socketData.host){
				gameLogsTxt.visible = true;
				toggleSocketLoader(true, textMultiplayerDisplay.waitingHost);
			}
		}else if(status == 'updatecategory'){
			selectCategoryPage(data);
		}else if(status == 'custom'){
			gameData.custom.column = customSettings.columnMin;
			gameData.custom.row = customSettings.rowMin;
			gameData.custom.words = customSettings.wordsMin;
			checkCustomSettings();
			goPage('custom');
			if(!socketData.host){
				gameLogsTxt.visible = true;
				toggleSocketLoader(true, textMultiplayerDisplay.waitingHost);
			}
		}else if(status == 'updatecustom'){
			gameData.custom.row = data.row;
			gameData.custom.column = data.column;
			gameData.custom.words = data.words;
			checkCustomSettings();
		}else if(status == 'category'){
			toggleSocketLoader(false);
			goPage('category');
		}else if(status == 'start'){
			toggleSocketLoader(false);
			goPage('game');
			
			socketData.turn = false;
			if(data.index == socketData.index){
				socketData.turn = true;
				updateGameSocketLog(time + textMultiplayerDisplay.youStart);
				gameData.player = socketData.host == true ? 0 : 1;
			}else{
				updateGameSocketLog(time + textMultiplayerDisplay.playerStart.replace('[USER]',data.username));
				gameData.player = socketData.host == true ? 1 : 0;
			}
			
			checkPlayerTurn();
		}else if(status == 'updatetimer'){
			timeData.timer = data.timer;
			timeData.playerTimer = data.playerTimer;
			updateTimer();
		}else if(status == 'updatepuzzle'){
			gameData.puzzle = data.puzzle;
			gameData.solve = data.solve;
			gameData.words = data.words;
			drawPuzzle();
			drawPuzzleWords();
		}else if(status == 'updatemovecomplete'){
			togglePlayer();
			stopStroke();
		
			socketData.turn = false;
			if(data.index == socketData.index){
				socketData.turn = true;
				updateGameSocketLog(time + textMultiplayerDisplay.yourTurn);
				gameData.player = socketData.host == true ? 0 : 1;
			}else{
				updateGameSocketLog(time + textMultiplayerDisplay.playerTurn.replace('[USER]',data.username));
				gameData.player = socketData.host == true ? 1 : 0;
			}
		
			checkPlayerTurn();
		}else if(status == 'startstroke'){
			gameData.strokeObj = $.puzzle[data.row+'_'+data.column];
			gameData.strokeColorIndex = data.strokeColorIndex;
			gameData.strokeDrawing = true;
			createNewStroke();
		}else if(status == 'updatestroke'){
			drawStroke(data.strokeIndex, data.strokeColorIndex, data.sx, data.sy, data.ex, data.ey);
		}else if(status == 'removestroke'){
			playSound('soundError');
			stopStroke();
		}else if(status == 'completestroke'){
			completeStroke(data.wordIndex, data.row, data.column)
		}else if(status == 'updateroundcomplete'){
			socketData.turn = false;
			if(data.index == socketData.index){
				socketData.turn = true;
				updateGameSocketLog(time + textMultiplayerDisplay.yourTurn);
				gameData.player = socketData.host == true ? 0 : 1;
			}else{
				updateGameSocketLog(time + textMultiplayerDisplay.playerTurn.replace('[USER]',data.username));
				gameData.player = socketData.host == true ? 1 : 0;
			}
			checkPlayerTurn();
		}
	}

	if(multiplayerSettings.game == 'feedmonster'){
		if(status == 'init'){
			toggleSocketLoader(false);
			socketData.socketGameLogs = [];
			gameLogsTxt.text = '';
			if(data[0].index == socketData.index){
				socketData.host = true;
			}

			socketData.players = [];
			for(var n=0; n<data.length; n++){
				if(data[n].index == socketData.index){
					socketData.gameIndex = n;
					gameData.gameIndex = n;
					if(!multiplayerSettings.enterName){
						showSocketNotification(textMultiplayerDisplay.playerNotification.replace('[USER]', data[n].username));
					}
				}

				socketData.players.push({index:data[n].index, username:data[n].username, gameIndex:n, score:0, lives:mapSettings.lives, nextStage:false});
			}
			gameData.mapLoopSide = randomBoolean();
			postSocketUpdate('select', gameData.mapLoopSide);
		}else if(status == 'select'){
			gameData.mapNum = 0;
			gameData.themeNum = 0;
			gameData.mapLoopSide = data;
			goPage('select');
			prepareGame();

			if(!socketData.host){
				gameLogsTxt.visible = true;
				toggleSocketLoader(true, textMultiplayerDisplay.waitingHost);
			}
		}else if(status == 'preparegame'){
			gameData.mapNum = data.map;
			gameData.themeNum = data.theme;
			prepareGame();
		}else if(status == 'start'){
			toggleSocketLoader(false);
			goPage("game");
		}else if(status == 'countdown'){
			startCountdown(data);
		}else if(status == "loopcountdowncomplete"){
			for(var p=0; p<socketData.players.length; p++){
				var thisPlayer = gameData.users[p];
				if(gameData.gameIndex != p){
					thisPlayer.active = false;
				}
			}

			gameData.countdown = data;
			loopCountdownComplete();
		}else if(status == "updateplayer"){
			if(data.index != gameData.gameIndex){
				var updateIcons = true;
				var updatePos = true;
				var disX = 0;
				var disY = 0;
				if(gameData.mapLoop){
					disX += data.mapX;
					disY += data.mapY;
					updateIcons = false;
				}

				if(updateIcons){
					if(socketData.players[data.index].lives > 0){
						multiData.players[data.index].map = data.map;
						drawIcons();
					}
				}

				if(updatePos){
					for(var n=0; n<multiData.players[data.index].ghosts.length; n++){
						var thisGhost = multiData.players[data.index].ghosts[n];
						thisGhost.alpha = multiData.alpha;
						thisGhost.x = data.ghosts[n].x + disX;
						thisGhost.y = data.ghosts[n].y + disY;
						thisGhost.gotoAndStop(data.ghosts[n].frame);
					}
					
					var thisPlayer = gameData.users[data.index];
					thisPlayer.active = false;
					thisPlayer.x = data.player.x + disX;
					thisPlayer.y = data.player.y + disY;
					thisPlayer.scaleX = data.player.scaleX;
					thisPlayer.rotation = data.player.rotation;
					thisPlayer.alpha = multiData.alpha;
					thisPlayer.nameLabel.x = data.player.labelX + disX;
					thisPlayer.nameLabel.y = data.player.labelY + disY;
					thisPlayer.gotoAndStop(data.player.frame);
				}

				if(socketData.players[gameData.gameIndex].lives == 0 && gameData.mapLoop && multiData.map == data.index){
					mapWrapContainer.x = data.mapX;
					mapWrapContainer.y = data.mapY;
					
					gameData.map = data.map;
					drawWalls();
					drawIcons();
				}
			}

		}if(status == "nextstage"){
			socketData.players[data.index].nextStage = true;
			var readyCount = 0;
			var totalReadyCount = 0;
			for(var p=0; p<socketData.players.length; p++){
				if(socketData.players[p].lives > 0){
					totalReadyCount++;
					if(socketData.players[p].nextStage){
						readyCount++;
					}
				}
			}

			if(readyCount == totalReadyCount){
				showGameStage("clear");
			}
		}else if(status == "showgamestage"){
			showGameStage(data);
		}else if(status == "updatestats"){
			socketData.players[data.index].score = data.score;
			socketData.players[data.index].lives = data.lives;

			if(socketData.players[data.index].lives == 0){
				gameData.users[data.index].nameLabel.visible = false;
				for(var n=0; n<multiData.players[data.index].ghosts.length; n++){
					var thisGhost = multiData.players[data.index].ghosts[n];
					thisGhost.alpha = 0;
				}
			}
			
			multiData.map = -1;
			for(var p=0; p<socketData.players.length; p++){
				if(socketData.players[p].lives > 0 && multiData.map == -1){
					multiData.map = p;
				}
			}
			updateGameDisplay();
		}else if(status == "endgame"){
			var endGameCon = true;
			for(var n=0; n<socketData.players.length; n++){
				if(socketData.players[n].lives > 0){
					endGameCon = false;
				}
			}

			if(endGameCon){
				endGame();
			}
		}
	}

	if(multiplayerSettings.game == 'slotcarchallenge'){
		if(status == 'init'){
			toggleSocketLoader(false);
			socketData.socketGamelogs = [];
			gameLogsTxt.text = '';
			if(data[0].index == socketData.index){
				socketData.host = true;
			}
			
			socketData.players = [];
			for(var n=0; n<data.length; n++){
				if(data[n].index == socketData.index){
					socketData.gameIndex = n;
					gameData.gameIndex = n;
					if(!multiplayerSettings.enterName){
						showSocketNotification(textMultiplayerDisplay.playerNotification.replace('[USER]', data[n].username));
					}
				}

				socketData.players.push({index:data[n].index, gameIndex:n, username:data[n].username, complete:false, overalltime:0, besttime:0});
			}
			postSocketUpdate('track');
		}else if(status == 'track'){
			goPage('track');

			if(!socketData.host){
				gameLogsTxt.visible = true;
				toggleSocketLoader(true, textMultiplayerDisplay.waitingHost);
			}
		}else if(status == 'updatetrack'){
			if(!socketData.host){
				selectPage(data);
			}
		}else if(status == 'updatetrackselect'){
			if(!socketData.host){
				selectTrackThumbs(data);
			}
		}else if(status == 'start'){
			toggleSocketLoader(false);
			goPage('game');
			for(var n=0; n<data.length; n++){
				if(data[n].index == socketData.index){
					gameData.players[n].label.text = "YOU";
				}else{
					gameData.players[n].label.text = data[n].username;
				}
			}
		}else if(status == 'updatecountdown'){
			if(!socketData.host){
				gameData.countNum = data;
				updateCountdown();
			}
		}else if(status == 'remotecontrol'){
			if(socketData.host){
				gameData.players[data.index].pressCon = data.press;
			}
		}else if(status == 'updatecar'){
			if(data.index != gameData.gameIndex){
				var thisPlayer = gameData.players[data.index];
				thisPlayer.bestLapTime = data.bestLapTime;
				thisPlayer.timeScale = data.timeScale;
				thisPlayer.progress = data.progress;
				thisPlayer.touchCon = data.touchCon;
				thisPlayer.car.visible = data.visible;
				thisPlayer.volume = data.volume;
				thisPlayer.speed = data.speed;

				thisPlayer.carDrift.x = data.carDriftX;
				thisPlayer.carDrift.y = data.carDriftY;
				thisPlayer.carDrift.rotation = data.carDriftRotation;
				thisPlayer.carDrift.visible = data.carDriftVisible;

				thisPlayer.sparks.x = data.sparkX;
				thisPlayer.sparks.y = data.sparkY;
				thisPlayer.sparks.scaleX = data.sparkScaleX;
				thisPlayer.sparks.scaleY = data.sparkScaleY;
				thisPlayer.sparks.rotation = data.sparkRotation;
				thisPlayer.sparks.visible = data.sparkVisible;

				if(thisPlayer.carDrift.visible){
					TweenMax.to(thisPlayer.carTween, 0, {timeScale:thisPlayer.timeScale, overwrite:true});
				}

				if(thisPlayer.touchCon){
					thisPlayer.carTween.progress(thisPlayer.progress);
					TweenMax.to(thisPlayer.carTween, 1, {timeScale:thisPlayer.timeScale});
				}

				setSoundVolume('soundRaceAI', thisPlayer.volume);

				if(gameData.mode == "timer"){
					thisPlayer.car.alpha = thisPlayer.carDrift.alpha = .2;
				}
			}
		}else if(status == "updatelap"){
			gameData.players[data.index].lap = data.lap;
		}else if(status == "completelap"){
			if(socketData.host){
				var socketPosIndex = socketData.players.findIndex(x => x.gameIndex === data);
				socketData.players[socketPosIndex].complete = true;
				gameData.players[data].complete = true;
				gameData.players[data].slowdown = true;

				var totalRacerComplete = 0;
				var totalRacer = 0;
				for(var n=0; n<socketData.players.length; n++){
					totalRacer++;

					if(socketData.players[n].complete){
						totalRacerComplete++;
					}
				}
				if(totalRacerComplete == totalRacer){
					postSocketUpdate('complete');
				}
			}
		}else if(status == "complete"){
			endGame();
		}
	}

	if(multiplayerSettings.game == 'playreversi'){
		if(status == 'init'){
			toggleSocketLoader(false);
			socketData.socketGameLogs = [];
			gameLogsTxt.text = '';
			if(data[0].index == socketData.index){
				socketData.host = true;
			}
			
			socketData.players = [];
			for(var n=0; n<data.length; n++){
				if(data[n].index == socketData.index){
					socketData.gameIndex = n;
					if(!multiplayerSettings.enterName){
						showSocketNotification(textMultiplayerDisplay.playerNotification.replace('[USER]', data[n].username));
					}
				}
				$.players['gamePlayer'+ n].text = data[n].username;
				socketData.players.push({index:data[n].index, flipComplete:false})
			}
			gameData.players = data.length;
			postSocketUpdate('custom');
		}else if(status == 'custom'){
			gameData.custom.size = customSettings.sizeMin;
			goPage('custom');
			if(!socketData.host){
				gameLogsTxt.visible = true;
				toggleSocketLoader(true, textMultiplayerDisplay.waitingHost);
			}
		}else if(status == 'updatecustom'){
			gameData.custom.size = data.size;
			checkCustomSettings();
		}else if(status == 'players'){
			goPage('players');
			if(!socketData.host){
				gameLogsTxt.visible = true;
				toggleSocketLoader(true, textMultiplayerDisplay.waitingHost);
			}
		}else if(status == 'updateplayers'){
			gameData.icon = data.icon;
			gameData.switch = data.switch;
			gameData.icons = data.icons;
			displayPlayerIcon();
		}else if(status == 'start'){
			toggleSocketLoader(false);
			goPage('game');
			
			socketData.turn = false;
			if(data.index == socketData.index){
				socketData.turn = true;
				updateGameSocketLog(time + textMultiplayerDisplay.youStart);
				gameData.player = socketData.host == true ? 0 : 1;
			}else{
				updateGameSocketLog(time + textMultiplayerDisplay.playerStart.replace('[USER]',data.username));
				gameData.player = socketData.host == true ? 1 : 0;
			}
			displayPlayerTurn();
		}else if(status == 'updatetimer'){
			//timeData.timer = data;
			timeData.playerTimer = data.playerTimer;
			timeData.opponentTimer = data.opponentTimer;
			updateTimer();
		}else if(status == 'makemove'){
			makeMove(data.row, data.column, data.player, data.animate);
		}else if(status == 'checkboardresult'){
			socketData.players[data].flipComplete = true;
			var completeCount = 0;
			for(var n=0; n<socketData.players.length; n++){
				if(socketData.players[n].flipComplete){
					completeCount++;
				}
			}
			if(completeCount == socketData.players.length){
				checkBoardResult();
			}
		}else if(status == 'updatemovecomplete'){
			for(var n=0; n<socketData.players.length; n++){
				socketData.players[n].flipComplete = false;
			}

			socketData.turn = false;
			if(data.index == socketData.gameIndex){
				socketData.turn = true;
				updateGameSocketLog(time + textMultiplayerDisplay.yourTurn);
				gameData.player = socketData.host == true ? 0 : 1;
			}else{
				updateGameSocketLog(time + textMultiplayerDisplay.playerTurn.replace('[USER]',data.username));
				gameData.player = socketData.host == true ? 1 : 0;
			}
			gameData.moving = false;
			displayPlayerTurn();
		}
	}

	if(multiplayerSettings.game == 'playcheckers'){
		if(status == 'init'){
			toggleSocketLoader(false);
			socketData.socketGameLogs = [];
			gameLogsTxt.text = '';
			if(data[0].index == socketData.index){
				socketData.host = true;
			}
			
			socketData.players = [];
			for(var n=0; n<data.length; n++){
				if(data[n].index == socketData.index){
					socketData.gameIndex = n;
					if(!multiplayerSettings.enterName){
						showSocketNotification(textMultiplayerDisplay.playerNotification.replace('[USER]', data[n].username));
					}
				}
				$.players['gamePlayer'+ n].text = data[n].username;
				socketData.players.push({index:data[n].index, flipComplete:false})
			}
			gameData.players = data.length;
			postSocketUpdate('custom');
		}else if(status == 'custom'){
			gameData.custom.size = customSettings.sizeMin;
			goPage('custom');
			if(!socketData.host){
				gameLogsTxt.visible = true;
				toggleSocketLoader(true, textMultiplayerDisplay.waitingHost);
			}
		}else if(status == 'updatecustom'){
			gameData.custom.size = data.size;
			checkCustomSettings();
		}else if(status == 'players'){
			goPage('players');
			if(!socketData.host){
				gameLogsTxt.visible = true;
				toggleSocketLoader(true, textMultiplayerDisplay.waitingHost);
			}
		}else if(status == 'updateplayers'){
			gameData.icon = data.icon;
			gameData.switch = data.switch;
			gameData.icons = data.icons;
			displayPlayerIcon();
		}else if(status == 'start'){
			toggleSocketLoader(false);
			goPage('game');
			
			socketData.turn = false;
			if(data.index == socketData.index){
				socketData.turn = true;
				updateGameSocketLog(time + textMultiplayerDisplay.youStart);
				gameData.player = socketData.host == true ? 0 : 1;
			}else{
				updateGameSocketLog(time + textMultiplayerDisplay.playerStart.replace('[USER]',data.username));
				gameData.player = socketData.host == true ? 1 : 0;
			}
			displayPlayerTurn();
		}else if(status == 'updatetimer'){
			//timeData.timer = data;
			timeData.playerTimer = data.playerTimer;
			timeData.opponentTimer = data.opponentTimer;
			updateTimer();
		}else if(status == 'moveplayer'){
			gameData.pieceIndex = data.pieceIndex;
			movePlayer(data.row, data.column);
		}else if(status == 'checkboardresult'){
			socketData.players[data].flipComplete = true;
			var completeCount = 0;
			for(var n=0; n<socketData.players.length; n++){
				if(socketData.players[n].flipComplete){
					completeCount++;
				}
			}
			if(completeCount == socketData.players.length){
				if(socketData.turn){
					togglePlayer();
					postSocketUpdate('updatemovecomplete', {index:gameData.player});
				}
			}
		}else if(status == 'updatemovecomplete'){
			for(var n=0; n<socketData.players.length; n++){
				socketData.players[n].flipComplete = false;
			}

			socketData.turn = false;
			if(data.index == socketData.gameIndex){
				socketData.turn = true;
				updateGameSocketLog(time + textMultiplayerDisplay.yourTurn);
				gameData.player = socketData.host == true ? 0 : 1;
			}else{
				updateGameSocketLog(time + textMultiplayerDisplay.playerTurn.replace('[USER]',data.username));
				gameData.player = socketData.host == true ? 1 : 0;
			}
			gameData.moving = false;
			displayPlayerTurn();
		}
	}

	if(multiplayerSettings.game == 'playchess'){
		if(status == 'init'){
			toggleSocketLoader(false);
			socketData.socketGameLogs = [];
			gameLogsTxt.text = '';
			if(data[0].index == socketData.index){
				socketData.host = true;
			}
			
			socketData.players = [];
			for(var n=0; n<data.length; n++){
				if(data[n].index == socketData.index){
					socketData.gameIndex = n;
					if(!multiplayerSettings.enterName){
						showSocketNotification(textMultiplayerDisplay.playerNotification.replace('[USER]', data[n].username));
					}
				}
				$.players['gamePlayer'+ n].text = data[n].username;
				socketData.players.push({index:data[n].index, flipComplete:false})
			}
			gameData.players = data.length;
			postSocketUpdate('players');
		}else if(status == 'players'){
			goPage('players');
			if(!socketData.host){
				gameLogsTxt.visible = true;
				toggleSocketLoader(true, textMultiplayerDisplay.waitingHost);
			}
		}else if(status == 'updateplayers'){
			gameData.icon = data.icon;
			gameData.iconSwitch = data.iconSwitch;
			gameData.icons = data.icons;
			displayPlayerIcon();
		}else if(status == 'start'){
			toggleSocketLoader(false);
			goPage('game');
			
			socketData.turn = false;
			if(gameData.player == socketData.gameIndex){
				socketData.turn = true;
				updateGameSocketLog(time + textMultiplayerDisplay.youStart);
			}else{
				updateGameSocketLog(time + textMultiplayerDisplay.playerStart.replace('[USER]',data.username));
			}
			displayPlayerTurn();
		}else if(status == 'updatetimer'){
			timeData.playerTimer = data.playerTimer;
			timeData.opponentTimer = data.opponentTimer;
			updateTimer();
		}else if(status == 'moveplayer'){
			gameData.pieceIndex = data.pieceIndex;
			gameData.drag = data.drag;
			movePlayer(data.row, data.column);
		}else if(status == 'checkboardresult'){
			socketData.players[data].flipComplete = true;
			var completeCount = 0;
			for(var n=0; n<socketData.players.length; n++){
				if(socketData.players[n].flipComplete){
					completeCount++;
				}
			}
			if(completeCount == socketData.players.length){
				if(socketData.turn){
					togglePlayer();
					postSocketUpdate('updatemovecomplete', {index:gameData.player});
				}
			}
		}else if(status == 'updatemovecomplete'){
			for(var n=0; n<socketData.players.length; n++){
				socketData.players[n].flipComplete = false;
			}

			socketData.turn = false;
			if(data.index == socketData.gameIndex){
				socketData.turn = true;
				updateGameSocketLog(time + textMultiplayerDisplay.yourTurn);
				gameData.player = socketData.host == true ? 0 : 1;
			}else{
				updateGameSocketLog(time + textMultiplayerDisplay.playerTurn.replace('[USER]',data.username));
				gameData.player = socketData.host == true ? 1 : 0;
			}
			gameData.moving = false;
			displayPlayerTurn();
		}
	}

	if(multiplayerSettings.game == 'wheeloffortunequiz'){
		if(status == 'init'){
			toggleSocketLoader(false);
			socketData.socketGamelogs = [];
			if(typeof gameLogsTxt != 'undefined'){
				gameLogsTxt.text = '';
			}
			if(data[0].index == socketData.index){
				socketData.host = true;
			}

			for(var n=0; n<4; n++){
				$.players[n].visible = false;
			}
			for(var n=0; n<data.length; n++){
				$.players["active"+n].visible = false;
				if(data[n].index == socketData.index){
					$.players["active"+n].visible = true;
					socketData.gameIndex = n;
					if(!multiplayerSettings.enterName){
						showSocketNotification(textMultiplayerDisplay.playerNotification.replace('[USER]', data[n].username));
					}
				}
				$.players[n].visible = true;
				$.players["name"+n].text = data[n].username;
			}
			gameData.player = 0;
			gameData.players = data.length;
			postSocketUpdate('category');
		}else if(status == 'category'){
			if(gameSettings.category){
				goPage('category');
				if(!socketData.host){
					gameLogsTxt.visible = true;
					toggleSocketLoader(true, textMultiplayerDisplay.waitingHost);
				}
			}else{
				goPage('game');
			}
		}else if(status == 'updatecategory'){
			gameData.categoryNum = data;
			displayCategoryName();
		}else if(status == 'start'){
			toggleSocketLoader(false);
			goPage('game');

			socketData.turn = false;
			if(gameData.player == socketData.gameIndex){
				socketData.turn = true;
			}
		}else if(status == 'sequence'){
			sequence_arr = data;
		}else if(status == 'loadanswer'){
			loadAnswer();
		}else if(status == 'loadanswerready2'){
			if(socketData.host){
				socketData.loaded++;
				if(socketData.loaded >= gameData.players){
					if(fileFest.length > 0){
						socketData.loaded = 0;
						postSocketUpdate('loadanswerassets');
					}else{
						socketData.loaded = 0;
						postSocketUpdate('prepareanswer');
					}
				}
			}
		}else if(status == 'loadanswerassets'){
			loadAnswerAssets();
		}else if(status == 'loadanswerassetscomplete'){
			if(socketData.host){
				socketData.loaded++;
				if(socketData.loaded >= gameData.players){
					socketData.loaded = 0;
					postSocketUpdate('prepareanswer');
				}
			}
		}else if(status == 'prepareanswer'){
			prepareAnswer();
		}else if(status == 'prepareanswerready'){
			if(socketData.host){
				socketData.loaded++;
				if(socketData.loaded >= gameData.players){
					postSocketUpdate('buildanswer', gameData.revealLetters);
				}
			}
		}else if(status == 'buildanswer'){
			gameData.revealLetters = data;
			buildAnswer();
		}else if(status == 'updatetimer'){
			timeData.timer = data;
			updateTimer();
		}else if(status == 'proceednextstep'){
			proceedNextStep();
		}else if(status == 'startwheelspin'){
			startWheelSpin(data.rotateNum, data.randomNum);
		}else if(status == 'presskey'){
			if(!socketData.turn){
				if(data.type == "guessLetter"){
					$.key['guess_'+data.n+'_'+data.k].bgHidden.visible = true;
					$.key['solve_'+data.n+'_'+data.k].bgHidden.visible = true;
					$.key['guess_'+data.n+'_'+data.k].text.color = keyboardSettings.colorDisabled;
					$.key['solve_'+data.n+'_'+data.k].text.color = keyboardSettings.colorDisabled;
					
					toggleGameTimer(false);
					checkGuessLetter(data.letter, true);
				}else if(data.type == "solve"){
					gameData.focusLetterIndex = data.focusLetterIndex;
					gameData.focusLetter[gameData.focusLetterIndex].text.text = data.letter;
					toggleFocusLetter(true);
				}else if(data.type == "vowelSelect"){
					$.key['vowel_'+data.n+'_'+data.k].bgSecret.visible = false;
					toggleGameTimer(false);
					checkGuessLetter(data.letter, false);
				}else if(data.type == "solveenter"){
					checkSolveEnter(true);
				}else if(data.type == "solvedelete"){
					toggleFocusLetter(false);
					checkSolveEnter(false);
				}else if(data.type == "solveletter"){
					checkSolveEnter(false);
				}
			}
		}else if(status == 'updateplayerscore'){
			if(data.con){
				playSound("soundScore");
			}

			TweenMax.to(tweenData, .5, {tweenScore:data.score, overwrite:true, onUpdate:function(){
				$.players[data.index].score = data.score;
				$.players["score"+data.index].text = textDisplay.score.replace('[NUMBER]', addCommas(Math.floor(tweenData.tweenScore)));
				$.players["coin"+data.index].x = -(($.players["score"+data.index].getMeasuredWidth()/2) + 30);
			}});
		}else if(status == 'toggleaction'){
			if(!socketData.turn){
				displayGameStage(data);
			}
		}else if(status == 'buildkeyboard'){
			if(data.type == "guess"){
				gameData.keyArr = data.keyArr;
				buildKeyboard("guess", gameData.keyArr, guessKeyMoveContainer);	
			}else if(data.type == "solve"){
				buildKeyboard("solve", data.keyArr, solveKeyMoveContainer);	
			}else if(data.type == "vowel"){
				gameData.vowelCount = data.vowelCount;
				gameData.vowelArr = data.keyArr;

				if(gameData.vowelArr[0].length < 2 || gameData.vowelCount < 0){
					displayGameStage("vowelNoOption");
				}else{
					buildKeyboard("vowel", gameData.vowelArr, vowelKeyMoveContainer);
					displayGameStage("vowelSelect");
				}
			}
		}else if(status == 'nextplayer'){
			gameData.player++;
			gameData.player = gameData.player > gameData.players-1 ? 0 : gameData.player;

			socketData.turn = false;
			if(gameData.player == socketData.gameIndex){
				socketData.turn = true;
			}
			displayGameStage("turn");
		}else if(status == 'nextround'){
			gameData.currentRound = data;
			gameData.player = gameData.currentRound;

			socketData.turn = false;
			if(gameData.player == socketData.gameIndex){
				socketData.turn = true;
			}

			loadNextAnswer();
		}else if(status == 'endgame'){
			endGame();
		}
	}

	if(multiplayerSettings.game == 'circlejump'){
		if(status == 'init'){
			toggleSocketLoader(false);
			socketData.socketGamelogs = [];
			if(typeof gameLogsTxt != 'undefined'){
				gameLogsTxt.text = '';
			}
			if(data[0].index == socketData.index){
				socketData.host = true;
			}

			for(var n=0; n<data.length; n++){
				if(data[n].index == socketData.index){
					socketData.gameIndex = n;
					if(!multiplayerSettings.enterName){
						showSocketNotification(textMultiplayerDisplay.playerNotification.replace('[USER]', data[n].username));
					}
				}
				$.stage["player"+n].text = data[n].username;
			}
			gameData.totalPlayers = data.length;
			postSocketUpdate('start');
		}else if(status == 'start'){
			toggleSocketLoader(false);
			goPage('game');
		}else if(status == 'prepare'){
			gameData.bg = data.bg;
			gameData.themes = data.themes;
			if(!socketData.host){
				prepareStage();
				prepareCircle();
				resizeGameUI();
			}
			toggleCountdown(true);
		}else if(status == 'countdowncomplete'){
			updateCountdownComplete();
		}else if(status == 'updatestage'){
			if(socketData.gameIndex != data.index){
				var stageIndex = data.index;
				$.stage["cloud"+stageIndex].removeAllChildren();
				$.stage["lines"+stageIndex].removeAllChildren();

				for(var n=0; n<data.lines.length; n++){
					drawStroke(stageIndex, data.lines[n].x, data.lines[n].y, data.lines[n].length, data.lines[n].height);
				}

				for(var n=0; n<data.clouds.length; n++){
					drawCloud(stageIndex, data.clouds[n].x, data.clouds[n].y, data.clouds[n].index);
				}

				gameData.background[stageIndex].front.y = data.y;
				gameData.background[stageIndex].back.y = data.y;
			}
		}else if(status == 'circlestatus'){
			if(socketData.gameIndex != data){
				var thisIndex = data.index;
				if(data.status == "jump"){
					var thisFront = gameData.background[thisIndex].front;
					thisFront.gotoAndPlay("rise");
				}else if(data.status == "hit"){
					playSound("soundFail");
					animateBlink(gameData.background[thisIndex].front, .1);
					animateBlink(gameData.background[thisIndex].back, .1);
				}else if(data.status == "reset"){
					resetCircle(thisIndex);
				}else if(data.status == "over"){
					playSound("soundOver");
					animateBlink(gameData.background[thisIndex].front, .1);
					animateBlink(gameData.background[thisIndex].back, .1);
					$.stage["score"+thisIndex].text = textDisplay.gameover;
				}
			}

			if(socketData.host){
				if(data.status == "over"){
					gameData.background[data.index].over = true;
				}

				var totalOver = 0;
				for(var n=0; n<gameData.background.length; n++){			
					if(gameData.background[n].over){
						totalOver++;
					}
				}
			
				if(totalOver == gameData.themes.length){
					postSocketUpdate('over');
				}
			}
		}else if(status == 'over'){
			gameData.over = true;
			endGame();
		}
	}

	if(multiplayerSettings.game == 'findme'){
		if(status == 'init'){
			toggleSocketLoader(false);
			socketData.socketGamelogs = [];
			if(typeof gameLogsTxt != 'undefined'){
				gameLogsTxt.text = '';
			}
			if(data[0].index == socketData.index){
				socketData.host = true;
			}

			for(var n=0; n<data.length; n++){
				$.players[n].text = data[n].username;
				$.players[n].player = data[n].username;
				if(data[n].index == socketData.index){
					$.players[n].text = textDisplay.activePlayer + "\n" + data[n].username;
					socketData.gameIndex = n;
					if(!multiplayerSettings.enterName){
						showSocketNotification(textMultiplayerDisplay.playerNotification.replace('[USER]', data[n].username));
					}
				}
			}
			gameData.totalPlayers = data.length;
			postSocketUpdate('start');
		}else if(status == 'start'){
			toggleSocketLoader(false);
			goPage('game');
		}else if(status == 'prepare'){
			timeData.oldTimer = -1;
			gameData.player = data.players;
			gameData.multi.players = data.multiplayers;
			showMultiPlayers();
		}else if(status == 'updatetimer'){
			timeData.sessionTimer = data;
			updateTimer();
		}else if(status == 'updateplayers'){
			if(socketData.gameIndex != gameData.multi.round){
				for(var n=0; n<gameData.players.length; n++){
					var thisPlayer = gameData.players[n];

					if(!gameData.begin){
						thisPlayer.moveX = data[n].moveX;
						thisPlayer.moveY = data[n].moveY;
						thisPlayer.x = data[n].x;
						thisPlayer.y = data[n].y;
					}else{
						if(thisPlayer.moveX != data[n].moveX && thisPlayer.moveY != data[n].moveY){
							playPlayerAudio();
							thisPlayer.moveX = data[n].moveX;
							thisPlayer.moveY = data[n].moveY;
							var tweenSpeed = getDistance(thisPlayer.x, thisPlayer.y, thisPlayer.moveX, thisPlayer.moveY) * (gameData.stage.speed * 0.01);
							TweenMax.to(thisPlayer, tweenSpeed, {x:thisPlayer.moveX, y:thisPlayer.moveY, ease:Linear.easeNone, overwrite:true});
						}
					}
					
					if(n < gameData.totalPlayers){
						posPlayerName(n, thisPlayer);
					}
				}
			}
		}else if(status == 'directplayer'){
			if(socketData.gameIndex == gameData.multi.round){
				directPlayers(data.index, data.x, data.y);
			}
		}else if(status == 'caughtplayer'){
			if(socketData.gameIndex != gameData.multi.round){
				var thisPlayer = gameData.players[data]
				thisPlayer.focus = false;
				thisPlayer.gotoAndPlay("wave");
				playSound("soundClear");
			}

			gameData.multi.found++;
			updateMultiScore();
		}else if(status == 'endround'){
			gameData.complete = true;
			timeData.sessionTimer = data;
			timeData.accumulate = timeData.countdown - timeData.sessionTimer;
			calculateScore();
			allPlayersPointToPlayer();
		}else if(status == 'timesup'){
			if(socketData.gameIndex == gameData.multi.round){
				socketData.loaded++;
				if(socketData.loaded >= gameData.totalPlayers){
					TweenMax.to(gameContainer, 4, {overwrite:true, onComplete:function(){
						socketData.loaded = 0;
						postSocketUpdate('nextround');
					}});
				}
			}else{
				gameData.complete = true;
				allPlayersPointToPlayer();
			}
		}else if(status == 'playersready'){
			if(socketData.gameIndex == gameData.multi.round){
				socketData.loaded++;
				if(socketData.loaded >= gameData.totalPlayers){
					TweenMax.to(gameContainer, 1, {overwrite:true, onComplete:function(){
						postSocketUpdate('nextround');
					}});
				}
			}
		}else if(status == 'nextround'){
			gameData.multi.round++;
			if(gameData.multi.round < gameData.totalPlayers){
				setupGameStage();
				showMultiPlayers();
			}else{
				showGameStatus("roundcomplete");
				TweenMax.to(gameContainer, 2, {overwrite:true, onComplete:function(){
					goPage('result');
				}});
			}
		}
	}
}