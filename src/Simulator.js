class Simulator {
    constructor() {
        this.terrain = new Terrain();

        this.landers = [];
        for (let i = 0; i < 200; i++)
            this.landers[i] = new Lander(this.terrain);

        this.terrain.generate();
        this.landers.forEach((item, i) => item.instanciate(
            new Vector(-70, 70),
            new Vector(random(0, 60)-30, random(0, 60)-30),
            2*Math.PI * random(0, 1),
            random(0, 100)
        ));
    }

    update(dt) {
        for (let i = 0; i < this.landers.length; i++)
             this.landers[i].update(dt);
    }

    draw(drawer) {
        this.terrain.draw(drawer);

        for (let i = 0; i < this.landers.length; i++)
             this.landers[i].draw(drawer);
    }
}
