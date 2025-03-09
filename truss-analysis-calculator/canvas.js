var canvas = document.querySelector('canvas');

canvas.width = window.innerWidth;
canvas.height = 500;

var c = canvas.getContext('2d');

const px = [], py = [], node = [], fx = [], fy = [], bf = [], bm = [], mf = [], mm = [];
var unit=20, min_x=15, max_y=canvas.height-30;

for(var i=0;i<=1000;i++){
    node[i]=[];
    for(var j=0;j<=1000;j++) {node[i][j]=0;}
    fx[i]=0;
    fy[i]=0;
    bf[i]=0;
    bm[i]=0;
    mf[i]=0;
    mm[i]=0;
}

//default fixed support
c.beginPath();
c.moveTo(15,canvas.height-30);
c.lineTo(0,canvas.height);
c.lineTo(30,canvas.height);
c.lineTo(15,canvas.height-30);
c.strokeStyle = 'purple';
c.fillStyle = 'purple';
c.fill();
c.stroke();
px[0]=15;
py[0]=canvas.height-30;
bf[0]=1;
c.fillStyle = 'black';
c.font = "20px Arial";
c.fillText("0",px[0]+5,py[0]-5);

function plot(){
    c.clearRect(0, 0,canvas.width, canvas.height);

    //draw fixed support
    for(var i=0;i<px.length;i++){
        if(bf[i]==0) {continue;}
        c.beginPath();
        c.moveTo(px[i],py[i]);
        c.lineTo(px[i]-15,py[i]+30);
        c.lineTo(px[i]+15,py[i]+30);
        c.lineTo(px[i],py[i]);
        c.strokeStyle = 'purple';
        c.fillStyle = 'purple';
        c.fill();
        c.stroke();
    }

    //draw moving support
    for(var i=0;i<px.length;i++){
        if(bm[i]==0) {continue;}
        c.beginPath();
        c.moveTo(px[i],py[i]);
        c.lineTo(px[i]-15,py[i]+30);
        c.lineTo(px[i]+15,py[i]+30);
        c.lineTo(px[i],py[i]);
        c.strokeStyle = 'cyan';
        c.fillStyle = 'cyan';
        c.fill();
        c.stroke();
    }

    //draw members
    for(var i=0;i<px.length;i++){
        for(var j=0;j<py.length;j++){
            if(node[i][j]==0) {continue;}
            c.beginPath();
            c.moveTo(px[i],py[i]);
            c.lineTo(px[j],py[j]);
            c.strokeStyle = 'blue';
            c.stroke();
        }
    }

    //name points
    for(var i=0;i<px.length;i++){
        c.fillStyle = 'black';
        c.font = "20px Arial";
        c.fillText(i,px[i]+5,py[i]-5);
    }
}

function fix_size(){
    var mx=1000000000,my=-1000000000;
    for(var i=0;i<px.length;i++){
        mx=Math.min(mx,px[i]);
        my=Math.max(my,py[i]);
    }
    for(var i=0;i<px.length;i++){
        px[i]=px[i]-mx+min_x;
        py[i]=py[i]-my+max_y;
    }
    plot();
}

function resize() {
    var v = document.getElementById("resize");
    unit=parseInt(v.elements[0].value);
}

function inp1() {
    var v = document.getElementById("inp1");
    var n=parseInt(v.elements[0].value);
    var x=parseInt(v.elements[1].value);
    var y=parseInt(v.elements[2].value);
    var i=px.length;
    if(n>=i){
        alert("Point does not exist");
        return;
    }
    px[i]=px[n]+x*unit;
    py[i]=py[n]-y*unit;
    node[i][n]=1;
    node[n][i]=1;
    fix_size();
}

function inp2() {
    var v = document.getElementById("inp2");
    var n=parseInt(v.elements[0].value);
    var m=parseInt(v.elements[1].value);
    var i=px.length;
    if(n>=i||m>=i){
        alert("Point does not exist");
        return;
    }
    node[m][n]=1;
    node[n][m]=1;
    plot();
}

function inp3() {
    var v = document.getElementById("inp3");
    var n=parseInt(v.elements[0].value);
    var x=parseFloat(v.elements[1].value);
    var y=parseFloat(v.elements[2].value);
    var i=px.length;
    if(n>=i){
        alert("Point does not exist");
        return;
    }
    fx[n]=x;
    fy[n]=y;
}

function inp4() {
    var v = document.getElementById("inp4");
    var n=parseInt(v.elements[0].value);
    if(bf[n]==1||bm[n]==1){
        alert("Support already exist");
        return;
    }
    bf[n]=1;
    plot();
}

function inp5() {
    var v = document.getElementById("inp5");
    var n=parseInt(v.elements[0].value);
    if(bf[n]==1||bm[n]==1){
        alert("Support already exist");
        return;
    }
    bm[n]=1;
    plot();
}

