$(document).ready(function() {
//Item Constructor and prototypes------
  function Item(type){
    this.type = type;
    this.height = generateDimension(type);
    this.width = generateDimension(type);
    this.speed = generateSpeed();
    this.powerType = this.generatePowerType();
  }
  Item.prototype.generatePowerType = function(){
    if(this.type !== 'asteroid'){
      var index = Math.floor(generateRandom(powerTypes.length,0));
      if(index === powerTypes.length) index--;
      return powerTypes[index];
    }else{
      return null;
    }
  };
  Item.prototype.draw = function(){
    if(this.type === 'asteroid'){
      ctx.fillStyle = 'rgb(121, 121, 122)';
    }else if(this.type === 'fuel'){
      ctx.fillStyle = 'rgb(231, 163, 31)';
    }else if(this.type === 'power-up'){
      if(this.powerType === 'quantum-blast'){
        ctx.fillStyle = 'rgb(66, 138, 223)';
      }else if(this.powerType === 'particle-slow'){
        ctx.fillStyle = 'rgb(24, 101, 12)';
      }

    }
  ctx.fillRect(this.x, this.y, this.width, this.height);
};
Item.prototype.spawn = function(){
    //decide on a boundary wall to spawn on
    var wall = Math.floor(generateRandom(4, 0));
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
      case 4:
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
  //General Functions--------------
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
  }else if(type === 'fuel' || type === 'power-up'){
    return 10;
  }
}
function outOfBounds(obj){
    if ( obj.x > canvas.width ||
         obj.y > canvas.height ||
         obj.x < 0 ||
         obj.y < 0 )
        {
         return true;
       }else{
         return false;
       }
}
function drawInstructions(){
  ctx.fillStyle = 'rgba(231, 83, 29, 0.93)';
  ctx.font = '14px sans-serif';
  ctx.fillText('Collect the fuel and dodge the asteroids. WASD to move.',canvas.width * 0.38, canvas.height * 0.25);
}
function drawWarning(){
  ctx.fillStyle = 'rgba(231, 83, 29, 0.93)';
  ctx.font = '14px sans-serif';
  ctx.fillText('Warning: Entering Deep Space. Turn Back!',canvas.width * 0.4, canvas.height * 0.05);
}
function quantumBlastMessage(){
  ctx.fillStyle = 'rgb(66, 138, 223)';
  ctx.font = '14px sans-serif';
  ctx.fillText('Quantum Blast is ready! Press E to obliterate!',canvas.width * 0.2, canvas.height * 0.05);
}
function particleSlowMessage(){
  ctx.fillStyle = 'rgb(24, 101, 12)';
  ctx.font = '14px sans-serif';
  ctx.fillText('Particle Slow is ready! Press E to warp time!',canvas.width * 0.2, canvas.height * 0.05);
}

function drawGameOver(){
  var newRecord = false;
  var record = $('.record').html;
  console.log(record);
  ctx.fillStyle = 'rgba(231, 83, 29, 0.93)';
  ctx.font = '14px sans-serif';
  if(fuelBar.amount === 0){
    ctx.fillText('Game Over! You ran out of Fuel!',canvas.width * 0.42, canvas.height * 0.35);
  }else{
    ctx.fillText('Game Over!',canvas.width * 0.48, canvas.height * 0.35);
  }
  if(time.amount > record) newRecord = true;
  if(newRecord){
    var name = prompt('New Record! Enter your name to be immortalized.');
    $('.record-holder').html(name);
  }
}
function createItemInterval(){
  var counter = 0;
  var intervalId = setInterval(function(){
    if(!gameOver){
      var item;
      if(counter % 14 === 0 && counter != 0){
        item = new Item('power-up');
        item.spawn();
        itemArray.push(item);
      }
      if(counter % 12 === 0 && counter != 0){
        fuelBar.amount--;
      }
      if(counter % 4 === 0 && counter != 0){
        item = new Item('fuel');
        item.spawn();
        itemArray.push(item);
        time.amount++;
      }
      item = new Item('asteroid');
      item.spawn();
      itemArray.push(item);
      counter++;
    }else{
      clearInterval(intervalId);
    }
  }, 250);
}
function generateRandom(max, min){
  return Math.random() * (max - min) + min;
}
function generateSpeed(){
  var maxSpeed = 2;
  var minSpeed = 0.2;
  var generatedSpeed = generateRandom(maxSpeed, minSpeed);
  if(this.type === 'power-up'){
    return generatedSpeed * 3;
  }else{
    return generatedSpeed;
  }
}
//Game rendering
  var canvas = document.querySelector('.my-game');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  var ctx = canvas.getContext('2d');
  var gameOver = false;
  var itemArray = [];
  var poweredUp = false;
  var powerTypes = ['quantum-blast', 'particle-slow'];
//Unique Game Objects----------------
  var time = {
    amount: 0,
    x:canvas.width * 0.95,
    y: canvas.height * 0.05,
    draw: function(){
      ctx.fillStyle = 'black';
      ctx.font = '24px sans-serif';
      ctx.fillText(this.amount,this.x, this.y);
    }
  };
  var fuelBar = {
    amount: 10,
    x: canvas.width * 0.9,
    y: canvas.height * 0.8,
    draw: function(){
      if(this.amount > 7){
        ctx.fillStyle = 'rgb(41, 236, 31)';
      }else if(this.amount > 3){
        ctx.fillStyle = 'rgb(219, 241, 37)';
      }else{
        ctx.fillStyle = 'rgb(244, 16, 16)';
      }
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
    power:null,
    draw: function(){
      if(poweredUp){
        if(this.power === 'quantum-blast'){
          ctx.fillStyle = 'rgb(66, 138, 223)';
        }else if(this.power === 'particle-slow'){
          ctx.fillStyle = 'rgb(24, 101, 12)';
        }
      }else{
        ctx.fillStyle = 'rgb(99, 21, 177)';
      }
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  };
  //End Unique Game Objects------------------
  createItemInterval();
  function draw(){
    ctx.clearRect(0,0, canvas.width, canvas.height);
    player.draw();
    move(player);
    isGameOver = false;
    if(fuelBar.amount === 0) gameOver = true;
    //Iterate through array of obstacles---------
    itemArray.forEach(function(item, index){
      item.draw();
      move(item);
      if(outOfBounds(item)){
        itemArray.splice(index, 1);
      }
      if(item.crashWith(player)){
        if(item.type === 'asteroid'){
          gameOver = true;
        }else if( item.type === 'fuel'){
          if(fuelBar.amount < 10) fuelBar.amount++;
          itemArray.splice(index, 1);
        }else if(item.type === 'power-up'){
          poweredUp = true;
          player.power = item.powerType;
          itemArray.splice(index, 1);
        }
      }
    });
    if(time.amount < 3) drawInstructions();
    if(outOfBounds(player)) drawWarning();
    if (player.power === 'quantum-blast') quantumBlastMessage();
    if(player.power === 'particle-slow') particleSlowMessage();
    time.draw();
    fuelBar.draw();
    if(!gameOver)requestAnimationFrame(draw);
    if(gameOver) drawGameOver();
  }

  requestAnimationFrame(draw);

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
    case 69:
    if(poweredUp){
      if(player.power === 'quantum-blast'){
        itemArray = [];
      }else if(player.power === 'particle-slow'){
        itemArray.forEach(function(item){
          item.speed *= 0.1;
        });
      }
      poweredUp = false;
      player.power = null;
    }
    break;
  }  /* Act on the event */
});

});
