class Simulator {
    constructor() {
        this.terrain = new Terrain();
        this.lander  = new Lander();

        this.terrain.generate();
    }

    update(dt) {

    }

    draw(drawer) {
        this.terrain.draw(drawer);
    }
}
