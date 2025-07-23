export default class Table2d<T> {
	rows: number;
	columns: number;
	data: T[][];
	constructor(rows: number, columns: number) {
		this.rows = rows;
		this.columns = columns;
		this.data = Array.from({ length: rows }, () => Array(columns).fill(null));
	}

	#CheckBounds(row: number, column: number) {
		if (row < 0 || row >= this.rows || column < 0 || column >= this.columns) {
			throw new Error('Index out of bounds');
		}
	}

	set(row: number, column: number, value: T) {
		this.#CheckBounds(row, column);
		this.data[row][column] = value;
	}

	get(row: number, column: number): T {
		this.#CheckBounds(row, column);
		return this.data[row][column];
	}

	fill(value: T) {
		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.columns; j++) {
				this.data[i][j] = value;
			}
		}
		return this;
	}

	drawBox(x1: number, x2: number, y1: number, y2: number, value: T, fill = true) {
		const minX = Math.max(0, Math.min(x1, x2));
		const maxX = Math.min(this.columns - 1, Math.max(x1, x2));
		const minY = Math.max(0, Math.min(y1, y2));
		const maxY = Math.min(this.rows - 1, Math.max(y1, y2));
		for (let i = minY; i <= maxY; i++) {
			for (let j = minX; j <= maxX; j++) {
				if (
					fill ||
					i === minY || i === maxY ||
					j === minX || j === maxX
				) {
					this.set(i, j, value);
				}
			}
		}
	}

	toArray() {
		return this.data;
	}
}