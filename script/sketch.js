let problems = {};
let jsondata;
let cursorPos = new Object();

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
        problems[p.id].block = new PIXI.Graphics();
        blocks.addChild(problems[p.id].block);
    }
    console.log(problems);
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
        if(status=="win"){
            c = 0x00E853;
        }else if(status=="trying"){
            c = 0xF01222;
        }
        
        block.lineStyle(10, 0x111111, 0.3);//第3引数透明度
        block.beginFill(0x111111, 0.3);
        block.drawRoundedRect(5, 5, blockSize, blockSize, 16);
        block.endFill();

        block.lineStyle(10, c, 0.5);//第3引数透明度
        block.beginFill(0xFAFAFA, 1);
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
    for (let id of Object.keys(problems)) {
        let blockSize = 100;
        let half = blockSize/2;
        let pos = problems[id].pos;
        if(pos[0] - half <= mp.x && mp.x <= pos[0] + half && pos[1] - half <= mp.y && mp.y <= pos[1] + half){
            problems[id].block.scale.x = 1.2;
            problems[id].block.scale.y = 1.2;
        }else{
            problems[id].block.scale.x = 1.0;
            problems[id].block.scale.y = 1.0;
        }
    }
}


