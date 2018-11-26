//创建食物自执行函数
(function () {
    var elements = [];//保存食物
    //创建食物对象构造函数
    function Food(x, y, width, height, color) {
        //食物的宽高
        this.width = width || 20;
        this.height = height || 20;
        //坐标
        this.x = x || 0;
        this.y = y || 0; 
        this.color = color || 'green';
    }
    //讲生成食物放到原型中，在页面上显示食物
    //因为食物要在地图上显示，所以需要地图的参数map
    Food.prototype.init=function (map) {
        //先删除之前食物
        remove();
        var div = document.createElement('div');
        map.appendChild(div);
        //设置食物样式
        div.style.position = 'absolute';
        div.style.backgroundColor = this.color;
        div.style.width = this.width + 'px';
        div.style.height = this.height + 'px';
        //坐标要随机产生
        this.x = parseInt(Math.random() * (map.offsetWidth / this.width))*this.width;
        this.y = parseInt(Math.random() * (map.offsetHeight / this.height)) * this.height;
        div.style.left = this.x+'px';
        div.style.top = this.y + 'px';       
        //把div加入到数组中
        elements.push(div)
    };
    //删除食物--私有函数
    function remove(){
        //elements有食物
        for(var i=0;i<elements.length;i++){
            var ele=elements[i];
            //找到其父级元素，然后删除这个子元素
            ele.parentNode.removeChile(ele);
            //清除elements
            elements.splice(i,1);
        }
    }
    //将Food变成全局的，外面就可以访问， Food暴露给window
    window.Food = Food;
}());

//小蛇的自执行函数
(function(){
    var elements=[];//存放小蛇的临时数组
    function Snake(width,height,direction){
        //console.log(direction)
        //蛇每个部分的尺寸
        this.width=width||20;
        this.height=height||20;
        //蛇的身体
        this.body=[
            {x:3,y:2,color:'red'},//头
            { x: 2, y: 2, color: 'yellow' },//身体
            { x: 1, y: 2, color: 'yellow' }//身体
        ];
        //方向
        this.direction = direction || 'right';
    }


    //小蛇的初始化的方法
    Snake.prototype.init=function(map){
        //先删除之前的小蛇
        remove ();
        //循环遍历创建div

        for(var i=0;i<this.body.length;i++){
            //数组中每个元素都是一个对象
            var obj =this.body[i]
            //创建div
            var div= document.createElement('div')
            map.appendChild(div)  
            div.style.position='absolute';
            div.style.width=this.width+'px';
            div.style.height=this.height+'px';
            div.style.left = obj.x * this.width+'px';
            div.style.top = obj.y * this.height+'px';
            div.style.backgroundColor=obj.color;

            //方向暂时不定

            //把div加入到elements数组中，为了删除
            elements.push(div);
        }

    }

    //为原型添加方法-小蛇动起来
    Snake.prototype.move = function (food, map){
        //改变小蛇身体的坐标
        var i=this.body.length-1;
        for(;i>0;i--){
            this.body[i].x=this.body[i-1].x;
            this.body[i].y=this.body[i-1].y;
        }
        //判断方向--改变小蛇的头的坐标位置
        console.log('1:'+gm.direction)
        switch( gm.direction ){//动了这里
            case 'right':
                this.body[0].x+=1;
                break;
            case 'left':
                this.body[0].x -= 1;
                break;
            case 'top':
                this.body[0].y -= 1;
                break;
            case 'down':
                this.body[0].y += 1;
                break;                                            
        }

        //判断有没有吃到食物
        
        var headX=this.body[0].x*this.width;
        var headY = this.body[0].y * this.height;

        //小蛇的头部坐标与食物坐标一致
        if (headX == food.x && headY == food.y){
            console.log('吃掉了')
            //获取小蛇的最后的尾巴
            var last=this.body[this.body.length-1];
            //把最后的蛇尾复制一个，重新加入到小蛇的body中
            this.body.push({
                x:last.x,
                y:last.y,
                color:last.color
            });
            //删除食物，并重新食物初始化
            food.init(map);
        }

    }
    //删除小蛇的私有函数
    function remove(){
        //获取数组
        var i=elements.length-1;
        for(;i>=0;i--){
            //先从当前的子元素中找到该子元素的分级元素，然后再删除该子元素
            var ele=elements[i]
            //从map地图上删除这个子元素div
            ele.parentNode.removeChild(ele)
            elements.splice(i,1);
        }
    }
    //创建外部可访问的Snake
    window.Snake=Snake;

}());

