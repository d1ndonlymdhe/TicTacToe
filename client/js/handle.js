var clickers=document.querySelectorAll("#clickers div");
clickers.forEach(clicker=>{
    clicker.addEventListener('click',(e)=>{
        let element = e.composedPath()[0]
        let clicked = element.id
        ws.send(JSON.stringify({objective:"registerClick",clicked:clicked,turn:turn,code:roomCode}))
    })
})
 
var restart = document.getElementById("restart")
restart.addEventListener('click',(e)=>{
    ws.send(JSON.stringify({objective:"restart",code:roomCode}))
})

function draw(turn,clicked){
    let x= document.getElementById(turn+clicked)
    console.log(x,turn+clicked)
    document.getElementById(turn+clicked).classList.toggle("hidden")
}