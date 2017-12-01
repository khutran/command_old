var mixin = require('mixin');

class Cyclist {
    ride() {
        console.log(`${this.name} is riding`);
    }   
}

class Swimmer {
    swim() {
        console.log(`${this.name} is swimming`);
    }
}

class Runner {
    run() {
        console.log(`${this.name} is running`);
    }
}

class job {
    job() {
        console.log(`${this.name} is jobing`);
    }
}

mixin(mixin(mixin(Cyclist, Runner), Swimmer), job);
// console.log(mi);
// console.log(Runner);
class Triathlete extends mixin(Cyclist, Swimmer) {
        
    constructor(name) {
    	super();
        this.name = name;

    }

    letsDoIt() {
        this.ride();
        this.swim();
        this.run();
        this.job();
    }
}

let bob = new Triathlete('khu');
bob.letsDoIt();