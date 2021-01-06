

function generateRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random(null) * (max - min) + min);
    //The maximum is exclusive and the minimum is inclusive
}

const intGenerator = function () { return generateRandomInt(0, 10); }
const zeroGenerator = function () { return 0; }
  
function generateRow(rowLength, numGenerator) {
    const row = [];
    for (let i = 0; i < rowLength; i++) {
        const num = numGenerator(null);
        row.push(num);
    }
    return row;
}

function generateMatrix(numGenerator) {
    const n = 25;
    const matrix = [];
    for (let i = 0; i < n; i++) {
        matrix.push(generateRow(n, numGenerator));
    }
    return matrix;
}

function dotProduct(row, matrix, colNum) {
    let result = 0;
    for (let i = 0; i < row.length; i++) {
        result += (row[i] * matrix[i][colNum]);
    }
    return result;
}

let doneFlags = [];
function fillRow(rowNum) {
    const numCols = C.length;
    for (let i = 0; i < numCols; i++) {
        const temp = dotProduct(A[rowNum], B, i);
        C[rowNum][i] = temp;
    }
    doneFlags[rowNum] = true;

    console.log(C);
}


const A = generateMatrix(intGenerator);
const B = generateMatrix(intGenerator);
const C = generateMatrix(zeroGenerator);

for(let i = 0; i < A.length; i++) {
    thread(() => fillRow(i));
}
