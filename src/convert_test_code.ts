// Copyright 2020-present numb86. All rights reserved. MIT license.

import { escodegen, parse, replace } from "./deps.ts";
import { TARGET_ASSERT_FUNCTION_LIST } from "./empower.ts";

import type {
  Expression,
  Literal,
  Node,
  Program,
  Property,
  SpreadElement,
  VariableDeclaration,
} from "../types/estree.d.ts";

function isAssertFunction(nodeType: string) {
  return TARGET_ASSERT_FUNCTION_LIST.some((elem) => elem === nodeType);
}

const POWER_ASSERT_RECORD_CLASS_NAME = "_PowerAssertRecorder";
const EXPR_METHOD_NAME = "expr";
const CAPT_METHOD_NAME = "capture";

const sourceOfPowerAssertRecorder = `class ${POWER_ASSERT_RECORD_CLASS_NAME} {
  constructor() {
    this.captured = [];
  }

  ${CAPT_METHOD_NAME}(value, espath) {
    this.captured.push({value, espath});
    return value;
  }

  ${EXPR_METHOD_NAME}(value, source) {
    const capturedValues = this.captured;
    this.captured = [];
    return {
      powerAssertContext: {
        value,
        events: capturedValues,
      },
      source,
    };
  }
}
`;

function getAbsolutePath(path: string, testFilePath: string): string {
  if (path.startsWith("./")) {
    const testFilePathArray = testFilePath.split("/");
    testFilePathArray.pop();
    const dirName = testFilePathArray.join("/");
    return `${dirName}${path.slice(1)}`;
  }

  if (path.startsWith("../")) {
    const testFilePathArray = testFilePath.split("/");
    testFilePathArray.pop();

    let pathArray = path.split("../");

    let done = false;
    let count = 0;
    pathArray.forEach((elem) => {
      if (elem !== "") {
        done = true;
      }
      if (!done) {
        count += 1;
      }
    });

    for (let i = count; i > 0; i -= 1) {
      pathArray.shift();
      testFilePathArray.pop();
    }

    return `${testFilePathArray.join("/")}/${pathArray.join("../")}`;
  }
  throw new Error(
    `getAbsolutePath is for strings starting with \`./\` or \`../\`. ${path} is not.`,
  );
}

function wrapNodeByCapture(
  args: [Node, Literal],
  powerAssertRecorderNumber: number,
) {
  return {
    type: "CallExpression",
    callee: {
      type: "Identifier",
      name: `_rec${powerAssertRecorderNumber}.${CAPT_METHOD_NAME}`,
    },
    arguments: args,
  };
}

function wrapNodeByExpr(
  wrappedNode: Node,
  powerAssertRecorderNumber: number,
) {
  return {
    type: "CallExpression",
    callee: {
      type: "Identifier",
      name: `_rec${powerAssertRecorderNumber}.${EXPR_METHOD_NAME}`,
    },
    arguments: [wrappedNode],
  };
}

function isTargetOfWrapByExpr(nodeType: string) {
  return true;
}

function getArgumentIndex(
  targetArg: Node,
  args: Array<Expression | SpreadElement>,
) {
  let argumentIndex: number | undefined;

  args.forEach((argument, index) => {
    if (targetArg.range === undefined) {
      throw new Error("targetArg.range is undefined.");
    }

    if (argument.range) {
      if (
        argument.range[0] === targetArg.range[0] &&
        argument.range[1] === targetArg.range[1]
      ) {
        argumentIndex = index;
      }
    }
  });

  if (argumentIndex === undefined) {
    throw new Error("argumentIndex is undefined.");
  }

  return argumentIndex;
}

// https://github.com/estools/escodegen/wiki/API#optionverbatim
function usePrecedence(ast: Node) {
  replace(ast, {
    enter(node) {
      if (node.type === "Literal" && typeof node.value === "string") {
        const wrapByQuotation = (value: string) => {
          return value.includes('"') ? `'${value}'` : `"${value}"`;
        };
        return {
          ...node,
          "x-verbatim-property": {
            content: wrapByQuotation(node.value),
            precedence: escodegen.Precedence.Primary,
          },
        };
      }
    },
  });
  return ast;
}

