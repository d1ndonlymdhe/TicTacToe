class room {
    occupied = [];
    rows = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ]
    cols = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ]
    diag = [
        [0, 0, 0],
        [0, 0, 0]
    ]
    all = [
        [],
        [],
        []
    ]
    state = [0, 0, 0, 0, 0, 0, 0, 0, 0]
    changeOccupiedToState() {
        this.occupied.forEach((e) => {
            this.state[e[0]] = e[1]
        })

    }
    update(state) {
        this.rows = this.assignRows(state);
        this.cols = this.assignCols(state);
        this.diag = this.assignDiag(state);
        this.all = [this.rows, this.cols, this.diag];
    }


    assignRows(a) {

        ////console.log(tempArr)
        return [
            [a[0], a[1], a[2]],
            [a[3], a[4], a[5]],
            [a[6], a[7], a[8]]
        ]
    }

    assignCols(a) {
        return [
            [a[0], a[3], a[6]],
            [a[1], a[4], a[7]],
            [a[2], a[5], a[8]]
        ]
    }

    assignDiag(a) {
        return [
            [a[0], a[4], a[8]],
            [a[2], a[4], a[6]]
        ]
    }

    check() {
        for(let i=0;i<this.rows.length;i++){
            let row=this.rows[i];
            if(row[0]==row[1]&&row[1]==row[2]&&row[0]!=0){
                return row[0]
            }
        }
        for(let i=0;i<this.cols.length;i++){
           // console.log(this.cols,this.cols[i])
            let col=this.cols[i];
            if(col[0]==col[1]&&col[1]==col[2]&&col[0]!=0){
                return col[0]
            }
        }
        for(let i=0;i<this.diag.length;i++){
            let d = this.diag[i];
            if(d[0]==d[1]&&d[1]==d[2]&&d[0]!=0){
                return d[0];
            }
        }
        if(this.occupied.length==9){
            return "draw";
        }
        else{
            return "continue";
        }
    }


    // clock = setInterval(()=>{
    //     if(!this.allowDraw){
    //         let sendString = JSON.stringify({objective:"result",turn:this.check()});
    //         this.host.ws.send(sendString);
    //         this.guest.ws.send(sendString)
    //         clearInterval(this.clock)
    //     }
    // },1)

    host = {
        name: "",
        joined: false,
        ws: undefined
    }
    guest = {
        name: "",
        joined: false,
        ws: undefined
    }
    code = 0
    turn = "X"
    allowDraw = true;
    constructor(code) {
        this.code = code;
    }
    guestJoined(name) {
        this.guest.name = name
        this.guest.joined = true
    }
    hostJoined(name) {
        this.host.name = name
        this.host.joined = true
    }
    changeTurn() {
        if (this.turn == "X") {
            //console.log("huncha")
            this.turn = "C";
        } else {
            this.turn = "X"
        }
    }
}

module.exports = {
    room: room
}