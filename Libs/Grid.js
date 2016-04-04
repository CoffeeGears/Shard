

var Grid = function(unit_size){
    //Grid expects size to be an array of non-zero float values
    //Examples:
    //new Grid([10,10]) returns a 2D grid made of 10 by 10 boxes;
    //new Grid([12,10,3]) returns a 3D grid made of 12 by 10 by 3 cubes;

    for(var i = unit_size.length; i--;) if(unit_size[i] == 0) throw("Grid size cannot contain any 0 values");

    var DoubleArray = function(){ //simple object that contains two arrays, one for negative indices and one for positive
        this.p = [];
        this.n = [];

        Object.defineProperty(this,"length",{
            get: function(){
                return this.p.length + this.n.length;
            }
        });

        this.get = function(index){
            if(index < 0) return this.n[index*-1];
            else return this.p[index];
        };

        this.set = function(index,value){
            if(index < 0) this.n[index*-1] = value;
            else this.p[index] = value;
            return value;
        };
    };

    this.root = new DoubleArray();

    this.Get = function(pos){
        var box = this.root,
            d;
        for(var i = 0, l = unit_size.length; i < l; i++){
            if(i == 0 || unit_size[i] != unit_size[i-1]) d = Math.floor(pos[i]/unit_size[i]);
            box = box.get(d);
            if(box == undefined) return null;
        }
        return box;
    };

    this.Overwrite = function(pos,values){
        var box = this.root,
            ref = [],
            d;

        for(var i = 0, l = unit_size.length; i < l; i++){
            d = Math.floor(pos[i]/unit_size[i]);
            ref[i] = d;

            box = box.get(d) ||  box.set(d, new DoubleArray());
        }
        box = (values.constructor == Array)? values : [ values ];
        return ref;
    };

    this.AddTo = function(pos,value){
        var box = this.root,
            ref = [],
            d;

        for(var i = 0, l = unit_size.length; i < l; i++){
            d = Math.floor(pos[i]/unit_size[i]);
            ref[i] = d;

            box = (i < l-1)? box.get(d) ||  box.set(d, new DoubleArray()) : box.get(d) ||  box.set(d, []);
        }
        console.log(box);
        if(box == undefined) box = [value];
        else box.push( value );

        return ref;
    };

    this.BoxContains = function(pos,value){
        var box = this.Get(pos);
        return (box && box.indexOf(value) > -1);
    };

    this.Remove = function(pos,value){
        var box = this.Get(pos);
        if(box){
            var i = box.indexOf(value);
            if(i > -1) return box.splice(i,1);
        }
    }
};