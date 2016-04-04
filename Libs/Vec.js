/**
 * Created by SitaoLiao on 2/5/16.
 */

var Vec = function(){
    var rad2deg = 180/Math.PI;
    var Vec = function(){

        var vec = Object.create( Array.prototype );

        var args;
        if (typeof arguments[0] == "string" && !arguments[1]) args = arguments[0].split(/[^0-9\.\-]/g);
        else if (arguments[0] && arguments[0].constructor == Array && arguments[0].length >= 0) args = arguments[0];
        else args = arguments;

        vec = (Array.apply( vec, args ) || vec);

        var order;
        Object.defineProperty(vec,"order",{
            get:function(){
                return order;
            },
            set:function(str){
                for(var i = str.length; i--;) {
                    if(str[i][0].match(/[^a-zA-Z_]/g)) {
                        console.error("Invalid '"+str[i][0]+"' in order");
                        return;
                    }
                    for(var x in this) if(str[i] == x){
                        console.error("Invalid property '"+str[i]+"' in order");
                        return;
                    }
                }
                if (order) for (i = order.length; i--;) delete vec[order[i]];
                order = str;
                for (var j = order.length; j--;) {
                    Object.defineProperty(this, order[j], {
                        get: function () {
                            var char = order[j];
                            return function () {
                                return vec[order.indexOf(char)];
                            }
                        }(),
                        set: function () {
                            var char = order[j];
                            return function (v) {
                                vec[order.indexOf(char)] = parseFloat(v);
                            }
                        }(),
                        configurable: true
                    })
                }
            },
            enumerable: true
        });
        Vec.addMethods( vec );


        return vec;
    };


    // ------------------------------------------------------ //
    // ------------------------------------------------------ //


    Vec.addMethods = function( vec ){
        for (var method in Vec.prototype){
            if (Vec.prototype.hasOwnProperty( method )){
                vec[ method ] = Vec.prototype[ method ];
            }
        }
        return( vec );

    };

    Vec.fromArray = function( array ){
        return Collection.apply( null, array );
    };

    Vec.isArray = function( value ){
        var stringValue = Object.prototype.toString.call( value );
        return( stringValue.toLowerCase() === "[object array]" );
    };


    // ------------------------------------------------------ //
    // ------------------------------------------------------ //

    var GlobalOrder;
    Object.defineProperty(Vec.prototype,"globalOrder",{
        get:function(){
            return GlobalOrder;
        },
        set:function(str){
            for(var i = str.length; i--;) {
                if(str[i][0].match(/[^a-zA-Z_]/g)) {
                    console.error("Invalid '"+str[i][0]+"' in order");
                    return;
                }
                for(var x in this) if(str[i] == x){
                    console.error("Invalid property '"+str[i]+"' in order");
                    return;
                }
            }
            if (GlobalOrder) for (i = Vec.prototype.length; i--;) delete Vec.prototype[GlobalOrder[i]];
            GlobalOrder = str;
            for (var j = GlobalOrder.length; j--;) {
                Object.defineProperty(Vec.prototype, GlobalOrder[j], {
                    get: function () {
                        var char = GlobalOrder[j];
                        return function () {
                            return this[this.globalOrder.indexOf(char)];
                        }
                    }(),
                    set: function () {
                        var char = GlobalOrder[j];
                        return function (v) {
                            this[this.globalOrder.indexOf(char)] = parseFloat(v);
                        }
                    }(),
                    configurable: true
                })
            }
        },
        enumerable: true
    });
    Vec.prototype.globalOrder = "xyz";

    //returns squared magnitude (length,distance,normal,etc...) of this vector
    Vec.prototype.magnitude2 = function () {
        var total = 0;
        for (var i = this.length; i--;) {
            total += this[i] * this[i];
        }
        return total;
    };

    //returns magnitude (length,distance,normal,etc...) of this vector
    Vec.prototype.magnitude = function () {
        return Math.sqrt(this.magnitude2());
    };

    //returns the squared length of the line between this vector and the vec argument
    //(which should be another vector but doesn't have to be).
    Vec.prototype.distance2 = function (vec) {
        return this.subtract(vec).magnitude2();
    };

    //returns the length of the line between this vector and the vec argument
    //(which should be another vector but doesn't have to be).
    Vec.prototype.distance = function (vec) {
        return this.subtract(vec).magnitude();
    };

    //normalizes and returns this vector. (divides each axis of this vector by it's magnitude)
    //if this vector's magnitude == 0 it just returns a 0,0,0... vector to prevent NaN values from occurring.
    Vec.prototype.normalize = function (apply) {
        var mag = this.magnitude();
        if(mag > 0) return this.divide(mag, apply);
        else return apply? this : new Vec().set(this);
    };

    //returns dot product of this Vector and vec argument. read about it here http://betterexplained.com/articles/vector-calculus-understanding-the-dot-product/
    Vec.prototype.dot = function (vec) {
        if (!(vec.constructor === Vec)) vec = new Vec(vec);
        var i = (vec.length > this.length) ? vec.length : this.length,
            total = 0;

        for (; i--;) total += (this[i] || 0) * (vec[i] || 0);
        return total;
    };

    //returns cross product of this Vector and vec argument. This method applies only to the first three axes, undefined values are set to 0.
    Vec.prototype.cross = function (vec) {
        if (!(vec.constructor === Vec)) vec = new Vec(vec);
        var a1 = (this[0] || 0),
            a2 = (this[1] || 0),
            a3 = (this[2] || 0),
            b1 = (vec[0] || 0),
            b2 = (vec[1] || 0),
            b3 = (vec[2] || 0);
        return new Vec((a2 * b3 - a3 * b2), (a3 * b1 - a1 * b3), (a1 * b2 - a2 * b1));
    };

    //returns angle between vectors regardless of number of dimensions, always positive;
    Vec.prototype.angleTo = function (vec, deg) {
        if (!(vec.constructor === Vec)) vec = new Vec(vec);
        if (deg) return Math.acos(this.dot(vec) / ( this.magnitude() * vec.magnitude() )) * rad2deg;
        else return Math.acos(this.dot(vec) / ( this.magnitude() * vec.magnitude() ));
    };

    //returns angle between vectors in 3D space, always postive;
    Vec.prototype.angle3DTo = function (vec, deg) {
        if (!(vec.constructor === Vec)) vec = new Vec(vec);
        if (deg) return Math.atan2(this.cross(vec).magnitude(), this.dot(vec)) * rad2deg;
        else return Math.atan2(this.cross(vec).magnitude(), this.dot(vec));
    };

    //returns angle of vectors in 2D space, returns positive for Clockwise negative for Counterclockwise.
    Vec.prototype.angle2D = function (vec, deg) {
        if (vec && typeof vec !== "boolean") {
            if (!(vec.constructor === Vec)) vec = new Vec(vec);
            if (deg) return Math.atan2(this[0] * vec[1] - this[1] * vec[0], this[0] * vec[0] + this[1] * vec[1]) * rad2deg;
            else return Math.atan2(this[0] * vec[1] - this[1] * vec[0], this[0] * vec[0] + this[1] * vec[1]);
        } else {
            if (vec == true) return Math.atan2(this[0], this[1]) * rad2deg;
            else return Math.atan2(this[0], this[1]);
        }
    };

    //returns angle between vecL and vecR with this as origin in 2D space, returns positive for Clockwise negative for Counterclockwise.
    Vec.prototype.angle2DBetween = function (vecL, vecR, deg) {
        if (vecL && vecR) {
            if (!(vecL.constructor === Vec)) vecL = new Vec(vecL);
            if (!(vecR.constructor === Vec)) vecR = new Vec(vecR);
            return vecL.subtract(this).angle2D(vecR.subtract(this), deg);
        }
        else if (vecL) return this.angle2D(vecL, deg);
        else if (vecR) return this.angle2D(vecR, deg);
        else return this.angle2D(deg);
    };

    //if apply is true: it adds v to this Vector and returns this Vector.
    //if apply is false: it adds v and this Vector and returns the result, without changing this vector.
    //if v is a single number it will be added to all axes of this Vector.
    Vec.prototype.add = function (v, apply) {
        var vec, i = this.length;
        if (typeof v == "number") {
            if (apply) {
                for (; i--;) this[i] += v;
                if(this.onchange) this.onchange(this);
                return this;
            } else {
                vec = new Vec();
                for (; i--;) vec[i] = this[i] + v;
                return vec;
            }
        } else {
            if (!(v.constructor === Vec)) v = new Vec(v);
            if (v.length > i) i = v.length;
            if (apply) {
                for (; i--;) this[i] = (this[i] || 0) + (v[i] || 0);
                if(this.onchange) this.onchange(this);
                return this;
            } else {
                vec = new Vec();
                for (; i--;) vec[i] = (this[i] || 0) + (v[i] || 0);
                return vec;
            }
        }
    };

    //if apply is true: it subtracts v from this Vector and returns this Vector.
    //if apply is false: it subtracts v from this Vector and returns the result, without changing this Vector.
    //if v is a single number it will be subtracted from all axes of this Vector.
    Vec.prototype.subtract = function (v, apply) {
        var vec, i = this.length;
        if (typeof v == "number") {
            if (apply) {
                for (; i--;) this[i] -= v;
                if(this.onchange) this.onchange(this);
                return this;
            } else {
                vec = new Vec();
                for (; i--;) vec[i] = this[i] - v;
                return vec;
            }
        } else {
            if (!(v.constructor === Vec)) v = new Vec(v);
            if (v.length > i) i = v.length;
            if (apply) {
                for (; i--;) this[i] = (this[i] || 0) - (v[i] || 0);
                if(this.onchange) this.onchange(this);
                return this;
            } else {
                vec = new Vec();
                for (; i--;) vec[i] = (this[i] || 0) - (v[i] || 0);
                return vec;
            }
        }
    };

    //if apply is true: it multiplies this Vector by v and returns this Vector.
    //if apply is false: it multiplies this Vector by v and returns the result, without changing this vector.
    //if v is a single number then all axes of this Vector will be multiplied by it.
    Vec.prototype.multiply = function (v, apply) {
        var vec, i = this.length;
        if (typeof v == "number") {
            if (apply) {
                for (; i--;) this[i] *= v;
                if(this.onchange) this.onchange(this);
                return this;
            } else {
                vec = new Vec();
                for (; i--;) vec[i] = this[i] * v;
                return vec;
            }
        } else {
            if (!(v.constructor === Vec)) v = new Vec(v);
            if (apply) {
                for (; i--;) if(v[i]) this[i] *= v[i];
                if(this.onchange) this.onchange(this);
                return this;
            } else {
                vec = new Vec();
                for (; i--;) vec[i] = this[i] * (v[i] || 0);
                return vec;
            }
        }
    };

    //if apply is true: it divides this Vector by v and returns this Vector.
    //if apply is false: it divides this Vector by v and returns the result, without changing this vector.
    //if v is a single number then all axes of this Vector will be divided by it.
    //BEWARE of Infinity values if v has a smaller number of axes than this Vector or v == 0;
    Vec.prototype.divide = function (v, apply) {
        var vec, i = this.length;
        if (typeof v == "number") {
            if (apply) {
                for (; i--;) this[i] = (this[i] || v)? this[i] / (v || 0) : 0;
                if(this.onchange) this.onchange(this);
                return this;
            } else {
                vec = new Vec();
                for (; i--;) vec[i] = (this[i] || v)? this[i] / (v || 0) : 0;
                return vec;
            }
        } else {
            if (!(v.constructor === Vec)) v = new Vec(v);
            if (apply) {
                for (; i--;) this[i] = (this[i] || v)? this[i] / (v[i] || 0) : 0;
                if(this.onchange) this.onchange(this);
                return this;
            } else {
                vec = new Vec();
                for (; i--;) vec[i] = (this[i] || v)? this[i] / (v[i] || 0) : 0;
                return vec;
            }
        }
    };

    Vec.prototype.addAxes = function (number,values) {
        if(typeof parseInt(number) == "number"){
            for(var i = 0, pos = this.length, val; i < number; i++){
                val = values[i] || values || 0;
                this[pos] = val;
                pos++
            }
        }
        if(this.onchange) this.onchange(this);
        return this;
    };

    //sets this Vector to vec or arguments if arguments.length > 1.
    Vec.prototype.set = function (vec) {
        if(arguments.length > 1) vec = new Vec(arguments);
        if (!(vec.constructor === Vec)) vec = new Vec(vec);
        var i = (this.length > vec.length) ? this.length : vec.length;
        for (; i--;) this[i] = vec[i] || 0;
        if(this.onchange) this.onchange(this);
        return this;
    };

    /*Vec.prototype.push = function(val){
     this[this.length] = parseFloat(val);
     };*/

    Vec.prototype.get2dBarycentricCoords = function(vecA,vecB,vecC){
        var v1 = vecB.subtract(vecA),
            v2 = vecC.subtract(vecA),
            v3 = this.subtract(vecA),
            d11 = v1.dot(v1),
            d12 = v1.dot(v2),
            d22 = v2.dot(v2),
            d31 = v3.dot(v1),
            d32 = v3.dot(v2),
            D = 1 / (d11 * d22 - d12 * d12),
            c = (d11 * d32 - d12 * d31) * D,
            b = (d22 * d31 - d12 * d32) * D,
            a = 1 - v - w,
            vec = new Vec(a,b,c);
        vec.order = "abc";
        return vec;
    };

    function DoolittleDet(S,d,type){
        console.log(S,type);
        if(d == 2 && type) return S[0][0]*S[1][1]-S[0][1]*S[1][0];
        else if(d == 2) return S[0]*S[3]-S[1]*S[2];
        type = type || 0;

        d = d || Math.floor(Math.sqrt(S.length));
        var D = [];
        var total = 1;
        var sum;
        var p;
        for(var k=0;k<d;++k){
            for(var j=k;j<d;++j){
                sum = 0;
                for (p = 0; p < k; ++p)sum += D[k * d + p] * D[p * d + j];
                D[k * d + j] = (type)? (S[k][j] - sum) : (S[k * d + j] - sum); // not dividing by diagonals
            }
            for(var i=k+1;i<d;++i){
                sum = 0;

                for (p = 0; p < k; ++p)sum += D[i * d + p] * D[p * d + k];
                D[i * d + k] = (type)? (S[i][k] - sum) / D[k * d + k] : (S[i * d + k] - sum) / D[k * d + k];
            }
            total *= D[k*d+k];
        }
        return total;
    }

    Vec.prototype.getBarycentricCoords = function(vertices,apply){
        var Vl = vertices.length-1;
        var answer = new Vec().set(this).subtract(vertices[Vl]);

        //This method uses Doolittle decomposition to find determinants to be used in Cramer's method.
        //It finds the barycentric coordinates of a vector point relative to a-
        //-triangle, tetrahedron or simplex made out of the points in argument "vertices".

        //The "answer" vector and all vertices a subtracted by the last vertex in "vertices" to improve performance.
        //Because the sum of any barycentric coordinates is always 1.

        //It's not the fastest method but it will work in any number of dimensions, which is nice.

        var d = []; //d will be the equation's matrix.
        var ds = []; //ds contains all the answer matrices.
        var vert1;
        var vert2;
        for(var i = 0, j; i < Vl; i++){
            vert1 = vertices[i].subtract(vertices[Vl]);
            d = d.concat(vert1);
            for(j = 0;j < Vl;j++) {
                if(ds[j]==undefined) ds[j] = [];
                vert2 = (i==j)? answer : vert1;
                ds[j] = ds[j].concat(vert2);
            }
        }

        var det = DoolittleDet(d, Vl);
        var dets = [];
        for(i = ds.length; i--;) dets.push(DoolittleDet(ds[i], Vl));
        dets.reverse(); //used push then reverse cause unshift is slow.

        var mn = 1, l = 0;
        var vec = (apply)? this : new Vec();
        var str = "";
        for(;l < Vl;l++) {
            mn -= vec[l] = dets[l]/det;
            str += String.fromCharCode(97 + l);
            console.log(str);
        }
        vec[l] = mn;
        vec.order = "abc";
        return vec;
    };

    Vec.prototype.toCartesianFromBarycentric = function(vertices,apply) {
        var vec = new Vec();
        var i = (vertices.length < this.length) ? vertices.length : this.length;
        for (; i--;) vec.add(vertices[i].multiply(this[i]), true)
        if(apply){
            this.set(vec);
            return this;
        } else return vec;
    };

    // ------------------------------------------------------ //
    // ------------------------------------------------------ //

    return Vec;
}();



