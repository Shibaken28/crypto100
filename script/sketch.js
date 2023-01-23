let problems = {};
let jsondata;
let cursorPos = new Object();
let selecting = "";
let selected = "";
let trying = false;
let debug = true;

let dialogSwitch = document.getElementById("dialog-1");
let dialog = document.getElementById("dialog");
let dialogText = document.getElementById("dialog-text");
let answer = document.getElementById("input");

dialogSwitch.checked  = false;
dialog.hidden = true;

// 起動時の処理
window.addEventListener("load", ()=>{

    // JSONファイルを取得して表示
    fetch("./problems/problems.json")
        .then( response => response.json())
        .then( data => formatJSON(data));
});

function formatJSON(data){
    jsondata = data;
    initProblems();
    for(let i=0;i<10;i++){
        checkUnlock();
    }
    drawProblems();
}

function update(){
    for(let i=0;i<10;i++){
        checkUnlock();
    }
    drawProblems();
}


// Create the application helper and add its render target to the page
let app = new PIXI.Application({ width: window.innerWidth, height: window.innerHeight ,background: '#EEEEEE'});
document.body.appendChild(app.view);

let container = new PIXI.Container();
app.stage.addChild(container);

container.pivot.x = 0;
container.pivot.y = 0;
container.scale.x = 1.0;
container.scale.y = 1.0;
container.x = 0;
container.y = 0;
container.interactive = true;
app.stage.addEventListener('pointermove', (e) => {
    cursorPos = e.global;
    checkMouseOver();
});

app.ticker.add((delta) => {
  // Update the text's y coordinate to scroll it
  //container.x += delta;
});

app.stage.interactive = true;
app.stage.hitArea = app.screen;
app.stage.on('pointerdown',onDragStart,onDragStart);
app.stage.on('pointerup', onDragEnd);
app.stage.on('pointerupoutside', onDragEnd);
app.stage.on('pointerdown', onClick);
let dragPosX, dragPosY;
let isDragging = false;

const lines = new PIXI.Graphics();
container.addChild(lines);
const blocks = new PIXI.Container();
container.addChild(blocks);

const style = new PIXI.TextStyle({
    fontFamily: 'Times New Roman',
    fontSize: 72,
    fill: '#111111',
});

function onDragMove(event) {
    container.x += event.global.x - dragPosX;
    container.y += event.global.y - dragPosY;
    dragPosX = event.global.x;
    dragPosY = event.global.y;
}

function onDragStart(event) {
    if(trying)return;
    // console.log("grab");
    dragPosX = event.global.x;
    dragPosY = event.global.y;
    app.stage.on('pointermove', onDragMove);
    isDragging = true;
}

function onDragEnd() {
    app.stage.off('pointermove', onDragMove);
    // console.log("release");
    isDragging = false;
}

window.addEventListener('resize', () => {
    resize();
});

function resize() {
	// Get the p
	const parent = app.view.parentNode;
   
	// Resize the renderer
	app.renderer.resize(parent.clientWidth, parent.clientHeight);
  
}




function initProblems(){
    for(let p of jsondata){
        problems[p.id] = new Object();
        problems[p.id].pos = p.pos;
        problems[p.id].level = p.lvl;
        problems[p.id].status = "lock";
        problems[p.id].require = p.require;
        problems[p.id].letter = p.letter;
        problems[p.id].hash = p.answer;
        problems[p.id].path = p.path;
        problems[p.id].block = new PIXI.Graphics();
        blocks.addChild(problems[p.id].block);
    }
}

function checkUnlock(){
    for (let id of Object.keys(problems)) {
        if(problems[id].status == "win")continue;
        let re = problems[id].require;
        let flag = false;
        if(re.length == 0)flag=true;
        for(let rid of re){
            if(problems[rid].status=="win"){
                flag = true;
            }
        }
        if(flag){
            problems[id].status = "trying";
        }
    }
}

