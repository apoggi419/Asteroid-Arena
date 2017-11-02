$(document).ready(function() {
  var music = document.getElementById('game-music');
  music.play();
  //Item Constructor and prototypes------
  function Item(type){
    this.type = type;
    this.height = generateDimension(type);
    this.width = generateDimension(type);
    this.speed = this.generateSpeed();
    this.powerType = this.generatePowerType();
  }
  //chooses a random powerType to assign to the item if its a power-up
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
        ctx.fillStyle = 'rgb(55, 161, 22)';
      }else if(this.powerType === 'atomic-shrink')
      ctx.fillStyle = 'rgb(186, 35, 210)';
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
  //returns true if item crashes into player
  Item.prototype.crashWith = function(obj){
    return getBottom(this) >= getTop(obj) &&
    getTop(this) <= getBottom(obj) &&
    getRight(this) >= getLeft(obj) &&
    getLeft(this) <= getRight(obj);
  };
  //power-ups are faster
  Item.prototype.generateSpeed = function(){
    var maxSpeed = 2;
    var minSpeed = 0.2;
    var generatedSpeed = generateRandom(maxSpeed, minSpeed);
    if(this.type === 'power-up'){
      return generatedSpeed * 1.25;
    }else{
      return generatedSpeed;
    }
  };
  //dimension and generation functions--------------
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
      if(obj.x >= 0)
      obj.x -= obj.speed;
      break;
      case 'down':
      if(obj.y <= canvas.height)
      obj.y += obj.speed;
      break;
      case 'up':
      if(obj.y >= 0)
      obj.y -= obj.speed;
      break;
      case 'right':
      if(obj.x <= canvas.width)
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
      minSize = 20;
      return generateRandom(maxSize, minSize);
    }else{
      return 10;
    }
  }
  function generateRandom(max, min){
    return Math.random() * (max - min) + min;
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
    //Text instruction functions-------------
    function drawText(name){
      var messages =[
        {
          name: 'game-over',
          fillStyle: 'black',
          fillText: 'Game Over',
          x: canvas.width / 2,
          y: canvas.height / 4
        },
        {
          name: 'low-fuel',
          fillStyle: 'rgb(251, 17, 10)',
          fillText: 'Warning: Low Fuel!',
          x: canvas.width / 2,
          y: canvas.height / 6
        },
        {
          name: 'no-fuel',
          fillStyle: 'rgb(251, 17, 10)',
          fillText: 'Out of Fuel',
          x: canvas.width / 2,
          y: canvas.height / 6
        },
        {
          name: 'try-again',
          fillStyle: 'black',
          fillText: 'Press R to try again.',
          x: canvas.width / 2,
          y: canvas.height / 2
        },
        {
          name: 'final-time',
          fillStyle: 'black',
          fillText: 'You lasted ' + time.amount + ' seconds in the arena!',
          x: canvas.width / 2,
          y: canvas.height / 2.5
        },
      ];
      var currentMsg;
      messages.forEach(function(message){
        if(name === message.name){
          currentMsg = message;
        }
      });
      ctx.fillStyle = currentMsg.fillStyle;
      if(currentMsg.name === 'game-over'){
        ctx.font = '48px sans-serif';
      }else{
        ctx.font = '24px sans-serif';
      }
      ctx.fillStyle = currentMsg.fillStyle;
      ctx.textAlign = 'center';
      ctx.fillText(currentMsg.fillText,currentMsg.x, currentMsg.y);
    }
    function createItemInterval(){
      var counter = 0;
      var intervalId = setInterval(function(){
        //drawFX here
        if(!gameOver){
          var item;
          if(counter % 10 === 0 && counter != 0){
            item = new Item('power-up');
            item.spawn();
            itemArray.push(item);
          }
          if(counter % 12 === 0 && counter != 0){
            if(fuelBar.amount > 0)fuelBar.amount--;
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
          //hard mode after 120 seconds---------
          if(time.amount > 120){
            item = new Item('asteroid');
            item.spawn();
            itemArray.push(item);
          }
        }else{
          clearInterval(intervalId);
        }
      }, 250);
    }
    //Game rendering
    var canvas = document.querySelector('.my-game');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    var ctx = canvas.getContext('2d');
    var gameOver = false;
    var itemArray = [];
    var poweredUp = false;
    // add here first to design a new powerType
    var powerTypes = ['quantum-blast', 'particle-slow', 'atomic-shrink' ];
    //Unique Game Objects----------------
    // this just keeps the current trial time
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
    //fuel bar runs out, you lose
    var fuelBar = {
      amount: 10,
      x: canvas.width * 0.9,
      y: canvas.height * 0.8,
      draw: function(){
        if(this.amount > 7){
          ctx.fillStyle = 'rgba(41, 236, 31, 0.64)';
        }else if(this.amount > 3){
          ctx.fillStyle = 'rgba(219, 241, 37, 0.63)';
        }else{
          ctx.fillStyle = 'rgba(244, 16, 16, 0.68)';
        }
        ctx.fillRect(this.x, this.y, this.amount * 10, 50);
      }
    };
    //controlled player object
    var player = {
      x: canvas.width/2,
      y: canvas.height/2,
      height: 30,
      width:30,
      speed: 3,
      direction:'',
      power:null,
      streak:null,
      checkStreak: function(){
        if(time.amount > 90){
          player.streak = 'god';
        }else if(time.amount > 60){
          player.streak = 'unstoppable';
        }else if(time.amount > 40){
          player.streak = 'on-fire';
        }else if(time.amount > 20){
          player.streak = 'heating-up';
        }else{
          player.streak = null;
        }
      },
      draw: function(){
        ctx.fillStyle = 'rgb(104, 13, 236)';
        if(poweredUp){
          switch (this.power) {
            case 'quantum-blast':
            ctx.fillStyle = 'rgb(66, 138, 223)';
            break;
            case 'particle-slow':
            ctx.fillStyle = 'rgb(55, 161, 22)';
            break;
            case 'atomic-shrink':
            ctx.fillStyle = 'rgb(186, 35, 210)';
            break;
            default:
            break;
          }
        }
        if (player.streak !== null){
          switch (player.streak) {
            case 'heating-up':
            ctx.shadowBlur = 40;
            ctx.shadowColor = "rgb(0, 0, 0)";
            break;
            case 'on-fire':
            ctx.shadowBlur = 40;
            ctx.shadowColor =  "rgb(104, 13, 236)";
            break;
            case 'unstoppable':
            ctx.shadowBlur = 40;
            ctx.shadowColor = "rgb(255, 0, 0)";
            break;
            case 'god':
            ctx.shadowBlur = 40;
            ctx.shadowColor = 'rgb(255, 244, 0)';
            break;
          }
        }
        ctx.fillRect(this.x, this.y, this.width, this.height);
        if(time.amount < 120 ){
          ctx.shadowBlur = 0;
        }
      }
    };
    //End Unique Game Objects------------------
    //interval for clock, item spawn, etc.
    createItemInterval();
    function draw(){
      ctx.clearRect(0,0, canvas.width, canvas.height);
      //player creation, movement, and out of bounds
      player.checkStreak();
      player.draw();
      if(fuelBar.amount > 0) move(player);
      if(fuelBar.amount < 3 && fuelBar.amount > 0) drawText('low-fuel');
      if(fuelBar.amount === 0)drawText('no-fuel');
      //Iterate through array of obstacles---------
      itemArray.forEach(function(item, index){
        item.draw();
        move(item);
        //destroy out of bounds items
        if(outOfBounds(item)){
          itemArray.splice(index, 1);
        }
        if(item.crashWith(player)){
          if(item.type === 'asteroid'){
            gameOver = true;
            document.getElementById('game-over-sound').play();
          }else if(item.type === 'fuel'){
            if(fuelBar.amount < 10) fuelBar.amount++;
            itemArray.splice(index, 1);
          }else if(item.type === 'power-up'){
            poweredUp = true;
            player.power = item.powerType;
            itemArray.splice(index, 1);
          }
        }
      });
      time.draw();
      fuelBar.draw();
      if(!gameOver)requestAnimationFrame(draw);
      if(gameOver){
        music.pause();
        drawText('game-over');
        drawText('final-time');
        drawText('try-again');
      }
    }
    requestAnimationFrame(draw);
    //Game controls WASD movement
    $(document).keydown(function(event) {
      event.preventDefault();
      switch (event.keyCode) {
        case 82:
        if(gameOver){
          location.reload();
        }
        break;
        //move left
        case 65:
        case 37:
        player.direction = 'left';
        break;
        // move up
        case 87:
        case 38:
        player.direction = 'up';
        break;
        case 68:
        case 39:
        //move right
        player.direction = 'right';
        break;
        //move down
        case 83:
        case 40:
        player.direction = 'down';
        break;
        case 69:
        case 32:
        //Power up using E
        if(poweredUp){
          var end =  time.amount + 4;
          switch (player.power) {
            case 'quantum-blast':
            itemArray.forEach(function(item, index){
              if(Math.abs(player.x - item.x) < player.width * 30 &&
                Math.abs(player.y - item.y) < player.height * 30 &&
                item.type == "asteroid"){
                itemArray.splice(index, 1);
              }
            });
            document.getElementById('quantum-blast-sound').play();
            break;
            case 'particle-slow':
            itemArray.forEach(function(item){
              if(item.type === 'asteroid') item.speed *= 0.3;
            });
            document.getElementById('particle-slow-sound').play();
            break;
            case 'atomic-shrink':
            itemArray.forEach(function(item, index){
              if(item.type === 'asteroid'){
                item.height *= 0.3;
                item.width *= 0.3;
                if(item.height < 7 || item.width < 7){
                  itemArray.splice(index, 1);
                }
              }
            });
            document.getElementById('atomic-shrink-sound').play();
            break;
          }
          poweredUp = false;
          // drawFX(player.power);
          player.power = null;
          //used for power-up visual fx
        }
        break;
      }  /* Act on the event */
    });
  });