//自调用函数--游戏对象
(function(){
    var that=null;
    function Game(map){
        this.food=new Food();//食物对象
        this.snake=new Snake();//小蛇对象
        this.map=map;//地图
        that=this;//保存当前的实例对象到that变量中--此时this就是that，以后调用这个函数的实例对象
    }
    //初始化游戏--可以设置小蛇和食物显示出来
    Game.prototype.init=function(){
        //初始化游戏
        //食物初始化 
        this.food.init(this.map);
        //小蛇初始化
        this.snake.init(this.map);
        //这行代卖后面不在这里写===-尽可能的保持一个方法做一件事
        /*《setInterval(function () {
            //定时器里的this是window，要重看10初始化对象
            that.snake.move(that.food, that.map)//document.querySelector('.map'));
            that.snake.init(that.map)//(document.querySelector('.map'));
        }, 150);》一个方法做一件事，所以这个移动的方法另写*/
        //调用按键的方法
        this.bindKey();
        //调用自动移动小蛇的方法
        this.runSnake(this.food,this.map);

    };
    
    //添加原型方法---设置小蛇可以自动的跑起来
    Game.prototype.runSnake=function(food,map){
        //自动的去移动
        var timeId=setInterval(function(){
            //此时的this是window
            //移动小蛇
            this.snake.move(food,map);
            //初始化小蛇
            this.snake.init(map);
            //横坐标的最大值
            var maxX=map.offsetWidth/this.snake.width;
            //纵坐标的最大值
            var maxY=map.offsetHeight/this.snake.height;
            //小蛇的头部坐标
            var headX=this.snake.body[0].x;
            var headY = this.snake.body[0].y;
            if (headY < 0 || headY >=maxY||headX < 0 || headX >= maxX){
                //撞墙了，停止计时器，结束游戏
                clearInterval(timeId)
                alert('Game over');
            }
        }.bind(that),150);//自执行函数中的this是window，
        //要改变this的指向就可以调用bind（），函数（）里面写要指向的对象（实例），本例中要指向gm这个事例对象
    };

    //添加原型方法--设置用户按键，改变小蛇移动方向
    Game.prototype.bindKey=function(){
        
        //获取用户按键参数，改变小蛇方向
        document.addEventListener('keydown',function(e){
            //这个事件的this是触发keydown的事件的对象元素，这个对象元素是document
            //所以值了直接写this就是document
            //获取按键的值，这里觉得采用饥人谷的方法，就可以直接看到，比较直观，黑马的都是数字
            switch(e.key){
                case 'a':this.direction='left';break;//这里要用的this是gm这个对象
                //所以也要用bind函数改变this的指向,否则指向的是document
                case 'd': this.direction = 'right'; break;
                case 'w': this.direction = 'top'; break;
                case 's': this.direction = 'down'; break;
            }
            console.log(that.direction)
        }.bind(that),false);
    };
    
    //把Game暴露给window,外部就可以访问Game对象了
    window.Game=Game;
}());

var gm = new Game(document.querySelector('.map'));
gm.init()
//外部测试代码
//var fd =new Food();
//fd.init(document.querySelector('.map'));
//var snake=new Snake()
//setInterval(function(){
 //   snake.init(document.querySelector('.map'));
 //   snake.move(fd, document.querySelector('.map'));
//},150);



