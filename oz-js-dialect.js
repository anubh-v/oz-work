// Variable creation

// Idea 1
local(X, Y, Z, () => {
    // code using X, Y, Z
});

// Idea 2
{
  local: {
      const X;
      const Y = 3;
      const Z = false;
  }

  // code using X, Y, Z
}

// Idea 3
{
    const X;
    const Y;
}

// Idea 4

for(let X, Y = 3;;) {
    // code using X, Y
}

// case
switch(x) {
    case {record_label: {feature1: a, feature2: b}}:
      foo();
    default:
      bar();
}

// Records
X = {record_label: {feature1: val, feature2: val}}

// Tuples
X = {record_label: (val1, val2, val3)}; // syntactic sugar for {record_label: {1: val1, 2:val2}}

// List is either null or a 2-element tuple where the tuple tail is a list
X = {pair: (1, {pair: (2, {pair: (3, null)})})} 
X = [1, 2, 3]

// Procedure
foo = function*(x, y, z) {  /* procedure body */  }
function* foo(x, y, z) { /* procedure body */ }

// Functions
function foo(x, y) { /* function body */ }
foo = (x, y) => {  /* function body */  }


// ----------- Examples -------------

/**
  local Max in
   proc {Max X Y Result1}
      local IfArbiter1 in
	 IfArbiter1 = X < Y
	 if IfArbiter1 then
	    Y = Result1
	 else
	    X = Result1
	 end
      end
   end
  end
 */

{
    const max;
    max = function*(x, y, result) {
        {
            const IfArbiter1;
            IfArbiter1 = x < y;
            if (IfArbiter1) {
                y = result;
            } else {
                x = result;
            }
        }
    }
}

{
    const fact;
    fact = function*(n, result) {
        {
            const IfArbiter1;
            const UnnestApply1;
            UnnestApply1 = 0;
            IfArbiter1 = n == UnnestApply1;
            if (IfArbiter1) {
                result = 1;
            } else {
                {
                    const UnnestApply2;
                    const UnnestApply3;
                    const UnnestApply4;
                    UnnestApply4 = 1;
                    UnnestApply3 = n - UnnestApply4;
                    fact(UnnestApply3, UnnestApply2);
                    result = n * UnnestApply2;
                }
            }

        }
    }
}

