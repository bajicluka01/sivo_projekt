var canvas = null;
var context = null;
var margin = 20;
var circles = [];
var labels = [];


class Main {

    constructor() {}

    static onLoad() {
        canvas = document.getElementById('canvas');
        context = canvas.getContext('2d');
        var canvasWidth = document.getElementById('canvas').offsetWidth;
        var canvasHeight = document.getElementById('canvas').offsetHeight;

        var n = document.getElementById('number').value;
        for(var i = 0; i < n; i++) {
            var p = new Point((Math.random() *  canvasWidth), (Math.random() * canvasHeight));
            circles[i] = new Circle(p, 2.1, 2, 2, '#000000');
            labels[i] = new Label(p.getX(), p.getY(), 28, 9, (Math.random() * 90 + 10).toFixed(2), true, "010", p.getX(), p.getY());
        }

        drawCircles();
        drawLabels(labels);
    }

    static run() {
        var gen = new Generation(100, document.getElementById('number').value);
        
        var ind = gen.selection();

        //generira naslednje generacije osebkov
        for(var i = 0; i < 10; i++) {
            gen.crossover(ind);
            gen.mutate();
            ind = gen.selection();
        }

        context.clearRect(0, 0, canvas.width, canvas.height);
        drawCircles();

        var repr = gen.getRepresentations();
        var qualities = [];
        for(var i = 0; i < repr.length; i++) {
            var quality = findOverlaps(repr[i].getCode(), false);
            qualities[i] = quality;
        }

        var lab = [];
        var count = 0;
        var code = repr[qualities.indexOf(Math.max(...qualities))].getCode();
        for(var i = 0; i < code.length; i += 3) {
            var p = circles[count].getPoint();
            lab[count] = new Label(p.getX(), p.getY(), 28, 9, (Math.random() * 90 + 10).toFixed(2), true, code.substring(i, i+3), p.getX(), p.getY());
            count++;
        }

        var l = findOverlaps(code, true); //true odstrani prekrivanja in vrne nove pozicije label

        for(var i = 0; i < l.length; i++) {
            lab[l[i]].setVisible(false);
        }

        drawLabels(lab);
    }

}

function findOverlaps(code, hide) {
    var lab = [];
    var count = 0;
    for(var i = 0; i < code.length; i += 3) {
        var p = circles[count].getPoint();
        lab[count] = new Label(p.getX(), p.getY(), 28, 9, (Math.random() * 90 + 10).toFixed(2), true, code.substring(i, i+3), p.getX(), p.getY());

        //spremeni pozicijo labele glede na kodo
        if(lab[count].code == "000") {
            lab[count].setX(circles[count].getPoint().x - lab[count].width - lab[count].margin);
            lab[count].setY(circles[count].getPoint().y - lab[count].margin);
        }
        else if(lab[count].code == "001") {
            lab[count].setX(circles[count].getPoint().x - lab[count].width - lab[count].margin);
            lab[count].setY(circles[count].getPoint().y - lab[count].margin);
        }
        else if(lab[count].code == "010") {
            lab[count].setX(circles[count].getPoint().x + lab[count].margin);
            lab[count].setY(circles[count].getPoint().y - lab[count].margin);
        }
        else if(lab[count].code == "011") {
            lab[count].setX(circles[count].getPoint().x - lab[count].width - lab[count].margin);
            lab[count].setY(circles[count].getPoint().y + lab[count].height / 2 - lab[count].margin / 2);
        }
        else if(lab[count].code == "100") {
            lab[count].setX(circles[count].getPoint().x + lab[count].margin);
            lab[count].setY(circles[count].getPoint().y + lab[count].height / 2 - lab[count].margin / 2);
        }
        else if(lab[count].code == "101") {
            lab[count].setX(circles[count].getPoint().x - lab[count].width - lab[count].margin);
            lab[count].setY(circles[count].getPoint().y + lab[count].margin / 2 + lab[count].height / 2);
        }
        else if(lab[count].code == "110") {
            lab[count].setX(circles[count].getPoint().x - lab[count].width / 2 - lab[count].margin);
            lab[count].setY(circles[count].getPoint().y + lab[count].height + lab[count].margin / 2);
        }
        else if(lab[count].code == "111") {
            lab[count].setX(circles[count].getPoint().x + lab[count].margin);
            lab[count].setY(circles[count].getPoint().y + lab[count].margin / 2 + lab[count].height / 2);
        }

        count++;
    }

    var canvasWidth = document.getElementById('canvas').offsetWidth;
    var canvasHeight = document.getElementById('canvas').offsetHeight;
    var shownLabels = lab.length;
    var labelsToHide = [];
    var hideIndex = 0;
    for(var i = 0; i < lab.length; i++) {
        //preveri, ce labela precka rob canvasa
        if(lab[i].getX() <= 0 || lab[i].getX() + lab[i].getWidth() >= canvasWidth || lab[i].getY() - lab[i].getHeight() <= 0 || lab[i].getY() >= canvasHeight)
        lab[i].setVisible(false);

        for(var j = 0; j < lab.length; j++) {
            if(i != j && lab[i].getVisible() && lab[j].getVisible()) {
                var p1 = new Point(lab[i].getX(), lab[i].getY() - lab[i].getHeight(), "");
                var p2 = new Point(lab[i].getX() + lab[i].getWidth(), lab[i].getY(), "");
                var p3 = new Point(lab[j].getX(), lab[j].getY() - lab[j].getHeight(), "");
                var p4 = new Point(lab[j].getX() + lab[j].getWidth(), lab[j].getY(), "");

                if(p1.getY() > p4.getY() || p2.getY() < p3.getY()) 
                    continue;
                if(p1.getX() > p4.getX() || p3.getX() > p2.getX()) 
                    continue;
                
                shownLabels--;
                lab[j].setVisible(false);
                labelsToHide[hideIndex] = j;
                hideIndex++;
            }
        }
    }
    
    if(!hide)
        return shownLabels;
    return labelsToHide;
}

