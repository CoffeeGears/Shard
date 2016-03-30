function init(svg){
    var SVG = svg;
    var grid = new Grid([20,20]);
    var toolbox = document.getElementById("toolbox");
    var tools = document.getElementsByClassName("tool");

    var SelectedShapes = [];
    var SelectedPoints = [];

    var width = window.innerWidth,
        height = window.innerHeight;
        toolbox.setAttribute("transform","translate("+(width/2)+" "+(height-100)+")");
    window.onresize = function(){
        width = window.innerWidth;
        height = window.innerHeight;
        toolbox.setAttribute("transform","translate("+(width/2)+" "+(height-100)+")");
    };

    function AddElement(child,parent){
        var parentEle;
        if(typeof parent == "string"){
            parentEle = document.getElementById(parent);
            if(parentEle == null) parentEle = document.querySelector(parent);
        }
        else if(parent.tagName) parentEle = parent;
        else {
            return null;
        }

        return parentEle.appendChild(document.createElementNS("http://www.w3.org/2000/svg",child));
    }

    var ActionLog = {
        actions:[],
        add:function(idTree,action,prevValue){

            actions.push([idTree,action,prevValue])
        },


    };

    var Shapes = [];
    var ShapesById = {};
    var ShapeIdNum = 0;
    var Shape = function(options){
        this.group = AddElement("g",SVG);
        console.log(this.group);
        this.polygon = AddElement("polygon",this.group);
        this.triangles =  AddElement("g",this.group);
        this.overlay =  AddElement("g",this.group);
        this.preview = AddElement("polygon",this.group);


        var shape = this;
        this.id = (options && options.id)? options.id : "shape_"+(ShapeIdNum++);

        this.Points = [];
        this.PointsById = {};
        this.PointNum = 0;

        this.Triangles = [];
        this.TriById = {};
        this.TriIdNum = 0;


        this.origin = (options)? options.origin : new Vec(0,0);

        var Triangle = function(vertices,options){
            var triangle = this;
            triangle.vertices = [];

            Object.defineProperties(triangle,{
                A:{
                    get:function(){ return triangle.vertices[0]; },
                    set:function(val){ triangle.vertices[0] = val; }
                },
                B:{
                    get:function(){ return triangle.vertices[0]; },
                    set:function(val){ triangle.vertices[0] = val; }
                },
                C:{
                    get:function(){ return triangle.vertices[0]; },
                    set:function(val){ triangle.vertices[0] = val; }
                }
            });

            triangle.A = vertices[0] || vertices.A;
            triangle.B = vertices[1] || vertices.B;
            triangle.C = vertices[2] || vertices.C;
            triangle.id = (options && options.id)? options.id : "tri_"+(shape.TriIdNum++);

            triangle.ele = AddElement("polygon",shape.triangles);
            var color;
            /*
            * color = rgb(int,int,int) || rgba(int,int,int,float) || #068FFF;
            *
            *
            *
            * */

            Object.defineProperty(triangle,"color",{
                get:function(){
                    return color;
                },
                set:function(val){
                    color = val;
                    ActionLog.add(["ShapesById",shape.id,"TriById",triangle.id],"setColor",color);

                    triangle.ele.setAttribute("fill",color);
                }
            });
            color = (options)? options.color : "rgb(0,0,0)";

            triangle.update = function(options){
                var pts = [];
                for(var i = 3; i--;) pts.push(shape.PointsById[triangle.vertices[i]].join(","));
                triangle.ele.setAttribute("points",pts.join(" "))

            };
            triangle.update();

            shape.Triangles.push(triangle);
            shape.TriById[triangle.id] = triangle;
        };

        var Point = function(options){
            var point = this;
            point.id = (options && options.id)? options.id : "point_"+(shape.PointNum++);
            point.triangles = [];

        };
        Point.prototype = new Vec(0,0);

        this.add_point = function(pos,options){
            var point = new Point(options);
            point.set(pos);

            shape.Points.push(point);
            shape.PointsById[point.id] = point;

            //Grid stuff
            grid.AddTo(point,point.id);

            return point;
        };

        this.remove_point = function(id){
            var point = shape.PointsById[id];


            //Grid stuff
            grid.Remove(point,id);

            return point;
        };

        this.move_point = function(id,pos){

        };

        this.add_triangle = function(points,options){

        };

        this.remove_triangle = function(id){

        };

        this.split = function(pos,triangle,options){

        };

        this.unsplit = function(point,triangle1,triangle2){

        };

        this.update = function(options){


        };

        var init = "-37,32 0,-32 37,32".split(' ');
        for(var i = init.length; i--;) init[i] = this.add_point(init[i]);
        this.add_triangle(init);


        Shapes.push(this);
        ShapesById[this.id] = this;


    };

    SVG.onclick = function(){
        if(Shapes.length == 0){
            SelectedShapes.unshift( new Shape() );

        }

    };
}

