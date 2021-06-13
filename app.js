const express = require('express');
const app = express();
const websocket = require('ws');
const parser = require('body-parser')
const path = require('path')
const wss = new websocket.Server({
    port: process.env.PORT || "4000"
})
const classes = require('./classes');
const e = require('express');
const events = require('events')
const roomCreater = classes.room;
var rooms = []


class emmiter extends events {

}

const customEmmiter = new emmiter;



app.use("/public", express.static(path.join(__dirname, "client")));

wss.on('connection', (ws) => {
    ws.on('message', (data) => {
        data = JSON.parse(data)
        if (data.objective == "getRoomCode") {
            console.log("room create garne")
            sendRoomCode(ws, data)
        } else if (data.objective == "joinRoom") {
            console.log("room Join Hanne HO")
            joinRoom(ws, data)
        } else if (data.objective == "getPlayers") {
            sendPlayerList(ws, data)
        } else if (data.objective == "registerClick") {
            registerClick(ws, data)
        } else if (data.objective == "forSync") {
            sync(ws, data.turn, data.code)
        }
    })
})

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "index.html"))
})



function sendRoomCode(ws, data) {
    //console.log(ws)
    let rand = 0;
    rand = Math.floor((Math.random() * 10000))
    rand = rand.toString();
    while (rand.length < 4) {
        rand += "0"
    }
    tempRoom = new roomCreater(rand);
    tempRoom.hostJoined(data.playerName)
    rooms.push(tempRoom);
    ws.send(JSON.stringify({
        code: rand,
        objective: 'sendRoomCode'
    }))
}

function sendPlayerList(ws, data) {
    let roomCode = data.roomCode;
    let selectedRoom = findRoom(roomCode);
    ws.send(JSON.stringify({
        host: selectedRoom.host.name,
        guest: selectedRoom.guest.name,
        roomCode: roomCode,
        objective: "sendPlayerList"
    }))
    customEmmiter.on("joined", (guest) => {
        ws.send(JSON.stringify({
            objective: "update",
            guest: guest
        }))
    })
}
function joinRoom(ws, data) {
    let arr = rooms.map((e) => {
        return e.code;
    })
    let selectedRoom = findRoom(data.roomCode)
    if (belongsTo(data.roomCode.toString(), arr)&&(!selectedRoom.guest.joined)) {
        let selectedRoom = findRoom(data.roomCode)
        selectedRoom.guestJoined(data.playerName)

        customEmmiter.emit("joined", data.playerName);
        ws.send(JSON.stringify({
            objective: "codeFound",
            code: data.roomCode
        }))
    } else {
        selectedRoom.host.ws.send(JSON.stringify({
            message: "no room",
            objective: "error"
        }))
        // selectedRoom.host.ws.send(JSON.stringify({
        //     message: "no room",
        //     objective: "error"
        // }))
    }
}

function sync(ws, turn, code) {
    let selectedRoom = findRoom(code);
    if (turn == "X") {
        selectedRoom.host.ws = ws;
    } else if (turn == "C") {
        selectedRoom.guest.ws = ws;
    }
}


function registerClick(ws, data) {
    let selectedRoom = findRoom(data.code);
    let clicked = data.clicked;
    let arr = selectedRoom.occupied.map((e) => {
        return e[0]
    })
    // console.log(selectedRoom.check(),selectedRoom.turn,selectedRoom.allowDraw)
    
    if (selectedRoom.turn == data.turn && !(belongsTo(clicked, arr)) && selectedRoom.allowDraw) {
        selectedRoom.changeTurn();
        selectedRoom.occupied.push([clicked, data.turn])
        selectedRoom.changeOccupiedToState()
        selectedRoom.update(selectedRoom.state)
        let win = selectedRoom.check()
        console.log(win)
        ws.send(JSON.stringify({
            objective:"log",
            data:[selectedRoom,selectedRoom.check()]
        }))
        // ws.send(JSON.stringify({
        //     check: selectedRoom.check(),
        //     room: selectedRoom
        // }))
        if (win != "continue") {
            let winner;
            if(win=="X"){
                winner=selectedRoom.host.name;
            }else if(win == "C"){
                winner=selectedRoom.guest.name;
            }
            let string = JSON.stringify({
                objective: "forSync",
                turn: data.turn,
                clicked: data.clicked,
                win: winner
            })
            selectedRoom.host.ws.send(string)
            selectedRoom.guest.ws.send(string)
            selectedRoom.allowDraw = false;
            //console.log(selectedRoom.allowDraw)
        } else {
            let string = JSON.stringify({
                objective: "forSync",
                turn: data.turn,
                clicked: data.clicked,
                win:"none"
            })
            selectedRoom.host.ws.send(string)
            selectedRoom.guest.ws.send(string)
        }
    } else {
        
        console.log("why?")
    }
}
customEmmiter.on('clickVerified', (d, c) => {
    console.log(d, c);
})


//misc functions





function belongsTo(e, arr) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] == e) {
            return true;
        }
    }
    return false;
}

function findRoom(code) {
    let temp
    for (let i = 0; i < rooms.length; i++) {
        temp = rooms[i];
        if (temp.code == code) {
            temp = i;
            break;
        }
    }
    return rooms[temp];
}


const port = process.env.PORT || '3000';
app.listen(port, () => console.log(`Server started on Port ${port}`));