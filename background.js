console.log("Welcome to Spotify!");

function ti() {
  this.name = "";
  this.artist = "";
  this.album = "";
  this.image = "";
}

function ti(name, artist, album, imgUrl) {
  this.name = name;
  this.artist = artist;
  this.album = album;
  this.image = imgUrl;
}

ti.prototype.equals = function(obj) {
  return this.name == obj.name &&
    this.artist == obj.artist &&
    this.album == obj.album;

}

function init() {
  setInterval(checkForSongChange, 750);
}

var player = document.getElementById("app-player");
player = player.contentDocument || player.contentWindow.document;

var trackInfo = new ti();
var isPlaying = true;
var timeout = null;
var nt = null;
var checks = 0;
function checkForSongChange() {

  var queue = document.getElementById("section-queue").getElementsByTagName("iframe")[0];
  if (queue){
    queue = queue.contentDocument || queue.contentWindow.document;
  }

  var newTi = new ti(player.getElementById("track-name").getElementsByTagName("a")[0].innerHTML,
                     player.getElementById("track-artist").getElementsByTagName("a")[0].innerHTML,
                     !queue ? "" : queue.getElementsByClassName("current")[0].getElementsByClassName("list-row-albums")[0].getElementsByTagName("a")[0].title,
                     player.getElementsByClassName("sp-image-img")[0].style["background-image"].replace("url(","").replace(")",""));

  var elapsed = player.getElementById("track-current").innerHTML.split(":");;
  var length = player.getElementById("track-length").innerHTML.split(":");;

  elapsed = parseInt(elapsed[0]) * 60 + parseInt(elapsed[1]);
  length = parseInt(length[0]) * 60 + parseInt(length[1]);

  var toGo = length - elapsed;
  //http://www.pandora.com/img/no_album_art.png
  if (!trackInfo.equals(newTi) &&
    (trackInfo.image != newTi.image ||
      (trackInfo.image == "http://www.pandora.com/img/no_album_art.png" && checks++ > 4))) {
    trackInfo = newTi;

    var track = trackInfo.name;
    var artist = trackInfo.artist;
    var album = trackInfo.album;
    var image = trackInfo.image;

    //window.document.title = track + " by " + artist;

    var options = {
      icon: image,
      body: 'by ' + artist + '\r\non ' + album,
      sticky: true
    };

    if (nt){
      nt.close();
      nt = null;
    }

    nt = new Notification(track, options);

    var noteClicked = function() {
      if ($(player.getElementById("play-pause")).hasClass("playing")) {
        $(player.getElementById("play-pause")).click()
        nt = new Notification("Paused - " + track, options);
        nt.onclick = noteClicked;
      } else {
        this.title = track;
        $(player.getElementById("play-pause")).click()
        nt = new Notification(track, options);
        nt.onclick = noteClicked;
        timeout = setTimeout(function() {
          nt.close();
        }, (toGo) * 1000);
      }
      return false;
    }

    nt.onclick = noteClicked;

    setTimeout(function() {
      nt.close();
    }, (toGo) * 1000);

    console.log("Next Song is: " + trackInfo.name);
  }
}

function waitTilLoaded() {
  setTimeout(
    function() {
      console.log("loop called");
      player = document.getElementById("app-player");
      player = player.contentDocument || player.contentWindow.document;
      if (!player.getElementById("track-name")) {
        waitTilLoaded();
      } else {
        console.log("title exists!");
        init();
      }
    }, 750);
}

$(window).bind("load", function() {
  console.log("Page Loaded!");
  player = document.getElementById("app-player");
  player = player.contentDocument || player.contentWindow.document;
  waitTilLoaded();
});