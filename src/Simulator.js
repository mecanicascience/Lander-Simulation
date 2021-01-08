class Simulator {
    constructor() {
        this.terrain = new Terrain();
        this.lander  = new Lander(this.terrain);

        this.terrain.generate();
        this.lander.instanciate();
    }

    update(dt) {
        this.lander.update(dt);
    }

    draw(drawer) {
        this.terrain.draw(drawer);
        this.lander.draw(drawer);
    }
}
