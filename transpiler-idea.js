
// Top level

<s1> <s2> … <sN>

function* top_level(runtimeStack) {

  <transpiled-s1>
  <transpiled-s2>
  ...

}


// variable creation

local <x1> <x2> <x3> in <s> end

Environment newEnvironment = new Environment(currentEnvironment);
forAll([‘x1’, ‘x2’, ‘x3’],
       identifier => newEnvironment.addBinding(identifier,
                                      {type:”transient”, value:null}))


runtimeStack.unshift(newEnvironment);
<transpiled-s>;

runtimeStack.shift();

// variable - variable binding

<x1> = <x2>

unify(currentEnvironment.get(‘x1’), currentEnvironment.get(‘x2’));


<x> = <v>

unify(currentEnvironment.get(‘x’), {type: ‘...’, value: ‘...’});

if <x> then <s1> else <s2> end

isDetermined(currentEnvironment.get(‘x’));
unify(currentEnvironment.get(‘x’), true);
if (currentEnvironment.getValue(‘x’)) {
  <transpiled-s1>;
} else {
  <transpiled-s2>;
}

proc { $ <x1> <x2> … <xN> } <s> end

{type: ‘procedure’, value: function(runtimeStack) { <transpiled-s> },
                    params: [‘x1’, ‘x2’, ‘x3’] }

  



{ <x> <y1> … <yN> }


let procedure = currentEnvironment.get(‘x’);
isDetermined(procedure);
isProcedure(procedure);
let params = procedure.params;
checkArity(params, [‘y1’, ‘y2’, ..]);
Environment newEnvironment = new Environment(currentEnvironment);
forAll(zip(params, [‘y1’, ‘y2’, ..]),
       (param, arg)  => newEnvironment.addBinding(param,arg));

runtimeStack.unshift(newEnvironment);
yield* procedure.value(runtimeStack);
runtimeStack.shift();

thread <s> end

let runtimeStackCopy = shallowCopy(runtimeStack);
yield { message: ‘ADD_NEW_THREAD’,
        new_thread: (function* (runtimeStack) {
                        <transpiled-s>
                    })(runtimeStackCopy)
      }