function drawProblems(){
    for (let id of Object.keys(problems)) {
        let blockSize = 100;
        let half = blockSize/2;
        let pos = problems[id].pos;
        let c = 0x111111;
        let status = problems[id].status;
        block = problems[id].block;
        block.clear();
        /*
        if(status=="win"){
            c = 0x00E853;
        }else if(status=="trying"){
            c = 0xF01222;
        }
        
        block.lineStyle(0, 0, 0);//第3引数透明度
        block.beginFill(0x111111, 0.5);
        block.drawRoundedRect(15, 15, blockSize, blockSize, 16);
        block.endFill();

        block.lineStyle(7, c, 1);//第3引数透明度
        block.beginFill(0xFAFAFA, 1);
        block.drawRoundedRect(0, 0, blockSize, blockSize, 16);
        block.endFill();
        */
        if(status=="win"){
            c = 0x00E863;
        }else if(status=="trying"){
            c = 0xEEEEEE;
        }else if(status=="lock"){
            c = 0x111111;
        }
        block.lineStyle(0, 0, 0);//第3引数透明度
        block.beginFill(0x030303, 0.5);
        block.drawRoundedRect(15, 15, blockSize, blockSize, 16);
        block.endFill();
        let c2 = 0x999999;
        let lv = problems[id].level;
        if(lv==1){
            c2 = 0x00F850;
        }else if(lv==2){
            c2 = 0x00E8E8;
        }else if(lv==3){
            c2 = 0x0020E8;
        }else if(lv==4){
            c2 = 0xEEEE00;
        }else if(lv==5){
            c2 = 0xFF1111;
        }
        block.lineStyle(5, c2, 0.9);//第3引数透明度
        block.beginFill(c, 1);
        block.drawRoundedRect(0, 0, blockSize, blockSize, 16);
        block.endFill();

        block.pivot.x = half;
        block.pivot.y = half;
        block.x = pos[0];
        block.y = pos[1];

        const richText = new PIXI.Text(problems[id].letter, style);
        richText.anchor.set(0.5, 0.5);
        richText.x = pos[0] ;
        richText.y = pos[1] ;
        container.addChild(richText);

        let re = problems[id].require;
        for(let rid of re){
            let rx = problems[rid].pos[0];
            let ry = problems[rid].pos[1];
            if(problems[rid].status=="win"){
                lines.lineStyle(8,0xFF9900,0.9);
            }else if(problems[rid].status=="trying"){
                lines.lineStyle(8,0x222222,0.9);
            }else{
                lines.lineStyle(8,0x222222,0.1);
            }
            lines.moveTo(pos[0],pos[1]);
            lines.lineTo(rx, ry);
        }
    }
}

function checkMouseOver() {
    let mp = container.toLocal(cursorPos);
    selecting = "";
    for (let id of Object.keys(problems)) {
        let blockSize = 100;
        let half = blockSize/2;
        let pos = problems[id].pos;
        if(pos[0] - half <= mp.x && mp.x <= pos[0] + half && pos[1] - half <= mp.y && mp.y <= pos[1] + half){
            problems[id].block.scale.x = 1.2;
            problems[id].block.scale.y = 1.2;
            selecting = id;
        }else{
            problems[id].block.scale.x = 1.0;
            problems[id].block.scale.y = 1.0;
        }
    }
}

function onClick() {
    if(selecting==""){
        dialogSwitch.checked = false;
        trying = false;
        return;
    }
    if(trying)return;
    if(!debug&&problems[selecting].status=="lock")return;
    selected = selecting;
    //問題dialogを表示
    dialogSwitch.checked = true;
    dialog.hidden = false;
    trying = true;
    dialogText.src = "./problems/html/"+problems[selected].path;
}

function checkAnswer(){
    hashed = sha256("thisisstringassalt.uwu"+answer.value);
    hashed.then(value => {
        if(value == problems[selected].hash){
            problems[selected].status = "win";
            checkUnlock();
            drawProblems();
            dialogSwitch.checked = false;
            trying = false;
        }else{
            
        }
    }
    );
}

async function sha256(str) {
      // Convert string to ArrayBuffer
      const buff = new Uint8Array([].map.call(str, (c) => c.charCodeAt(0))).buffer;
      // Calculate digest
      const digest = await crypto.subtle.digest('SHA-256', buff);
      return [].map.call(new Uint8Array(digest), x => ('00' + x.toString(16)).slice(-2)).join('');
  }