class Generation {
    constructor(n, k) {   //n = stevilo osebkov v posamezni generaciji, k = stevilo tock
        this.n = n;
        this.representations = [];
        for(var i = 0; i < n; i++) {
            this.representations[i] = new Representation(k);
        }
    }

    getRepresentations(){
        return this.representations;
    }

    selection() {
        var qualities = [];
        for(var i = 0; i < this.representations.length; i++) {
            var quality = findOverlaps(this.representations[i].getCode());
            qualities[i] = quality;
        }
        var threshold = qualities.sort()[15];  //najde mejo za najboljsih 15 osebkov / reprezentacij
        //console.log(qualities[0]);
        var indexes = [];
        var k = 0;
        for(var i = 0; i < qualities.length; i++) {
            if(qualities[i] >= threshold) {
                indexes[k] = i;
                k++;
            }
        }
        return indexes;
    }

    crossover(ind) {
        var newGen = [];
        for(var i = 0; i < this.n; i++) {
            var rand1 = Math.floor(Math.random() * ind.length);
            var rand2 = Math.floor(Math.random() * ind.length);

            newGen[i] = this.representations[ind[rand1]].getCode().substring(0, (this.k*3)/2) + this.representations[ind[rand2]].getCode().substring((this.k*3)/2);
        }
        
        for(var i = 0; i < newGen.length; i++) {
            this.representations[i].setCode(newGen[i]);
        }
    }

    mutate() { //spremeni nakljucni bit v posamezni generaciji, naceloma lahko tudi vec bitov
        var c = this.representations[0].getCode();
        var rand = Math.floor(Math.random() * this.n);
        var rand2 = Math.floor(Math.random() * c.length);
        var code = this.representations[rand].getCode();
        var ch = code.charAt(rand2);
        this.representations[rand].setCode(code.substring(0, rand2) + ((ch == '1') ? "0" : "1") + code.substring(rand2 + 1));
    }
}

class Representation {
    constructor(n) { //n = stevilo tock
        this.n = n;
        var tmp = "";
        for(var i = 0; i < n * 3; i++) {
            tmp = tmp + Math.floor(Math.random() * 2).toString();
        }
        this.code = tmp;
    }

    getCode() {
        return this.code;
    }
    
    setCode(c) {
        this.code = c;
    }
}

class Label{
    constructor(x, y, width, height, data, visible, code, pointX, pointY) {
        this.x = x;
        this.y = y;
        this.pointX = pointX;
        this.pointY = pointY;
        this.width = width;
        this.height = height;
        this.data = data;
        this.visible = visible;
        this.code = code;
        this.margin = 5; //odmik od tocke, da labela ne prekriva tocke
    }

    getCode() {
        return this.getCode;
    }

    setCode(code) {
        this.code = code;
    }

    getWidth(){
        return this.width;
    }

    getHeight() {
        return this.height;
    }

    getData() {
        return this.data;
    }

    getX() {
        return this.x;
    }

    getY() {
        return this.y;
    }

    setX(x) {
        this.x = x;
    }

    setY(y) {
        this.y = y;
    }

    setVisible(b) {
        this.visible = b;
    }

    getVisible() {
        return this.visible;
    }

    getPointX() {
        return this.pointX;
    }

    getPointY() {
        return this.pointY;
    }

