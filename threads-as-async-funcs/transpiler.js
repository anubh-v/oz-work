import { default as falafel } from 'falafel';
import { default as fs } from 'fs';

const threadPreamble = 'import { thread, suspendNeeded, suspend, mark, callHandler } from "./thread.js";';

const infile = process.argv[2];

fs.readFile(infile, 'utf8', function(err, data) {
  transform(data);
});

function transform(source) {
  let output = falafel(source, function (node) {
    if (node.type === 'FunctionDeclaration') {
      transformFunctionDefinition(node);
    }

    if (node.type === 'FunctionExpression') {
      transformFunctionExpression(node);
    }

    if (node.type === 'CallExpression') {
      transformNonAsyncCalls(node);
    }

    if (node.type === 'ArrowFunctionExpression') {
      transformArrowFunction(node);
    }

  });

  output = wrapTopLevel(output);
  console.log(output);
}

function transformArrowFunction(node) {
  const transformedCode = `mark(async (${insertInitialTimeIntoArgs(node.params)}) => ${node.body.source()})`;
  node.update(transformedCode);
}

function transformFunctionDefinition(node) {
  const functionId = node.id = node.id.source();
  let transformedCode = `async function ${functionId} (${insertInitialTimeIntoArgs(node.params)})
    ${node.body.source()}`;
  
  transformedCode += `mark(${functionId});`
  node.update(transformedCode);
}

function transformFunctionExpression(node) {
  const transformedCode = `mark(async function (${insertInitialTimeIntoArgs(node.params)})
    ${node.body.source()})`;
  
  node.update(transformedCode);
}

function transformNonAsyncCalls(node) {

  if (isExternalFunction(node)) {
    return;
  }

  if (isThreadCall(node)) {
    node.arguments.forEach(arg => arg.source());
    return;
  }
  
  const transformedCode = `suspendNeeded(threadState) ? await suspend(threadState, () => callHandler(threadState, ${node.callee.source()}, ${getArgs(node.arguments).reduce((a, c) => a + "," + c)})) : callHandler(threadState, ${node.callee.source()}, ${getArgs(node.arguments).reduce((a, c) => a + ',' + c)})`;
  node.update(transformedCode);
}

function insertInitialTimeIntoArgs(argsArray) {
  return argsArray.reduce((a, c) => a + ',' + c.source(), 'threadState');
}

function getArgs(argsArray) {
  return argsArray.map(arg => arg.source());
}

function isThreadCall(node) {
  return node.callee.type === 'Identifier' && node.callee.name === 'thread';
}

function isExternalFunction(node) {
  return node.callee.type === 'Identifier' &&
    (node.callee.name === 'setTimeout' || node.callee.name === 'log');
}

function wrapTopLevel(topLevelSource) {
  return ` ${threadPreamble}  
  thread(async (threadState) => {
    ${topLevelSource}
  }); `
}


