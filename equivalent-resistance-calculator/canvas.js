var canvas = document.querySelector('canvas');

canvas.width = window.innerWidth;
canvas.height = 500;

var c = canvas.getContext('2d');

const px = [], py = [], node = [];
var N=0,click=0,clk_x,clk_y,snap=25,p_clk,c_clk,mouse_x,mouse_y;

for(var i=0;i<=1000;i++){
    node[i]=[];
    for(var j=0;j<=1000;j++) {node[i][j]=-1;}
}


function plot(){
    c.clearRect(0, 0,canvas.width, canvas.height);

    var tmp=-1,x=mouse_x,y=mouse_y;
    for(var i=1;i<=N;i++){
        if((px[i]-x)*(px[i]-x)+(py[i]-y)*(py[i]-y)<=snap*snap){
            x=px[i];
            y=py[i];
            tmp=i;
            break;
        }
    }

    //draw uncertain branch
    if(click==1){
        c.beginPath();
        c.moveTo(clk_x,clk_y);
        c.lineTo(x,y);
        c.strokeStyle = 'red';
        c.stroke();
    }

    //draw branches
    for(var i=1;i<=N;i++){
        for(var j=1;j<=N;j++){
            if(node[i][j]==-1) {continue;}
            c.beginPath();
            c.moveTo(px[i],py[i]);
            c.lineTo(px[j],py[j]);
            c.strokeStyle = 'black';
            c.stroke();
        }
    }

    //name nodes
    for(var i=1;i<=N;i++){
        c.fillStyle = 'blue';
        c.font = "15px Arial";
        c.fillText(i,px[i]+5,py[i]-5);
    }

    //mention resistance
    for(var i=1;i<=N;i++){
        for(var j=1;j<=N;j++){
            if(node[i][j]==-1) {continue;}
            c.fillStyle = 'purple';
            c.font = "20px Arial";
            c.fillText(node[i][j]+"Ω",(px[i]+px[j])/2+5,(py[i]+py[j])/2-5);
        }
    }
    
    //draw snapping circle
    if(tmp!=-1){
        c.beginPath();
        c.arc(x, y, 5, 0, 2 * Math.PI);
        c.strokeStyle = 'teal';
        c.stroke();
        c.fillStyle = 'teal';
        c.fill();
    }
    
}

const div = document.getElementById('canvas');
function insert_node(event) {
    var x = event.pageX;
    var y = event.pageY;
    var tmp=-1;
    for(var i=1;i<=N;i++){
        if((px[i]-x)*(px[i]-x)+(py[i]-y)*(py[i]-y)<=snap*snap){
            x=px[i];
            y=py[i];
            tmp=i;
            break;
        }
    }
    if(click==1&&clk_x==x&&clk_y==y){
        alert("Choose distinct pair of points");
        return;
    }
    if(tmp==-1){
        N++;
        px[N]=x;
        py[N]=y;
    }
    if(click==0){
        click=1;
        clk_x=x;
        clk_y=y;
        if(tmp==-1){
            p_clk=N;
        }
        else{
            p_clk=tmp;
        }
    }
    else{
        if(tmp==-1){
            c_clk=N;
        }
        else{
            c_clk=tmp;
        }
        node[p_clk][c_clk]=0;
        node[c_clk][p_clk]=0;
        click=0;
    }
}
div.addEventListener("click", insert_node);

function update_cursor(event){
    mouse_x = event.pageX;
    mouse_y = event.pageY;
}
div.addEventListener("mousemove", update_cursor);


function animate(){
    plot();
    requestAnimationFrame(animate);
}
animate();

function insert_res() {
    var T = document.getElementById("inp1");
    var w=parseFloat(T.elements[0].value);
    var u=parseInt(T.elements[1].value);
    var v=parseInt(T.elements[2].value);
    var i=px.length;
    if(u>N||v>N||u<=0||v<=0){
        alert("Choose valid existing points");
        return;
    }
    if(u==v){
        alert("Choose distinct pair of points");
        return;
    }
    if(w<0.00){
        alert("Insert a non-negative resistance value");
        return;
    }
    node[u][v]=w;
    node[v][u]=w;
    plot();
}

