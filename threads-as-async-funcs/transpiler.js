import { default as falafel } from 'falafel';
import { default as fs } from 'fs';

const threadPreamble = 'import { thread, suspendNeeded, suspend } from "./thread.js";';

const infile = process.argv[2];

fs.readFile(infile, 'utf8', function(err, data) {
  transform(data);
});

function transform(source) {
  let output = falafel(source, function (node) {
    if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression') {
      transformFunctionDefinition(node);
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
  const transformedCode = `async (${insertInitialTimeIntoArgs(node.params)}) => ${node.body.source()}`;
  node.update(transformedCode);
}

function transformFunctionDefinition(node) {
  const functionId = node.id === null ? '' : node.id.source();
  const transformedCode = `async function ${functionId} (${insertInitialTimeIntoArgs(node.params)})
    ${node.body.source()}`;
  
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
  
  const transformedCode = `suspendNeeded(threadState) ? await suspend(threadState, () => ${node.callee.source()}(${insertInitialTimeIntoArgs(node.arguments)})) : ${node.callee.source()}(${insertInitialTimeIntoArgs(node.arguments)})`;
  node.update(transformedCode);
}

function insertInitialTimeIntoArgs(argsArray) {
  return argsArray.reduce((a, c) => a + ',' + c.source(), 'threadState');
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


