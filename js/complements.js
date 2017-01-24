
//--------Stream that works-------------
//http://ccma-tva-int-abertis-live.hls.adaptive.level3.net/int/ngrp:tv3cat_tv/playlist.m3u8
//--------------------------------------

//Songs info
var totalSongs;
var numShowingSongs;
var focusPosition;
var pointerList;

//Flags (boolean)
var canClickOk;
var isOnMenu;
var isPlayingVideo;
var isFullscreen;
var videos;
var users;


//When the window is load this function is executed
window.onload = function() {
	
	//localStorage.removeItem("videos");

	//MANAGER SETTINGS
	var appManager = document.getElementById("oipfAppMan").getOwnerApplication(document);
	appManager.show();
	appManager.privateData.keyset.setValue(0x1 + 0x2 + 0x4 + 0x8 + 0x10 + 0x100);

	//INICIALIZATION
	focusPosition = 0;
	pointerList = 0;
	numShowingSongs = 5;

	//Setting up booleans
	canClickOk = false;
	isOnMenu = false;
	isPlayingVideo = false;
	isPlayingStream = false;
	isPaused = false;
	isShowingRedButton = false;
	isFullscreen = false;
	
	loadAllJSON();
	loadAllJSONUsers()

	//RED BUTTON ANIMATION
	doAnimationButton();

	//KEY LISTENERS
	document.addEventListener("keydown", function(e) {
		switch(e.keyCode){
			case VK_RED:
				console.log("RED - Play Video");
				if(!canClickOk){
					showNumbers();
				}
				if(canClickOk && isOnMenu){
					playVideo();
					updateCounter();
				}
			break;
			case VK_BLUE:
				console.log("BLUE - Fullscreen");
				setFullscreen();
			break;
			case VK_GREEN:
				console.log("GREEN - Pause Video");
				if(isOnMenu) pauseVideo();
			break;
			case VK_YELLOW:
				console.log("YELLOW - Stop Video");
				if(isOnMenu) stopVideo();
			break;
			case VK_UP:
				console.log("UP - Move up focus");
				if(isOnMenu) moveUp();
			break;
			case VK_DOWN:
				console.log("DOWN - Move down focus");
				if(isOnMenu) moveDown();
			break;
			case VK_ENTER:
				console.log("ENTER - Ok pressed");
				if(isOnMenu){
						playVideo();
						updateCounter();
					}
				if(canClickOk){
					loadSongs();
					updateInfo();
					var video = document.getElementById('video');
					video.bindToCurrentChannel();
					
					isOnMenu = true;
					document.getElementById("numbers").style.visibility = "hidden";
					document.getElementById("menu").style.visibility = "visible";
					document.getElementById("background").style.visibility = "visible";
					
					
				}
				
			break;
			case VK_0:
				console.log("ZERO - Destroy app");
				appManager.hide();
				appManager.destroy();
			break;																
		}
		e.preventDefault();
	}, false);
};

//Do the initial timer animatons
function doAnimationButton(){

	document.getElementById("button").style.visibility = "visible";	
	setTimeout (function(){ document.getElementById("button").style.visibility = "hidden"; }, 10000);
	setTimeout (function(){ document.getElementById("button").style.visibility = "visible"; }, 15000);
	setTimeout (function(){ document.getElementById("button").style.visibility = "hidden"; }, 20000);
	setTimeout (function(){ document.getElementById("button").style.visibility = "visible"; }, 80000);
	setTimeout (function(){ document.getElementById("button").style.visibility = "hidden"; }, 85000);

}

//Show the configuration numbers
function showNumbers(){

	document.getElementById("button").style.visibility = "hidden";
	document.getElementById("button").style.zIndex = "-100";
	document.getElementById("numbers").style.visibility = "visible";
	var random_number = Math.floor(1000 + Math.random() * 9000);
	document.getElementById("randomnumbers").innerHTML =  '<span class="glyphicon glyphicon-arrow-right" aria-hidden="true"></span> ' + random_number.toString() + ' <span class="glyphicon glyphicon-arrow-left" aria-hidden="true"></span>';
	canClickOk = true;

}

