import { default as falafel } from 'falafel';
import { default as fs } from 'fs';

const threadPreamble = `import { ThreadManager, mark } from "../thread.js";
                        import { Message } from "../message.js";
                        const manager = new ThreadManager();
                        const thread = function(...args) {
                            return manager.spawnThreads(...args);
                        }`;

const infile = process.argv[2];
const outfile = process.argv[3];

fs.readFile(infile, 'utf8', function(err, data) {
  const transpiledCode = transform(data);
  fs.writeFile(outfile, transpiledCode, 'utf8', function(err) {
    if (err) console.log(`Error writing transpiled code to file: ${err}`);
  });
});

function transform(source) {
  let output = falafel(source, {sourceType: "module"}, function (node) {
    if (node.type === 'FunctionDeclaration') {
      transformFunctionDefinition(node);
    } else if (node.type === 'FunctionExpression') {
      transformFunctionExpression(node);
    } else if (node.type === 'CallExpression') {
      transformCalls(node);
    } else if (node.type === 'ArrowFunctionExpression') {
      transformArrowFunction(node);
    } else if (node.type === 'AwaitExpression') {
      transformAwaitExpression(node);
    }
  });

  return wrapTopLevel(output);
}

/**
 * Converts a function definition into a generator function definition.
 * The 1st argument of the generator function will be an object containing the thread state.
 */
function transformFunctionDefinition(node) {
  const functionId = node.id.source();
  let transformedCode = `function* ${functionId} (${insertThreadStateIntoArgs(node.params)})
    ${node.body.source()}`;
  
  transformedCode += `mark(${functionId});`
  node.update(transformedCode);
}

/**
 * Converts a function expression into a generator function expression.
 * The 1st argument of the generator function will be an object containing the thread state.
 */
function transformFunctionExpression(node) {
  const transformedCode = `mark(function* (${insertThreadStateIntoArgs(node.params)})
    ${node.body.source()})`;
  
  node.update(transformedCode);
}

/**
 * Converts an arrow function expression into a generator function expression.
 * The 1st argument of the generator function will be an object containing the thread state.
 */
function transformArrowFunction(node) {
  const transformedCode = `mark(function*(${insertThreadStateIntoArgs(node.params)}) { ${node.body.source()} })`;
  node.update(transformedCode);
}

function transformCalls(node) {

  if (isThreadCall(node)) {
    node.arguments.forEach(arg => arg.source());
    return;
  }

  if (node.callee.type === 'MemberExpression') {
    return transformMethodCalls(node);
  }
  
  const transformedCode = `(yield* manager.suspendAndCall(threadState, undefined, ${node.callee.source()}, ${getArgs(node.arguments).reduce((a, c) => a + ',' + c)}))`;
  node.update(transformedCode);
}

function transformMethodCalls(node) {

  if (node.callee.object.type === 'CallExpression') {
    return;
  }

  const obj = node.callee.object.source();
  const func = node.callee.source();

  if (node.arguments.length === 0) {
    const transformedCode = `(yield* manager.suspendAndCall(threadState, ${obj}, ${func}))`;
    node.update(transformedCode);
  } else {
    const transformedCode = `(yield* manager.suspendAndCall(threadState, ${obj}, ${func}, ${getArgs(node.arguments).reduce((a, c) => a + ',' + c)}))`;
    node.update(transformedCode);
  }
}

function transformAwaitExpression(node) {
  const promise = node.argument;
  const transformedCode = `(yield new Message('AWAIT', ${promise.source()}))`;
  node.update(transformedCode);
}


function insertThreadStateIntoArgs(argsArray) {
  return argsArray.reduce((a, c) => a + ',' + c.source(), 'threadState');
}

function getArgs(argsArray) {
  return argsArray.map(arg => arg.source());
}

function isThreadCall(node) {
  return node.callee.type === 'Identifier' && node.callee.name === 'thread';
}

function wrapTopLevel(topLevelSource) {
  return ` ${threadPreamble}
  manager.start(function*(threadState) {
    ${topLevelSource}
  }); `;
}


