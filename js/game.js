$(document).ready(function() {
//useful global function
function generateRandom(max, min){
  return Math.random() * (max - min) + min;
}
//Game Objects
  //this item can be fuel, an asteroid, or an enemy
  function Item(type){
    this.type = type;
    this.height = generateDimension(type);
    this.width = generateDimension(type);
    this.speed = generateRandom(2, 0.2);
  }
  Item.prototype.draw = function(){
    if(this.type === 'asteroid'){
      ctx.fillStyle = 'rgb(121, 121, 122)';
    }else if(this.type === 'fuel'){
      ctx.fillStyle = 'rgb(231, 163, 31)';
    }
  ctx.fillRect(this.x, this.y, this.width, this.height);
};
Item.prototype.outOfBounds = function(){
    if ( this.x > canvas.width ||
         this.y > canvas.height ||
         this.x < 0 ||
         this.y < 0 )
        {
         return true;
       }else{
         return false;
       }
};
Item.prototype.spawn = function(){
    //decide on a boundary wall to spawn on
    var wall = (Math.floor(Math.random()*3));
    //spawn somewhere on chosen wall
    switch (wall) {
      //spawns on top wall, moving down
      case 0:
      this.x = generateRandom(canvas.width, 0);
      this.y = 0;
      this.direction = 'down';
      break;
      //spawn on right wall, moving left
      case 1:
      this.x = canvas.width;
      this.y = generateRandom(canvas.height, 0);
      this.direction = 'left';
      break;
      //spawn on bottom wall, moving up
      case 2:
      this.x = generateRandom(canvas.width, 0);
      this.y = canvas.height;
      this.direction = 'up';
      break;
      //spawn on left wall, moving right
      case 3:
      this.x = 0;
      this.y = generateRandom(canvas.height, 0);
      this.direction = 'right';
      break;
    }
  };
  Item.prototype.crashWith = function(obj){
    return getBottom(this) >= getTop(obj) &&
           getTop(this) <= getBottom(obj) &&
           getRight(this) >= getLeft(obj) &&
           getLeft(this) <= getRight(obj);
  };
  function getTop(obj){
    return obj.y;
  }
  function getBottom(obj){
    return obj.y + obj.height;
  }
  function getLeft(obj){
    return obj.x;
  }
  function getRight(obj){
    return obj.x + obj.width;
  }
  function move(obj){
      switch (obj.direction) {
        case 'left':
        obj.x -= obj.speed;
        break;
        case 'down':
        obj.y += obj.speed;
        break;
        case 'up':
        obj.y -= obj.speed;
        break;
        case 'right':
        obj.x += obj.speed;
        break;
        default:
        break;
      }
    }
function generateDimension(type){
  var maxSize;
  var minSize;
  if(type === 'asteroid'){
    maxSize = 50;
    minSize = 10;
    return generateRandom(maxSize, minSize);
  }else if(type === 'fuel'){
    return 10;
  }
}

//Game rendering
  var canvas = document.querySelector('.my-game');
  canvas.width = window.innerWidth - 30;
  canvas.height = window.innerHeight - 30;
  var ctx = canvas.getContext('2d');
  var gameOver = false;
  var itemArray = [];
  var fuelBar = {
    amount: 10,
    x: canvas.width * 0.9,
    y: canvas.height * 0.9,
    draw: function(){
      ctx.fillStyle = 'rgb(219, 241, 37)';
      ctx.fillRect(this.x, this.y, this.amount * 10, 50);
    }
  };
  var player = {
    x: canvas.width/2,
    y: canvas.height/2,
    height: 40,
    width:40,
    speed: 3,
    direction:'',
    draw: function(){
      ctx.fillStyle = 'rgb(99, 21, 177)';
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  };
  createItemInterval();
  function draw(){
    ctx.clearRect(0,0, canvas.width, canvas.height);
    player.draw();
    move(player);
    fuelBar.draw();
    isGameOver = false;
    if(fuelBar.amount === 0) gameOver = true;
    itemArray.forEach(function(item, index){
      item.draw();
      move(item);
      if(item.outOfBounds()){
        itemArray.splice(index, 1);
      }
      if(item.crashWith(player)){
        if(item.type === 'asteroid'){
          gameOver = true;
        }else if( item.type === 'fuel'){
          if(fuelBar.amount < 10) fuelBar.amount++;
          itemArray.splice(index, 1);
        }
      }
    });
    if(!gameOver)requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);

  function createItemInterval(){
    var counter = 0;
    var intervalId = setInterval(function(){
      if(!gameOver){
        var item;
        if(counter % 4 ===0){
          fuelBar.amount--;
        }
        if(counter % 2 === 0){
          item = new Item('fuel');
          item.spawn();
          itemArray.push(item);
        }
        item = new Item('asteroid');
        item.spawn();
        itemArray.push(item);
        counter++;
      }else{
        clearInterval(intervalId);
      }
    }, 500);
  }
//Game controls
$(document).keydown(function(event) {
  switch (event.keyCode) {
    //move left
    case 65:
    player.direction = 'left';
    break;
    // move up
    case 87:
    player.direction = 'up';
    break;
    case 68:
    //move right
    player.direction = 'right';
    break;
    //move down
    case 83:
    player.direction = 'down';
    break;
  }  /* Act on the event */
});

});
