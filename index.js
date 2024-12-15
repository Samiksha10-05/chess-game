const express=require('express');
const socket=require('socket.io');
const http=require('http');
const {Chess}=require('chess.js');
const path=require('path');

const app=express();
const server=http.createServer(app);
const io=socket(server);

const chess=new Chess();
let players={};
let currentplayer='w';

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname,'public')));

app.get('/', (req,res) =>{
    res.render('index.ejs', {title: "chess game"});
});

io.on("connection", function(uniquesocket){
    console.log("connected");
    





    // uniquesocket.on("helooo", function(){  a msg has been send from fronted
    //     io.emit("good morning"); 
    // });

    //assign role to players
    if(!players.white){         
        players.white=uniquesocket.id;
        uniquesocket.emit("playerRole", "w");
    }
    else if(!players.black){
        players.black=uniquesocket.id;
        uniquesocket.emit("playerRole", "b");
    }
    else{
        uniquesocket.emit("spectatorRole");
    }

    //if any player disconnect
    uniquesocket.on("disconnect", function(){  
        if(uniquesocket.id==players.white){
            delete players.white;
        }else if(uniquesocket.id==players.black){
            delete players.black;
        }
    });


    uniquesocket.on("move", (move) => {
        try{
            //checking for the valid turn white k time pr white chl payega and black k time pr black chl payega
            if(chess.turn()==="w" && uniquesocket.id!==players.white) return;
            if(chess.turn()==="b" && uniquesocket.id!==players.black) return;

            //now checking for the valid move if valid update gamestate
            const result =chess.move(move);
            if(result){
                currentplayer=chess.turn();
                io.emit("move", move);
                io.emit("boardState", chess.fen());     //fen tell about the currentstate of board
            }else{
                console.log("invalid move : ", move);
                uniquesocket.emit("invalid move", move);
            }
        }
        catch(err){
            console.log(err);
            uniquesocket.emit("invalid move : ", move);
        }
    });
});


server.listen(3000, function(){
    console.log("listening on  port 3000");
});


