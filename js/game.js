$(document).ready(function() {
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
      return generatedSpeed * 1.5;
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
    function drawInstructions(){
      ctx.fillStyle = 'rgba(231, 83, 29, 0.93)';
      ctx.font = '14px sans-serif';
      ctx.fillText('Collect the fuel and power-ups. Dodge the asteroids. WASD to move.',canvas.width * 0.37, canvas.height * 0.25);
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
      ctx.fillStyle = 'rgb(55, 161, 22)';
      ctx.font = '14px sans-serif';
      ctx.fillText('Particle Slow is ready! Press E to warp time!',canvas.width * 0.2, canvas.height * 0.05);
    }
    function atomicShrinkMessage(){
      ctx.fillStyle = 'rgb(186, 35, 210)';
      ctx.font = '14px sans-serif';
      ctx.fillText('Atomic Shrink is ready! Press E to shrink!',canvas.width * 0.2, canvas.height * 0.05);
    }
    //need to fix new record**
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
    //callback that calls item spawns and tracks time
    function createItemInterval(){
      var counter = 0;
      var intervalId = setInterval(function(){
        if(!gameOver){
          var item;
          if(counter % 10 === 0 && counter != 0){
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
      draw: function(){
        ctx.fillStyle = 'rgb(136, 26, 203)';
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
        ctx.fillRect(this.x, this.y, this.width, this.height);
      }
    };
    //End Unique Game Objects------------------
    //interval for clock, item spawn, etc.
    createItemInterval();
    function draw(){
      ctx.clearRect(0,0, canvas.width, canvas.height);
      //initial game instructions
      if(time.amount < 3) drawInstructions();
      //player creation, movement, and out of bounds
      player.draw();
      move(player);
      if(outOfBounds(player)) drawWarning();
      isGameOver = false;
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
      //Powered up message instructions
      if(poweredUp){
        switch (player.power) {
          case 'quantum-blast':
          if (player.power === 'quantum-blast') quantumBlastMessage();
          break;
          case 'particle-slow':
          itemArray.forEach(function(item){
            if(player.power === 'particle-slow') particleSlowMessage();
          });
          break;
          case 'atomic-shrink':
          itemArray.forEach(function(item){
            if(player.power === 'atomic-shrink') atomicShrinkMessage();
          });
          break;
        }
      }
      //draw time and fuel last so its always on top
      time.draw();
      fuelBar.draw();
      if(fuelBar.amount === 0) gameOver = true;
      if(!gameOver)requestAnimationFrame(draw);
      if(gameOver) drawGameOver();
    }
    requestAnimationFrame(draw);
    //Game controls WASD movement
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
        //Power up using E
        if(poweredUp){
          switch (player.power) {
            case 'quantum-blast':
            itemArray = [];
            break;
            case 'particle-slow':
            itemArray.forEach(function(item){
              if(item.type === 'asteroid') item.speed *= 0.1;
            });
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
            break;
          }
          poweredUp = false;
          player.power = null;
        }
        break;
      }  /* Act on the event */
    });
  });
