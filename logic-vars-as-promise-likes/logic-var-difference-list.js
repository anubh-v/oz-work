import { LogicVariable } from "./logic-var.js";

function make_difference_list(val=null) {
    const back = new LogicVariable();
    const front = new LogicVariable([new LogicVariable(val), back]);

    return new LogicVariable([front, back]);
}

async function print_list(list) {
    const [head, tail] = await list;
    console.log(await head);
    print_list(tail);
}

async function append(xs, ys) {
    const [xs_front, xs_back] = await xs;
    const [ys_front, ys_back] = await ys;
    xs_back.unify(ys_front);
    return new LogicVariable([xs_front, ys_back]);
}

async function add(xs, e) {
    const ys = make_difference_list(e);
    return await append(xs, ys);
}

(async function() {
  let xs = make_difference_list(1);
  xs = await add(xs, 2);
  xs = await add(xs, 3);
  const [ys_front, ys_back] = await xs;
  print_list(ys_front);
})();