//Move the focus one position down
function moveDown(){
	
	var active = $('#active');
	
	if (active.index() >= numShowingSongs-1 && checkList) {
		if(pointerList < totalSongs - numShowingSongs) {
			pointerList++; 
			focusPosition++;
			loadSongs();
			updateInfo();
		}
	}else{
		var next = active.next();
		active.attr("id"," ");
		next.attr("id","active");
		focusPosition++;
		loadSongs();
		updateInfo();
	}

}

//Move the focus one position up
function moveUp(){

	var active = $("#active");

	if (active.index() < 1) {
		if(pointerList > 0) {
			pointerList--; 
			focusPosition--;
			loadSongs();
			updateInfo();
		}
		
	}else{
		var previous = active.prev();
		active.attr("id"," ");
		previous.attr("id","active");
		focusPosition--;
		loadSongs();
		updateInfo();
	}

}

function checkList(){
	return ((pointerList + numShowingSongs) < 8);
}

//Swap fullscreen option button
function setFullscreen(){
	
	//Show information panel
	var info = document.getElementById('fullscreen');

	if(!isFullscreen && isPlayingVideo && isOnMenu){
		info.style.visibility = "visible";
		isFullscreen = true;
	}else{
		info.style.visibility = "visible";
		isFullscreen = false;
	}

	//Show or hide
	var video = document.getElementById('video');

	if (video.requestFullscreen) {
    	video.requestFullscreen();
  	} else if (video.webkitRequestFullscreen) {
    	video.webkitRequestFullscreen();
  	} else if (video.mozRequestFullScreen) {
      	video.mozRequestFullScreen();
  	} else if (video.msRequestFullscreen) {
    	video.msRequestFullscreen();
  	}

  	if (document.exitFullscreen) {
    	document.exitFullscreen();
  	} else if (document.webkitExitFullscreen) {
    	document.webkitExitFullscreen();
  	} else if (document.mozCancelFullScreen) {
    	document.mozCancelFullScreen();
  	} else if (document.msExitFullscreen) {
    	document.msExitFullscreen();
  	}
  	
}

//Update song info panel (situated on the right side)
function updateInfo(){
	
	$("#song-name").html(document.getElementById('active').children[1].innerHTML);
	$("#artist-name").html(document.getElementById('active').children[2].innerHTML);
	$("#album-name").html(document.getElementById('active').children[3].innerHTML);
	$("#votes").html(document.getElementById('active').children[4].innerHTML);
	$("#description").html(document.getElementById('active').children[5].innerHTML);

}

//Load/refresh playlist 
function loadSongs(){

	var placeholder = document.getElementById("playlist");
	placeholder.innerHTML = " ";

	for(var i = pointerList; i < numShowingSongs+pointerList; i++){
				
		var globalDiv = document.createElement("div")
		var imageElement = document.createElement("img");
		var songElement = document.createElement("h4");
		var artistElement = document.createElement("h5");
		var albumElement = document.createElement("h5");
		var votesElement = document.createElement("p");
		var pathVideoElement = document.createElement("p");
		var descriptionElement = document.createElement("p");
		var focusElement = document.createElement("div");
		
		imageElement.src = videos.playlist[i].photo_path;
		imageElement.setAttribute("alt","Album name: " + videos.playlist[i].album);
		
		imageElement.className = "album-image";
		globalDiv.appendChild(imageElement);
	
		songElement.textContent = videos.playlist[i].song;
		songElement.className = "song-name";
		globalDiv.appendChild(songElement);

		artistElement.textContent = videos.playlist[i].artist;
		artistElement.className = "artist-name";
		globalDiv.appendChild(artistElement);

		albumElement.textContent = videos.playlist[i].album;
		albumElement.className = "album-name";
		globalDiv.appendChild(albumElement);

		votesElement.textContent = videos.playlist[i].votes + " views";
		votesElement.className = "votes badge";
		globalDiv.appendChild(votesElement);

		descriptionElement.textContent = videos.playlist[i].description;
		descriptionElement.className = "description";
		descriptionElement.style.visibility = "hidden";
		globalDiv.appendChild(descriptionElement);
		
		pathVideoElement.textContent = videos.playlist[i].video_path;
		pathVideoElement.style.visibility = "hidden";
		globalDiv.appendChild(pathVideoElement);		

		focusElement.innerHTML = '<span class="glyphicon glyphicon-triangle-top up-icon" aria-hidden="true"></span><span class="glyphicon glyphicon-play-circle middle-icon" aria-hidden="true"></span><span class="glyphicon glyphicon-triangle-bottom down-icon" aria-hidden="true"></span>';
		focusElement.className = "focus";
		globalDiv.appendChild(focusElement);

		if (i == focusPosition) {
			globalDiv.setAttribute("id","active");	
			focusElement.style.visibility = "visible";	
		}else{
			focusElement.style.visibility = "hidden";
		};
		globalDiv.className = "well";
 		
 		placeholder.appendChild(globalDiv);
 		
	}

}

