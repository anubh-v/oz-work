const NUM_THREADS = 6000;
const ROW_SIZE_A = 6000;
const COL_SIZE_A = 50;
const COL_SIZE_B = 5;
const ROWS_PER_THREAD = ROW_SIZE_A / NUM_THREADS;

function getRandomInt(min, max) {
  min = math_ceil(min);
  max = math_floor(max);
  return math_floor(math_random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}


function make_matrix(row_size, col_size) {

  const matrix = [];

  function make_row() {
    const row = [];
    for (let i = 0; i < col_size; i = i + 1) {
      row[i] = getRandomInt(0, 10);
    }
    return row;
  }

  for (let i = 0; i < row_size; i = i + 1) {
    matrix[i] = make_row();
  }

  return matrix;
}

function dot_product(row, right_matrix, col_index) {
  let result = 0;
  for (let i = 0; i < COL_SIZE_A; i = i + 1) {
    result = result + (row[i] * right_matrix[i][col_index]);
  }
  return result;
}

function matrix_mult(left_mat, right_mat) {
  let result = [];
  for (let k = 0; k < ROW_SIZE_A; k = k + 1) {
    result[k] = [];
  }
  // display(result);

  for(let i = 0; i < NUM_THREADS; i = i + 1) {
    concurrent_execute(() => {
      // display(i);
      // display(left_mat);
      const start_row = i * ROWS_PER_THREAD;
      // display(start_row);
      const end_row = start_row + ROWS_PER_THREAD;
      // display(row);
      for(let j = start_row; j < end_row; j = j + 1) {
        const row = left_mat[j];
        for (let k = 0; k < COL_SIZE_B; k = k + 1) {
          result[j][k] = dot_product(row, right_mat, k);
        }
        //display(result);
      }
    });
  }

  return result;
}



let A  = make_matrix(ROW_SIZE_A, COL_SIZE_A);
let B  = make_matrix(COL_SIZE_A, COL_SIZE_B);
// display(A);
// display(B);
matrix_mult(A, B);
