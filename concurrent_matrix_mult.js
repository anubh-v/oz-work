let NUM_THREADS = 800;


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
  for (let i = 0; i < NUM_THREADS; i = i + 1) {
    result = result + (row[i] * right_matrix[i][col_index]);
  }
  return result;
}

function matrix_mult(left_mat, right_mat) {
  let result = [];
  for (let k = 0; k < NUM_THREADS; k = k + 1) {
    result[k] = [];
  }
  display(result);

  for(let i = 0; i < NUM_THREADS; i = i + 1) {
    concurrent_execute(() => {
      display(i);
      // display(left_mat);
      let row = left_mat[i];
      // display(row);
      for (let j = 0; j < 5; j = j + 1) {
        result[i][j] = dot_product(row, right_mat, j);
      }
      // display(result);
    });
  }

  return result;
}



let A  = make_matrix(NUM_THREADS, NUM_THREADS);
let B  = make_matrix(NUM_THREADS, 5);
display(A);
display(B);
matrix_mult(A, B);
