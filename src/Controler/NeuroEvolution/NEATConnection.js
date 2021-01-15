class NEATConnection {
    constructor(nodeFrom, nodeTo, weight, enabled, innovationNumber) {
        this.nodeFrom = nodeFrom;
        this.nodeTo   = nodeTo;

        this.innovationNumber = innovationNumber;

        this.weight  = weight;
        this.enabled = enabled;
    }


    draw(drawer, confScale) {
        // Draws connection
        let col = this.weight > 0 ? [70, 200, 70] : [200, 70, 70];
        col[3] = Math.round(Math.abs(this.weight) * 255);
        
        drawer
            .noFill()
            .stroke(col)
            .strokeWeight(2)
            .line(
                this.nodeFrom.pos.x * confScale.x, this.nodeFrom.pos.y * confScale.y,
                this.nodeTo.pos.x   * confScale.x, this.nodeTo.pos.y   * confScale.y
            );

        // Draws connected nodes
        if (!this.nodeFrom.drawn)
            this.nodeFrom.draw(drawer, confScale);
        if (!this.nodeTo.drawn)
            this.nodeTo.draw(drawer, confScale);
    }
}