function result() {
    var T = document.getElementById("inp2");
    var u=parseInt(T.elements[0].value);
    var v=parseInt(T.elements[1].value);
    if(u>N||v>N||u<=0||v<=0){
        alert("Choose valid existing points");
        return;
    }
    if(u==v){
        alert("Choose distinct pair of points");
        return;
    }
    if(!connected(u,v)){
        alert("These nodes are disconnected");
        return;
    }
    compute(u,v);
}

const vis=[];
function connected(u,v){
    for(var i=1;i<=N;i++){
        vis[i]=0;
    }
    vis[u]=1;
    dfs(u);
    return vis[v];
}
function dfs(x){
    for(var i=1;i<=N;i++){
        if(node[x][i]==-1 || x==i || vis[i]==1){
            continue;
        }
        vis[i]=1;
        dfs(i);
    }
}

function compute(u,v) {
    while(!singleEdge(u,v)){
        if(removeLeaf(u,v)){
            continue;
        }
        else if(seriesCombine(u,v)){
            continue;
        }
        else if(wyeDelta(u,v)){
            continue;
        }
        else{
            alert("Can not solve");
            return;
        }
    }
    document.getElementById("res").innerHTML = node[u][v]+"Ω";
}

function singleEdge(u,v){
    var nu=0,nv=0;
    for(var i=1;i<=N;i++){
        if(i!=u && node[u][i]!==-1){
            nu++;
        }
        if(i!=v && node[v][i]!==-1){
            nv++;
        }
    }
    if(nu==1 && nv==1 && node[u][v]!=-1){
        return 1;
    }
    else{
        return 0;
    }
}

function removeLeaf(u,v){
    for(var i=1;i<=N;i++){
        if(i==u||i==v){
            continue;
        }
        var c=0,x=-1;
        for(var j=1;j<=N;j++){
            if(j!=i && node[i][j]!=-1){
                c++;
                x=j;
            }
        }
        if(c==1){
            node[i][x]=-1;
            node[x][i]=-1;
            return 1;
        }
    }
    return 0;
}

function seriesCombine(u,v){
    for(var i=1;i<=N;i++){
        if(i==u || i==v){
            continue;
        }
        var c=0,x=-1,y=-1;
        for(var j=1;j<=N;j++){
            if(j!=i && node[i][j]!=-1){
                if(c==0){
                    x=j;
                }
                else if(c==1){
                    y=j;
                }
                c++;
            }
        }
        if(c==2){
            var r=node[i][x]+node[i][y];
            paraComb(x,y,r);
            node[x][i]=-1;
            node[i][x]=-1;
            node[y][i]=-1;
            node[i][y]=-1;
            return 1;
        }
    }
    return 0;
}

function paraComb(x,y,r){
    if(node[x][y]==-1){
        node[x][y]=r;
        node[y][x]=r;
    }
    else{
        var r1=node[x][y],R;
        if(r==0||r1==0){
            R=0;
        }
        else{
            R=1/(1/r+1/r1);
        }
        node[x][y]=R;
        node[y][x]=R;
    }
}

function wyeDelta(u,v){
    for(var i=1;i<=N;i++){
        if(i==u || i==v){
            continue;
        }
        var c=0,x=-1,y=-1,z=-1;
        for(var j=1;j<=N;j++){
            if(j!=i && node[i][j]!=-1){
                if(c==0){
                    x=j;
                }
                else if(c==1){
                    y=j;
                }
                else if(c==2){
                    z=j;
                }
                c++;
            }
        }
        if(c==3){
            var R1=node[i][x],R2=node[i][y],R3=node[i][z],R=R1*R2+R2*R3+R3*R1,Ra=R/R1,Rb=R/R2,Rc=R/R3;
            paraComb(x,y,Rc);
            paraComb(y,z,Ra);
            paraComb(z,x,Rb);
            node[x][i]=-1;
            node[i][x]=-1;
            node[y][i]=-1;
            node[i][y]=-1;
            node[z][i]=-1;
            node[i][z]=-1;
            return 1;
        }
    }
    return 0;
}