    draw() {
        if(!this.visible)
            return;

        context.strokeStyle = '#000000';
        context.beginPath();
        context.font = "12 Georgia";
        if(this.code == "000") {
            context.fillText(this.data, this.pointX - this.width - this.margin, this.pointY - this.margin);
            this.setX(this.x - this.width - this.margin);
            this.setY(this.y - this.margin);
        }
        else if(this.code == "001") {
            context.fillText(this.data, this.pointX - this.width - this.margin, this.pointY - this.margin);
            this.setX(this.x - this.width - this.margin);
            this.setY(this.y - this.margin);
        }
        else if(this.code == "010") {
            context.fillText(this.data, this.pointX + this.margin, this.pointY - this.margin);
            this.setX(this.x + this.margin);
            this.setY(this.y - this.margin);
        }
        else if(this.code == "011") {
            context.fillText(this.data, this.pointX - this.width - this.margin, this.pointY + this.height / 2 - this.margin / 2);
            this.setX(this.x - this.width - this.margin);
            this.setY(this.y + this.height / 2 - this.margin / 2);
        }
        else if(this.code == "100") {
            context.fillText(this.data, this.pointX + this.margin, this.pointY + this.height / 2 - this.margin / 2);
            this.setX(this.x + this.margin);
            this.setY(this.y + this.height / 2 - this.margin / 2);
        }
        else if(this.code == "101") {
            context.fillText(this.data, this.pointX - this.width - this.margin, this.pointY + this.margin / 2 + this.height / 2);
            this.setX(this.x - this.width - this.margin);
            this.setY(this.y + this.margin / 2 + this.height / 2);
        }
        else if(this.code == "110") {
            context.fillText(this.data, this.pointX - this.width / 2 - this.margin, this.pointY + this.height + this.margin / 2);
            this.setX(this.x - this.width / 2 - this.margin);
            this.setY(this.y + this.height + this.margin / 2);
        }
        else if(this.code == "111") {
            context.fillText(this.data, this.pointX + this.margin, this.pointY + this.margin / 2 + this.height / 2);
            this.setX(this.x + this.margin);
            this.setY(this.y + this.margin / 2 + this.height / 2);
        }

        //context.fillStyle = this.color; 
        //context.fill();
        //context.stroke();
        context.closePath();
    }
}

function drawLabels(lab) {

    for(var i = 0; i < lab.length; i++) {

        //var p = circles[i].getPoint();

        //lab[i].setX(p.getX());
        //lab[i].setY(p.getY());

        lab[i].draw();
    }
}

function drawCircles() {
    var canvasWidth = document.getElementById('canvas').offsetWidth;
    var canvasHeight = document.getElementById('canvas').offsetHeight;
    
    context.clearRect(0, 0, canvas.width, canvas.height);
    for(var i = 0; i < circles.length; i++) 
        circles[i].setColor('#000000');

    for(var i = 0; i < circles.length; i++) {

        for(var j = 0; j < circles.length; j++) {
            var p1 = circles[i].getPoint();
            var p2 = circles[j].getPoint();
            if(i != j && Math.abs(p1.getX() - p2.getX()) < circles[i].getR() + circles[j].getR() && Math.abs(p1.getY() - p2.getY()) < circles[i].getR() + circles[j].getR()) {
                //circles[i].setColor('#ff0000');
                //circles[j].setColor('#ff0000');
            }
        }

        circles[i].draw();
    }
}

class Circle {
    constructor(point, r, color) {
        this.point = point;
        this.r = r;
        this.color = color;
    }

    getR() {
        return this.r;
    }

    getPoint() {
        return this.point;
    }

    setPoint(point) {
        this.point = point;
    }

    setR() {
        this.r = r;
    }

    getColor() {
        return this.color;
    }

    setColor(color) {
        this.color = color;
    }

    draw() {
        context.strokeStyle = this.color;
        context.beginPath();
        context.arc(this.point.getX(), this.point.getY(), this.r, 0, 2* Math.PI);
        context.fillStyle = this.color; 
        context.fill();
        context.stroke();
        context.closePath();
    }
}


class Point {
    constructor(x, y, label) {
        this.x = x;
        this.y = y;
        this.label = label
    }

    getX() {
        return this.x;
    }

    getY() {
        return this.y;
    }

    setX(x) {
        this.x = x;
    }

    setY(y) {
        this.y = y;
    }

    setCoords(a, b) {
        this.x = a;
        this.y = b;
    }

    setType(s) {
        this.type = s;
    }

    getType() {
        return this.s;
    }

    movePoint(a, b) {
        this.x = a;
        this.y = b;
    }
}