export function convertTestCode(targetSourceCode: string, filepath: string) {
  const ast = parse(
    targetSourceCode,
    {
      ecmaVersion: 2020,
      locations: true,
      ranges: true,
      allowAwaitOutsideFunction: true,
      sourceType: "module",
    },
  );
  let powerAssertRecorderCount = 0;
  let usedPowerAssertRecorderCount = 0;

  const getInstanceAsts = (
    nodes: Node[],
    isChildOfAsyncFn: boolean,
    isChildOfGeneratorFn: boolean,
  ) => {
    const createInstanceAsts: VariableDeclaration[] = [];

    nodes.forEach((elem) => {
      let targetElem;
      let assertArguments;
      let assertArgumentsCount;
      if (
        elem.type === "ExpressionStatement" &&
        elem.expression.type === "AwaitExpression" &&
        elem.expression.argument.type === "CallExpression" &&
        elem.expression.argument.callee.type === "Identifier" &&
        isAssertFunction(elem.expression.argument.callee.name)
      ) {
        targetElem = elem.expression.argument;
        assertArguments = elem.expression.argument.arguments;
        assertArgumentsCount = assertArguments.length;
      }
      if (
        elem.type === "ExpressionStatement" &&
        elem.expression.type === "CallExpression" &&
        elem.expression.callee.type === "Identifier" &&
        isAssertFunction(elem.expression.callee.name)
      ) {
        targetElem = elem;
        assertArguments = elem.expression.arguments;
        assertArgumentsCount = assertArguments.length;
      }

      if (targetElem && assertArguments && assertArgumentsCount) {
        for (let x = 1; x <= assertArgumentsCount; x += 1) {
          const { type } = assertArguments[x - 1];

          // If don't wrap the assert function argument with expr, don't have to create PowerAssertRecorder instance and Source
          if (isTargetOfWrapByExpr(type)) {
            // Add statement that create instance of PowerAssertRecorder
            powerAssertRecorderCount += 1;
            const createInstanceAst = (parse(
              `const _rec${powerAssertRecorderCount} = new ${POWER_ASSERT_RECORD_CLASS_NAME}()`,
              { ecmaVersion: 2020, locations: true },
            ) as Node as Program).body[0] as VariableDeclaration;

            createInstanceAsts.push(createInstanceAst);

            // Save information about the original source code, for passing as the second argument to expr
            const content = escodegen.generate(usePrecedence(targetElem), {
              format: { indent: { style: "" }, newline: "" },
              verbatim: "x-verbatim-property",
            });

            if (!targetElem.loc) {
              throw new Error("elem.loc is null or undefined.");
            }

            const { line } = targetElem.loc.start;

            const source = {
              content,
              filepath,
              line,
              async: isChildOfAsyncFn,
              generator: isChildOfGeneratorFn,
            };

            sources.set(`_rec${powerAssertRecorderCount}`, source);
          }
        }
      }
    });

    return createInstanceAsts;
  };

  const captureRegexp = new RegExp(`^_rec[0-9]{1,}.${CAPT_METHOD_NAME}$`);

  const sources = new Map();

  replace((ast as Node), {
    // deno-lint-ignore ban-ts-comment
    // @ts-ignore
    enter(node, parent) {
      if (parent === null) {
        return undefined;
      }

      if (node.type === "ImportExpression" && node.source.type === "Literal") {
        const value = node.source.value as string;
        if (value.startsWith("./") || value.startsWith("../")) {
          const absolutePath = getAbsolutePath(value, filepath);
          return {
            ...node,
            source: {
              type: "Literal",
              value: absolutePath,
              raw: `"${absolutePath}"`,
            },
          };
        }
      }

      if (node.type === "ImportDeclaration") {
        const value = node.source.value as string;
        if (value.startsWith("./") || value.startsWith("../")) {
          const absolutePath = getAbsolutePath(value, filepath);
          return {
            ...node,
            source: {
              type: "Literal",
              value: absolutePath,
              raw: `"${absolutePath}"`,
            },
          };
        }
      }

      if (node.type === "BlockStatement") {
        if (
          parent.type === "ArrowFunctionExpression" ||
          parent.type === "FunctionExpression" ||
          parent.type === "FunctionDeclaration"
        ) {
          node.body.unshift(
            ...getInstanceAsts(node.body, !!parent.async, !!parent.generator),
          );
        } else {
          node.body.unshift(
            ...getInstanceAsts(node.body, false, false),
          );
        }
      }

      // Wrap each argument of assert with `capture` and then with `expr`
      // roughly speaking
      // assert(x) -> assert(expr(capture(x)))
      if (
        parent.type === "CallExpression" &&
        parent.callee.type === "Identifier" &&
        isAssertFunction(parent.callee.name) &&
        isTargetOfWrapByExpr(node.type)
      ) {
        if (node.type === "Identifier" && isAssertFunction(node.name)) {
          return node;
        }

        const argumentIndex = getArgumentIndex(node, parent.arguments);

        usedPowerAssertRecorderCount += 1;
        const wrappedNodeByCapture = wrapNodeByCapture(
          [
            node,
            {
              type: "Literal",
              value: `arguments/${argumentIndex}`,
              raw: `"arguments/${argumentIndex}"`,
            },
          ],
          usedPowerAssertRecorderCount,
        ) as Node;
        return wrapNodeByExpr(
          wrappedNodeByCapture,
          usedPowerAssertRecorderCount,
        );
      }

      // Spread operator correspondence
      if (
        node.type === "CallExpression" &&
        node.arguments[0] &&
        node.arguments[0].type === "SpreadElement" &&
        node.callee.type === "Identifier" &&
        captureRegexp.test(node.callee.name)
      ) {
        const secondArgumentOfParent = (node.arguments[1] as Literal).value;
        return {
          type: "SpreadElement",
          argument: wrapNodeByCapture([node.arguments[0].argument, {
            type: "Literal",
            value: `${secondArgumentOfParent}/argument`,
            raw: `"${secondArgumentOfParent}/argument"`,
          }], usedPowerAssertRecorderCount),
        };
      }

      // Await expression correspondence
      // e.g. _rec1.capture(await Promise.resolve(x), 'arguments/0')
      if (
        node.type === "AwaitExpression" && parent.type === "CallExpression" &&
        parent.callee.type === "Identifier" &&
        captureRegexp.test(parent.callee.name)
      ) {
        const secondArgumentOfParent = (parent.arguments[1] as Literal).value;
        return {
          ...node,
          argument: wrapNodeByCapture([node.argument, {
            type: "Literal",
            value: `${secondArgumentOfParent}/argument`,
            raw: `"${secondArgumentOfParent}/argument"`,
          }], usedPowerAssertRecorderCount),
        };
      }

      // The target of the following blocks is the node that is the argument of `capture`
      if (
        parent.type === "CallExpression" &&
        parent.callee.type === "Identifier" &&
        captureRegexp.test(parent.callee.name) &&
        // deno-lint-ignore ban-ts-comment
        // @ts-ignore
        !captureRegexp.test(node.name)
      ) {
        // e.g. arguments/0
        const secondArgumentOfParent = (parent.arguments[1] as Literal).value;

        // If the capture argument is function call
        if (node.type === "CallExpression") {
          const newArguments = node.arguments.map(
            (arg: Node, index: number) => {
              if (arg.type !== "Literal") {
                return wrapNodeByCapture(
                  [
                    arg,
                    {
                      type: "Literal",
                      value: `${secondArgumentOfParent}/arguments/${index}`,
                      raw: `"${secondArgumentOfParent}/arguments/${index}"`,
                    },
                  ],
                  usedPowerAssertRecorderCount,
                );
              }

              return arg;
            },
          );

          // Case where the function assigned to the variable is called. e.g. foo()
          // Case of immediate execution of arrow function. e.g. (() => {})()
          // Case of immediate execution of function declaration. e.g. (function foo() {return 1})()
          if (
            node.callee.type === "Identifier" ||
            node.callee.type === "ArrowFunctionExpression" ||
            node.callee.type === "FunctionExpression"
          ) {
            return {
              ...node,
              arguments: newArguments,
            };
          }

          // Case where the method of the object is called e.g. foo.bar()
          if (node.callee.type === "MemberExpression") {
            return {
              type: "CallExpression",
              callee: {
                type: "MemberExpression",
                computed: node.callee.computed,
                object: wrapNodeByCapture(
                  [
                    node.callee.object,
                    {
                      type: "Literal",
                      value: `${secondArgumentOfParent}/callee/object`,
                      raw: `"${secondArgumentOfParent}/callee/object"`,
                    },
                  ],
                  usedPowerAssertRecorderCount,
                ),
                property: node.callee.property,
              },
              arguments: newArguments,
            };
          }

          throw new Error(
            `The argument of capture is a function call. However this \`callee\` is neither \`Identifier\` nor \`MemberExpression\`. -> ${node.callee.type}`,
          );
        }

        // If the capture argument is object
        if (node.type === "ObjectExpression") {
          // key correspondence
          let newProperties = (node.properties as Property[]).map(
            (prop, index) => {
              if (prop.computed === false) {
                return prop;
              }
              if (prop.key.type === "Literal") {
                return prop;
              }
              return {
                ...prop,
                key: wrapNodeByCapture(
                  [
                    prop.key,
                    {
                      type: "Literal",
                      value:
                        `${secondArgumentOfParent}/properties/${index}/key`,
                      raw:
                        `"${secondArgumentOfParent}/properties/${index}/key"`,
                    },
                  ],
                  usedPowerAssertRecorderCount,
                ),
              };
            },
          );

          // value correspondence
          newProperties = newProperties.map((prop, index) => {
            const { type } = prop.value;
            if (
              type === "Literal" ||
              type === "FunctionExpression" ||
              type === "ArrowFunctionExpression"
            ) {
              return prop;
            }
            return {
              ...prop,
              value: wrapNodeByCapture(
                [
                  prop.value,
                  {
                    type: "Literal",
                    value:
                      `${secondArgumentOfParent}/properties/${index}/value`,
                    raw:
                      `"${secondArgumentOfParent}/properties/${index}/value"`,
                  },
                ],
                usedPowerAssertRecorderCount,
              ),
            };
          }) as Property[];

          return {
            ...node,
            properties: newProperties,
          };
        }

        // If the capture argument is array
        if (node.type === "ArrayExpression") {
          const newElements = node.elements.map((elem: Node, index: number) => {
            if (elem.type === "Literal") return elem;

            return wrapNodeByCapture(
              [
                elem,
                {
                  type: "Literal",
                  value: `${secondArgumentOfParent}/elements/${index}`,
                  raw: `"${secondArgumentOfParent}/elements/${index}"`,
                },
              ],
              usedPowerAssertRecorderCount,
            );
          });

          return {
            ...node,
            elements: newElements,
          };
        }

        // If the capture argument is property of object
        if (node.type === "MemberExpression") {
          return {
            type: "MemberExpression",
            computed: node.computed,
            object: wrapNodeByCapture(
              [
                node.object,
                {
                  type: "Literal",
                  value: `${secondArgumentOfParent}/object`,
                  raw: `"${secondArgumentOfParent}/object"`,
                },
              ],
              usedPowerAssertRecorderCount,
            ),
            property: node.property,
          };
        }

        // If the capture argument is unary operator e.g. typeof
        if (node.type === "UnaryExpression") {
          return {
            ...node,
            argument: wrapNodeByCapture([
              node.argument,
              {
                type: "Literal",
                value: `${secondArgumentOfParent}/argument`,
                raw: `"${secondArgumentOfParent}/argument"`,
              },
            ], usedPowerAssertRecorderCount),
          };
        }

        if (node.type !== "Literal" && node.type !== "AssignmentExpression") {
          const hasLeftAndRight = (
            // deno-lint-ignore no-explicit-any
            someNode: any,
          ): someNode is { left: Node; right: Node } => {
            return someNode.left && someNode.right;
          };

          if (hasLeftAndRight(node)) {
            let newLeft;
            if (node.left && node.left.type !== "Literal") {
              newLeft = wrapNodeByCapture(
                [
                  node.left,
                  {
                    type: "Literal",
                    value: `${secondArgumentOfParent}/left`,
                    raw: `"${secondArgumentOfParent}/left"`,
                  },
                ],
                usedPowerAssertRecorderCount,
              );
            }
            let newRight;
            if (node.right && node.right.type !== "Literal") {
              newRight = wrapNodeByCapture(
                [
                  node.right,
                  {
                    type: "Literal",
                    value: `${secondArgumentOfParent}/right`,
                    raw: `"${secondArgumentOfParent}/right"`,
                  },
                ],
                usedPowerAssertRecorderCount,
              );
            }

            return {
              ...node,
              left: newLeft || node.left,
              right: newRight || node.right,
            };
          }
        }
      }

      return undefined;
    },

    // deno-lint-ignore ban-ts-comment
    // @ts-ignore
    leave(node) {
      // Insert the `_PowerAssertRecorder` definition into your code
      if (powerAssertRecorderCount !== 0) {
        if (node.type === "Program") {
          let importStatementIndex = 0;
          node.body.forEach((topLevelNode: Node) => {
            if (topLevelNode.type === "ImportDeclaration") {
              importStatementIndex += 1;
            }
          });

          node.body.splice(
            importStatementIndex,
            0,
            (parse(
              sourceOfPowerAssertRecorder,
              { ecmaVersion: 2020 },
            ) as Node as Program).body[0],
          );
        }
      }

      // Remove the `capture` that is the argument of await
      // e.g.
      // Before _rec1.expr(_rec1.capture(await _rec1.capture(x, 'arguments/0/argument'), 'arguments/0'), {...})
      // After _rec1.expr(_rec1.capture(await x, 'arguments/0'), {...})
      if (
        node.type === "AwaitExpression" &&
        node.argument.type === "CallExpression" &&
        node.argument.callee.type === "Identifier" &&
        captureRegexp.test(node.argument.callee.name)
      ) {
        const firstArgInCapture = node.argument.arguments[0];
        return {
          ...node,
          argument: firstArgInCapture,
        };
      }

      return undefined;
    },
  });

  // Set source as the second argument of expr
  replace((ast as Node), {
    // deno-lint-ignore ban-ts-comment
    // @ts-ignore
    enter(node) {
      const regexp = new RegExp(`^_rec[0-9]{1,}.${EXPR_METHOD_NAME}$`);
      if (
        node.type === "CallExpression" && node.callee.type === "Identifier" &&
        regexp.test(node.callee.name)
      ) {
        const periodIndex = node.callee.name.indexOf(".");
        const sourceKey = node.callee.name.slice(0, periodIndex);
        const source = sources.get(sourceKey);

        const createProperty = (
          key: string,
          value: string | number | boolean,
        ) => {
          const commonSetting = {
            type: "Property",
            computed: false,
            kind: "init",
            method: false,
            shorthand: false,
          };
          return {
            ...commonSetting,
            key: {
              type: "Identifier",
              name: key,
            },
            value: {
              type: "Literal",
              value,
              raw: `"${value}"`,
            },
          };
        };

        const properties = [
          createProperty("content", source.content),
          createProperty("filepath", source.filepath),
          createProperty("line", source.line),
        ];

        if (source.async === true) {
          properties.push(createProperty("async", true));
        }
        if (source.generator === true) {
          properties.push(createProperty("generator", true));
        }

        return {
          ...node,
          arguments: [
            ...node.arguments,
            {
              type: "ObjectExpression",
              properties,
            },
          ],
        };
      }

      return undefined;
    },
  });

  return escodegen.generate(
    usePrecedence(ast as Node),
    { verbatim: "x-verbatim-property" },
  );
}