function compute() {
    let fixed = [], moving = [], member = [], a = [], r = [], cl = [];
    
    //fixed support reactions
    for(var i=0;i<px.length;i++){
        if(bf[i]==0) {continue;}
        mf[i]=fixed.length;
        fixed[fixed.length]=i;
    }

    //moving support reactions
    for(var i=0;i<px.length;i++){
        if(bm[i]==0) {continue;}
        mm[i]=moving.length;
        moving[moving.length]=i;
    }

    //force members
    for(var i=0;i<px.length;i++){
        for(var j=0;j<i;j++){
            if(node[j][i]==0) {continue};
            member[member.length]=[j,i];
        }
    }

    //row
    for(var i=0;i<fixed.length;i++) {r[r.length]=0;r[r.length]=0;}
    for(var i=0;i<moving.length;i++) {r[r.length]=0;}
    for(var i=0;i<member.length;i++) {r[r.length]=0;}

    //building matrix
    a[0]=r.slice(0);
    cl[0]=0;
    for(var i=0;i<px.length;i++) {cl[0]-=fx[i];}
    for(var i=0,j=0;i<fixed.length;i++,j=j+2) {a[0][j]=1;}
    a[1]=r.slice(0);
    cl[1]=0;
    for(var i=0;i<px.length;i++) {cl[1]-=fy[i];}
    for(var i=0,j=1;i<fixed.length;i++,j=j+2) {a[1][j]=1;}
    for(var i=0,j=2*fixed.length;i<moving.length;i++,j++) {a[1][j]=1;}
    
    for(var n=0,row=2;n<px.length;n++,row++){
        a[row]=r.slice(0);
        cl[row]=-fx[n];
        if(bf[n]==1) {a[row][2*mf[n]]=1;}
        for(var i=0,j=2*fixed.length+moving.length;i<member.length;i++,j++){
            if(member[i][0]==n){
                a[row][j]=(px[member[i][1]]-px[n])/Math.sqrt((px[member[i][1]]-px[n])*(px[member[i][1]]-px[n])+(py[member[i][1]]-py[n])*(py[member[i][1]]-py[n]));
            }
            else if(member[i][1]==n){
                a[row][j]=(px[member[i][0]]-px[n])/Math.sqrt((px[member[i][0]]-px[n])*(px[member[i][0]]-px[n])+(py[member[i][0]]-py[n])*(py[member[i][0]]-py[n]));
            }
        }
        row++;
        a[row]=r.slice(0);
        cl[row]=-fy[n];
        if(bf[n]==1) {a[row][2*mf[n]+1]=1;}
        if(bm[n]==1) {a[row][2*fixed.length+mm[n]]=1;}
        for(var i=0,j=2*fixed.length+moving.length;i<member.length;i++,j++){
            if(member[i][0]==n){
                a[row][j]=-(py[member[i][1]]-py[n])/Math.sqrt((px[member[i][1]]-px[n])*(px[member[i][1]]-px[n])+(py[member[i][1]]-py[n])*(py[member[i][1]]-py[n]));
            }
            else if(member[i][1]==n){
                a[row][j]=-(py[member[i][0]]-py[n])/Math.sqrt((px[member[i][0]]-px[n])*(px[member[i][0]]-px[n])+(py[member[i][0]]-py[n])*(py[member[i][0]]-py[n]));
            }
        }
    }
    
    //moment at 0
    /*var row=cl.length;
    a[row]=r.slice(0);
    for(var i=1;i<px.length;i++){
        cl[row]=(fx[i]*(py[0]-py[i])+fy[i]*(px[0]-px[i]))/unit;
        if(bf[i]==1){
            a[row][2*mf[i]]=(py[i]-py[0])/unit;
            a[row][2*mf[i]+1]=(px[i]-px[0])/unit;
        }
        if(bm[i]==1){
            a[row][2*fixed.length+mm[i]]=(px[i]-px[0])/unit;
        }
    }*/

    //gaussian elimination
    var t=2*fixed.length+moving.length+member.length;
    if(a.length<t){
        alert("Can not solve");
        return;
    }
    for(var i=0;i<t;i++){
        if(a[i][i]==0){
            var ok=0;
            for(var j=i+1;j<a.length;j++){
                if(a[j][i]!=0){
                    ok=1;
                    [a[i],a[j]]=[a[j],a[i]];
                    //for(var k=0;k<a[i].length;k++) {[a[i][k],a[j][k]]=[a[j][k],a[i][k]];}
                    [cl[i],cl[j]]=[cl[j],cl[i]];
                    break;
                }
            }
            //if(ok==0){
            //    alert("Can not solve");
            //    return;
            //}
        }
        if(a[i][i]==0) {break;}
        cl[i]/=a[i][i];
        var z=a[i][i];
        for(var j=0;j<t;j++){
            a[i][j]/=z;
        }
        for(var j=0;j<a.length;j++){
            if(j==i) {continue;}
            z=a[j][i];
            cl[j]-=z*cl[i];
            for(var k=0;k<t;k++){
                a[j][k]-=z*a[i][k];
            }
        }
    }
    //console.log(a);
    //console.log(cl);

    //show result
    var res="";
    for(var i=0;i<fixed.length;i++){
        res+="R<sub>"+String(fixed[i])+"x</sub> = "+String(cl[2*i])+"<br>";
        res+="R<sub>"+String(fixed[i])+"y</sub> = "+String(cl[2*i+1])+"<br>";
    }
    for(var i=0;i<fixed.length;i++){
        res+="R<sub>"+String(moving[i])+"y</sub> = "+String(cl[2*fixed.length+i])+"<br>";
    }
    for(var i=0;i<member.length;i++){
        res+="F<sub>"+String(member[i][0])+","+String(member[i][1])+"</sub> = "+String(cl[2*fixed.length+moving.length+i])+"<br>";
    }
    document.getElementById("res").innerHTML = res;
}
