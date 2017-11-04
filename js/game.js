$(document).ready(function() {
  window.onblur = function(){
    gameOver = true;
  };
  var music = document.getElementById('game-music');
  $('nav').toggle();
  music.play();
  var canvas = document.querySelector('.my-game');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  var ctx = canvas.getContext('2d');
  var intangibleEnd = null;
  var gameOver = false;
  var itemArray = [];
  var poweredUp = false;
  var cloakTime = 5;
  var quasarEnd = null;
  // add here first to design a new powerType
  var powerTypes = ['quantum-blast', 'particle-slow', 'atomic-shrink', 'antimatter-cloak', 'quasar-beam' ];
  //Unique Game Objects----------------
  var verticalQuasar = {
    height: null,
    width: null,
    x: null,
    y: null,
  };
  var horizontalQuasar = {
    height: null,
    width: null,
    x: null,
    y: null,
  };
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
    y: canvas.height * 0.9,
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
    intangible:false,
    quasarActivated: false,
    //streak for lasting a long time
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
    //player turns color of powerup collected
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
          case 'antimatter-cloak':
          ctx.fillStyle = 'black';
          break;
          case 'quasar-beam':
          ctx.fillStyle = "rgb(164, 0, 0)";
          break;
          default:
          break;
        }
      }
      //glow color assignment below for streak
      if (player.streak !== null){
        switch (player.streak) {
          case 'heating-up':
          ctx.shadowBlur = 40;
          ctx.shadowColor = "rgba(0, 252, 10, 1)";
          break;
          case 'on-fire':
          ctx.shadowBlur = 40;
          ctx.shadowColor =  "rgb(6, 248, 255)";
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
      if(player.intangible) cloakActivated();
      ctx.fillRect(this.x, this.y, this.width, this.height);
      //make sure shadows don't draw on everything
      ctx.shadowBlur = 0;
    }
  };
  //End Unique Game Objects------------------
  //call interval for clock and item spawn
  createItemInterval();
  //game render
  requestAnimationFrame(draw);
  function draw(){
    ctx.clearRect(0,0, canvas.width, canvas.height);
    //player creation, movement, and out of bounds
    if(player.quasarActivated) generateQuasar();
    player.checkStreak();
    player.draw();
    checkFuelBar();
    checkIntangibility();
    //Iterate through array of obstacles---------
    obstacleIterator();
    //draw UI
    time.draw();
    fuelBar.draw();
    if(!gameOver)requestAnimationFrame(draw);
    if(gameOver){
      music.pause();
      drawText('game-over');
      drawText('final-time');
      drawText('try-again');
      $('nav').fadeToggle();
      $('canvas').css('cursor', 'default');
    }
  }
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
      //Power up abilities and sounds
      if(poweredUp){
        switch (player.power) {
          case 'quantum-blast':
          itemArray.forEach(function(item, index){
            if(Math.abs(player.x - item.x) < generateRandom(player.width * 40, player.width * 15) &&
            Math.abs(player.y - item.y) < generateRandom(player.height * 40, player.height * 15) &&
            item.type == "asteroid"){
              itemArray.splice(index, 1);
            }
          });
          document.getElementById('quantum-blast-sound').play();
          break;
          case 'particle-slow':
          itemArray.forEach(function(item){
            if(item.type === 'asteroid') item.speed *= 0.24;
          });
          document.getElementById('particle-slow-sound').play();
          break;
          case 'atomic-shrink':
          itemArray.forEach(function(item, index){
            if(item.type === 'asteroid'){
              item.height *= 0.4;
              item.width *= 0.4;
              if(item.height < 7 || item.width < 7){
                itemArray.splice(index, 1);
              }
            }
          });
          document.getElementById('atomic-shrink-sound').play();
          break;
          case 'antimatter-cloak':
          //10 second intangibility set here
          intangibleEnd =  time.amount + cloakTime;
          player.intangible = true;
          document.getElementById('antimatter-cloak-sound').play();
          break;
          case 'quasar-beam':
          //set quasar beam duration here
          quasarEnd = time.amount + 2;
          player.quasarActivated = true;
          document.getElementById('quasar-beam-sound').play();
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
  function generateQuasar(){
    if(quasarEnd > time.amount){
      verticalQuasar.height = canvas.height;
      verticalQuasar.width = player.width;
      verticalQuasar.x = player.x;
      verticalQuasar.y = 0;
      horizontalQuasar.height= player.height;
      horizontalQuasar.width = canvas.width;
      horizontalQuasar.x = 0;
      horizontalQuasar.y = player.y;
      ctx.shadowBlur = 40;
      ctx.shadowColor = "rgb(164, 0, 0)";
      ctx.fillStyle = 'rgb(164, 0, 0)';
      ctx.fillRect(verticalQuasar.x, verticalQuasar.y, verticalQuasar.width, verticalQuasar.height);
      ctx.fillRect(horizontalQuasar.x, horizontalQuasar.y, horizontalQuasar.width, horizontalQuasar.height);
      ctx.shadowBlur = 0;
    }else{
      quasarEnd = null;
      player.quasarActivated = false;
      verticalQuasar.height = null;
      verticalQuasar.width = null;
      verticalQuasar.x = null;
      verticalQuasar.y = null;
      horizontalQuasar.height= null;
      horizontalQuasar.width = null;
      horizontalQuasar.x = null;
      horizontalQuasar.y = null;
    }
  }
  function checkIntangibility(){
    if(player.intangible && time.amount > intangibleEnd){
          player.intangible = false;
          intangibleEnd = null;
    }
  }
  function cloakActivated(){
    ctx.fillStyle = 'rgba(104, 13, 236, 0.30)';
  }
  function obstacleIterator(){
    itemArray.forEach(function(item, index){
      item.draw();
      move(item);
      //destroy out of bounds items
      if(outOfBounds(item)){
        itemArray.splice(index, 1);
      }
      if(item.crashWith(player)){
        if(player.intangible && item.type === 'asteroid') itemArray.splice(index,1);
        if(item.type === 'asteroid' && !player.intangible){
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
      if(player.quasarActivated && item.type !== 'power-up' && ( item.crashWith(verticalQuasar) || item.crashWith(horizontalQuasar) ) ){
        itemArray.splice(index,1);
      }
    });
  }
  function checkFuelBar(){
    if(fuelBar.amount > 0) move(player);
    if(fuelBar.amount < 3 && fuelBar.amount > 0) drawText('low-fuel');
    if(fuelBar.amount === 0)drawText('no-fuel');
  }
  //spawns items on intervals and add to item array
  function createItemInterval(){
    var counter = 0;
    var intervalId = setInterval(function(){
      if(!gameOver){
        counter++;
        if(counter % 10 === 0){
          createItem('power-up');
        }
        if(counter % 12 === 0){
          if(fuelBar.amount > 0)fuelBar.amount--;
        }
        if(counter % 4 === 0){
          createItem('fuel');
          time.amount++;
        }
        //scaled difficulty
        for(var i = time.amount;i > 0; i-=10){
          if (counter % 12 === 0) createItem('asteroid');
          if (counter % 120 === 0) createItem('power-up');
          if (counter % 48 === 0) createItem('fuel');
        }
        //normal mode
        createItem('asteroid');
      }else{
        clearInterval(intervalId);
      }
    }, 250);
  }
  //item creation
  function createItem(itemType){
    var item = new Item(itemType);
    item.spawn();
    itemArray.push(item);
  }
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
    switch (this.type) {
      case 'asteroid':
      ctx.fillStyle = 'rgb(121, 121, 122)';
      break;
      case 'fuel':
      ctx.fillStyle = 'rgb(231, 163, 31)';
      break;
      case 'power-up':
      switch (this.powerType) {
        case 'quantum-blast':
        ctx.fillStyle = 'rgb(66, 138, 223)';
        break;
        case 'particle-slow':
        ctx.fillStyle = 'rgb(55, 161, 22)';
        break;
        case 'atomic-shrink':
        ctx.fillStyle = 'rgb(186, 35, 210)';
        break;
        case 'antimatter-cloak':
        ctx.fillStyle = 'black';
        break;
        case 'quasar-beam':
        ctx.fillStyle = 'rgb(164, 0, 0)';
        break;
      }
      break;
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
  });
