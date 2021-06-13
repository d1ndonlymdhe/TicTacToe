//const { room } = require("../../classes");

//const { room } = require("../../classes");
const ws = new WebSocket("wss://arcane-oasis-56554.herokuapp.com/")
var createButton = document.getElementById("createRoom");
var joinButton = document.getElementById("join")
var turn;
var roomCode = 0;
ws.addEventListener('connection', () => {
    console.log("connected")
})


ws.addEventListener('message', (message) => {
    message = JSON.parse(message.data);
    let objective = message.objective;
    //console.log(message)
    if (objective == "sendRoomCode") {
        roomCodeRecieved(message.code)
    } else if (objective == "codeFound") {
        roomCodeRecieved(message.code)
    } else if (objective == "sendPlayerList") {
        transitionToSecond(message.host, message.guest, message.roomCode)
    } else if (objective == "update") {
        console.log("ok")
        document.getElementById("guest").innerHTML = message.guest;
        toggleHidden(document.getElementById("waiting"))
        turn = "X"

        ws.send(JSON.stringify({
            objective: "forSync",
            code: roomCode,
            turn: turn
        }))
    } else if (objective == "forSync") {
        console.log(message)
        draw(message.turn, message.clicked)
        if(message.win != "none"){
            setTimeout(()=>{
                endScreen(message.win)
            },500)
        }
    } else if (objective == "result") {
        document.write(message.data + "has won the game")
    }else if(objective == "log"){
        console.log(message.data)
    } 
    else {
        console.log(message.message)
    }
})

//HANDLE CREATE
createButton.addEventListener("click", () => {
    let playerName = document.querySelectorAll("input")[0]
    playerName = playerName.value
    if (playerName != "" && playerName != undefined) {
        ws.send(JSON.stringify({
            objective: "getRoomCode",
            playerName: playerName
        }))
    }
})

//handle join
joinButton.addEventListener("click", () => {
    let playerName = document.querySelectorAll("input")[0];
    playerName = playerName.value;
    let roomCode = document.querySelectorAll("input")[1];
    roomCode = roomCode.value;
    let sendString = JSON.stringify({
        playerName: playerName,
        roomCode: roomCode,
        objective: "joinRoom"
    })
    console.log(sendString)
    if (roomCode != "" && playerName != "" && roomCode != undefined && playerName != undefined) {
        ws.send(sendString)
    }
})




function roomCodeRecieved(code) {
    console.log(code)
    //roomCode=code
    ws.send(JSON.stringify({
        objective: "getPlayers",
        roomCode: code
    }))

    //document.write(code)
}

function transitionToSecond(host, guest, code) {
    toggleHidden(document.getElementById("first"))
    toggleHidden(document.getElementById("second"));
    document.getElementById("host").innerHTML = host;
    document.getElementById("code").innerHTML = `CODE<br>${code}`
    roomCode = code;
    if (guest == "") {
        document.getElementById("guest").innerHTML = "waiting"
    } else {
        turn = "C"
        toggleHidden(document.getElementById("waiting"))
        document.getElementById("guest").innerHTML = guest
        ws.send(JSON.stringify({
            objective: "forSync",
            code: roomCode,
            turn: turn
        }))
    }
}


function toggleHidden(e) {
    e.classList.toggle('hidden')
}

function endScreen(win){
    //toggleHidden(document.getElementById("second"));
    toggleHidden(document.getElementById("third"));
    if(win!="draw"){
        let resultField= document.querySelectorAll("#result")
        console.log(resultField)
        resultField.innerText = `${win} has won the game`
        document.getElementById("result").innerText=`${win} has won the game`
    }else{
        let resultField= document.querySelectorAll("#result")

        resultField.innerHTML = `It is a DRAW`
    }
}