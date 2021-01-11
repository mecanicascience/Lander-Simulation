class Matrix {
    /**
    * Creates a new Matrix stored as datas[row][col]
    * @param rows Rows number
    * @param cols Columns number
    */
    constructor(rows, cols) {
        if (rows instanceof Array) {
            this.rows = rows.length;
            this.cols = rows[0].length;
            this.datas = rows;
            return;
        }

        this.rows = rows;
        this.cols = cols;

        this.datas = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
    }

    /**
    * Creates a arr.lengthx1 matrix from an array
    * @param arr The array
    * @return The matrix
    */
    static fromArray(arr) {
        let m = new Matrix(arr.length, 1);
        return m.map((el, i, j, min, max) => arr[i]);
    }



    /**
    * @return the element at Matrix[i][j]
    */
    get(i, j) {
        if (this.datas[i] == undefined) {
            console.error(`The matrix element at (${i}, ${j}) is undefined.`);
            return null;
        }
        return this.datas[i][j];
    }


    /**
    * Add another matrix to this matrix
    * @param m The matrix
    * @return The new matrix
    */
    add(m) {
        if (this.cols != m.cols || this.rows != m.rows) {
            console.error('Columns and Rows of this matrix must be the same.');
            return;
        }

        return this.map(((el, i, j) => el + m.datas[i][j]));
    }

    /**
    * Add two matrix as m1+m2
    * @param m1 First Matrix
    * @param m2 Second Matrix
    * @return m1+m2
    */
    static add(m1, m2) {
        return m1.copy().add(m2);
    }

    /**
    * Multiplies two matrix as m1*m2 or consider m2 as a scalar
    * @param m1 First Matrix
    * @param m2 Second Matrix or scalar
    * @return m1*m2
    */
    static mult(m1, m2) {
        if (!(m2 instanceof Matrix)) // Scalar Product
            return m1.map(el => el * m2);

        // Matrix product
        if (m1.cols != m2.rows) {
            console.error('Columns and Rows of this matrix must match Columns and Rows of the passed matrix.');
            return;
        }

        let m3 = new Matrix(m1.rows, m2.cols);
        return m3.map(((el, i, j) => {
            let sum = 0;
            for (let k = 0; k < m1.cols; k++)
                sum += m1.datas[i][k] * m2.datas[k][j];
            return sum;
        }));
    }



    /**
    * Randomize each coefficient of the Matrix
    * @param min Minimum random number (default 0)
    * @param max Maximum random number (default 1)
    * @return this, as the modified Matrix
    */
    randomize(min = 0, max = 1) {
        return this.map((el, i, j, min, max) => random(min, max), min, max);
    }

    /**
    * Executes a function on each terme of the matrix.
    * The function should return the new value of the corresponding element.
    * @param fun The function ran as fun(element, element_row_index, element_column_index, args)
    * @param args Arguments passed to the function as `map(your_function, arg0, arg1, ...)`
    * @return this, as the modified Matrix
    */
    map(fun, ...args) {
        this.datas = this.datas.map((row, i) => row.map((el, j) => fun(el, i, j, ...args)));
        return this;
    }

    /**
    * @return the maximum value of every coefficients in the Matrix
    */
    max() {
        let max = -Infinity;
        this.datas.forEach(el => max = Math.max(...el) > max ? Math.max(...el) : max);
        return max;
    }

    /**
    * @return the minimum value of every coefficients in the Matrix
    */
    min() {
        let min = +Infinity;
        this.datas.forEach(el => min = Math.min(...el) < min ? Math.min(...el) : min);
        return min;
    }



    /**
    * Logs the matrix to the developer console
    * @return this
    */
    log() {
        console.table(this.datas);
        return this;
    }

    /** @return a copy of the Matrix */
    copy() {
        let m = new Matrix(this.rows, this.cols);
        m.datas = this.datas;
        return m;
    }

    /** @return a JSON string representation of the Matrix */
    stringify() {
        return JSON.stringify(this.datas);
    }
}
