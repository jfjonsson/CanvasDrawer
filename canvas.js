$(function() {
    console.log( "ready!" );
    var cv = document.getElementById("paintView");
  	var ctx = cv.getContext("2d");
  	ctx.canvas.width  = window.innerWidth - 30;
  	ctx.canvas.height = window.innerHeight - 30;    
});

