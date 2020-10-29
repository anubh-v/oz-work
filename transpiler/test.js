import { default as falafel } from 'falafel';
import { default as fs } from 'fs';

const threadPreamble = 'import { thread, suspendIfNeeded } from "./thread.js";';

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

  });

  output = wrapTopLevel(output);
  console.log(output);
}

function transformFunctionDefinition(node) {
  const functionId = node.id === null ? '' : node.id.source();
  const transformedCode = `async function ${functionId} (${insertInitialTimeIntoArgs(node.params)})
    ${node.body.source()}
  `
  node.update(transformedCode);
}

function transformNonAsyncCalls(node) {
  const transformedCode = `await suspendIfNeeded(initialTime, false,
    (initialTime) => ${node.callee.source()}(${insertInitialTimeIntoArgs(node.arguments)}))`;

  node.update(transformedCode);
}

function insertInitialTimeIntoArgs(argsArray) {
  return argsArray.reduce((a, c) => a + ',' + c.source(), 'initialTime');
}

function wrapTopLevel(topLevelSource) {
  return ` ${threadPreamble}
  thread(async (initialTime) => {
    ${topLevelSource}
  }); `
}