//Load/refresh the online users
function loadUsers(){
	
	var placeholder = document.getElementById("users");
	
	for (var i = 0; i < users.connected_users.length; i++) {
		
		var usersElement = document.getElementById("users");
		var usersConnected = document.getElementById("users").innerHTML;
		if(i == 0 || i == users.connected_users.length){ usersElement.textContent = usersConnected + users.connected_users[i].name;}
		else{ usersElement.textContent = usersConnected + ", " + users.connected_users[i].name;}
	
	};

}

//Play specific video in the object video or play from pause
function playVideo(){
	
	var video = document.getElementById('video');
	var path;

	video.type = "video/mpeg4";
	if(true){ //TODO: Ask functionality
		path = document.getElementById('active').children[6].innerHTML;
		video.data = path;
		video.play();
		isPlayingVideo = true;

	}else{
		video.play();
	}

}

//Pause the video object that is playing
function pauseVideo(){

	if (isPlayingVideo) {
		var video = document.getElementById('video');
		video.play(0);
	};

}

//Stop the video object that is playing and go back to the broadcast
function stopVideo(){
	if (isPlayingVideo) {
		var video = document.getElementById('video');
		video.stop();
		isPlayingVideo = false;
		
	};
}

//Loads the json videos from file or localStorage, depending if it exist or not
function loadAllJSON(){

	var temp = JSON.parse(localStorage.getItem("videos"));

	if(temp === null){

		console.log("Loading from JSON");
	    var fileName = "./data/videos.json";
	    var xmlhttp = new XMLHttpRequest();
	    
	    xmlhttp.onreadystatechange=function() {
	        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
	          didVideoResponse(xmlhttp.responseText);
	        }
	    }
	    xmlhttp.overrideMimeType("application/json");
	    xmlhttp.open("GET", fileName, true);
	    xmlhttp.send();

	}else{
		console.log("Loading from localStorage");
		videos = temp;
		totalSongs = videos.playlist.length;
		//loadSongs();
		//updateInfo();

	}

}

function didVideoResponse(response){
	
	videos = JSON.parse(response);
	totalSongs = videos.playlist.length;
	loadSongs();
	updateInfo();

	//Save videos in local Storage
	localStorage.setItem("videos", JSON.stringify(videos));

}

//Loads the json users from file
function loadAllJSONUsers() {

    var fileName = "./data/users.json";
    var xmlhttp = new XMLHttpRequest();
    
    xmlhttp.onreadystatechange=function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
          didUserResponse(xmlhttp.responseText);
        }
    }

    xmlhttp.overrideMimeType("application/json");
    xmlhttp.open("GET", fileName, true);
    xmlhttp.send();

}

function didUserResponse(response){

	users = JSON.parse(response);	
	loadUsers();

	//Save users in local storage
	localStorage.setItem("users", JSON.stringify(users));

}

//Updates the number of views for the focus song
function updateCounter(){
	
	var temp = JSON.parse(localStorage.getItem("videos"));
	temp.playlist[focusPosition].votes += 1;
	localStorage.setItem("videos", JSON.stringify(temp));
	videos = temp;
	loadSongs();
	updateInfo();

}