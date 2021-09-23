/*
 * @Author: Kanata You 
 * @Date: 2021-09-23 10:40:57 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2021-09-23 20:12:12
 */

/**
 * @type {import('eslint').Linter.BaseConfig & { rules: Record<string, 0 | "off" | 1 | "warn" | 2 | "error" | [0 | "off" | 1 | "warn" | 2 | "error", ...any[]]>; }}
 */
const eslintConfig = {
  env: {
    browser: true,
    node: true,
    es2021: true
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 12,
    sourceType: "module"
  },
  plugins: [
    "react",
    "@typescript-eslint"
  ],
  rules: {
    /* 确保 getter 和 setter 同时出现 */
    'accessor-pairs': [
      'error', {
        setWithoutGet: true
      }
    ],
    /* fixable 数组字面量换行 */
    'array-bracket-newline': [
      'error', {
        "multiline": true,
        "minItems": 3
      }
    ],
    /* fixable 括号间空格 */
    'array-bracket-spacing': [
      'error',
      'never', {
        singleValue: false,
        objectsInArrays: false,
        arraysInArrays: false
      }
    ],
    /* 强制在数组方法的回调中添加返回值 */
    'array-callback-return': ['error'],
    /* fixable 数组元素换行 */
    'array-element-newline': [
      'error', {
        "multiline": true,
        "minItems": 3
      }
    ],
    /* fixable 在箭头函数体的周围使用大括号 */
    'arrow-body-style': ['error', 'as-needed'],
    /* fixable 在箭头函数参数周围加上括号 */
    'arrow-parens': ['error', 'as-needed'],
    /* fixable 在箭头函数的箭头前后标准化间距样式 */
    'arrow-spacing': [
      'error', {
        "before": true,
        "after": true
      }
    ],
    /* 变量在定义块的外部使用 */
    'block-scoped-var': 'error',
    /* fixable 块令牌打开和关闭处强制间距一致 */
    'block-spacing': ['error'],
    /* fixable 花括号风格 */
    'brace-style': ['error'],
    /* 防止多次调用回调 */
    'callback-return': [
      'error', [
        'callback',
        'cb',
        'next',
        'resolve',
        'reject'
      ]
    ],
    /* 变量命名风格 */
    camelcase: [
      'error', {
        properties: "always"
      }
    ],
    /* fixable 注释开头大写 */
    'capitalized-comments': [
      'error',
      'always', {
        line: {
          ignorePattern: '.'
        },
        block: {
          ignorePattern: 'no',
          ignoreInlineComments: true,
          ignoreConsecutiveComments: true
        }
      }
    ],
    /* 标记不使用 this 的类方法 */
    'class-methods-use-this': [
      'error', {
        exceptMethods: [
          'constructor',
          'componentDidMount',
          'componentDidUpdate',
          'render',
          'componentDidCatch',
          'componentWillUnmount'
        ]
      }
    ],
    /* fixable 成员末逗号 */
    'comma-dangle': ['error', 'only-multiline'],
    /* fixable 逗号前后空格 */
    'comma-spacing': [
      'error', {
        "before": false,
        "after": true
      }
    ],
    /* fixable 逗号位于行中位置 */
    'comma-style': ['error', 'last'],
    /* 函数条件复杂度 */
    complexity: ['error', 20],
    /* fixable 对象字面量与花括号间空格 */
    'computed-property-spacing': 'off',
    /* 函数显式返回 */
    'consistent-return': 'error',
    /* 限定 this 所赋值给的变量 */
    'consistent-this': ['error', 'that'],
    /* 检查构造函数 super() 调用 */
    'constructor-super': 'error',
    /* fixable 禁止单句语句块省略花括号 */
    curly: ['error', 'all'],
    /* 要求 switch 块给出 default 或跳过 default 的注释 */
    'default-case': [
      'error', {
        commentPattern: '/^[nN]o default( case)?$/'
      }
    ],
    /* fixable 成员运算符换行时运算符的位置 */
    'dot-location': ['error', 'object'],
    /* fixable 警告不必要的方括号表示法 */
    'dot-notation': 'error',
    /* fixable 非空文件的末尾至少留一个空行 */
    'eol-last': 'error',
    /* fixable 强制使用 === */
    eqeqeq: 'error',
    /* 检查 for 循环变量增减方向是否能达到判断边界 */
    'for-direction': 'error',
    /* fixable 允许调用中括号前空格 */
    'func-call-spacing': ['error', 'never'],
    /* 检查函数成员赋值对象的键是否同名 */
    'func-name-matching': 'off',
    /* 检查函数表达式是否具名 */
    'func-names': 'off',
    /* 函数声明方式 */
    'func-style': [
      'error',
      'declaration', {
        allowArrowFunctions: true
      }
    ],
    /* fixable 允许参数表换行 */
    'function-paren-newline': ['error', 'consistent'],
    /* fixable 生成器函数星号前后空格 */
    'generator-star-spacing': [
      'error', {
        before: true,
        after: false
      }
    ],
    /* 检查 getter 返回 */
    'getter-return': 'error',
    /* 限制 require() 只能位于顶部 */
    'global-require': 'off',
    /* 限制不带 if 过滤的 for-in */
    'guard-for-in': 'error',
    /* 确保回调中的错误信息被处理 */
    'handle-callback-err': [
      'error',
      '^(err|error|reason)$'
    ],
    /* 禁用命名名单 */
    'id-blacklist': [
      'error',
      'c',
      'f',
      'g',
      'l',
      'm',
      'q',
      'r',
      't',
      'u',
      'x',
      'y',
      'z',
      '$'
    ],
    /* 标识符长度限制 */
    'id-length': [
      'error', {
        min: 1,
        max: 24
      } 
    ],
    /* 标识符规则 */
    'id-match': 'off',
    /* fixable 箭头函数换行 */
    'implicit-arrow-linebreak': ['error', 'beside'],
    /* fixable 缩进 */
    indent: [
      'error',
      2, {
        SwitchCase: 1,
        VariableDeclarator: {
          "var": 2,
          "let": 2,
          "const": 3
        },
        MemberExpression: 1,
        FunctionDeclaration: {
          body: 1,
          parameters: 'first'
        },
        CallExpression: {
          arguments: 'first'
        },
        ArrayExpression: 'first',
        ObjectExpression: 'first',
        ImportDeclaration: 'first',
        flatTernaryExpressions: true
      }
    ],
    /* 限制定义与初始化时机 */
    'init-declarations': ['error', 'always'],
    /* fixable 限制 JSX 中引号 */
    'jsx-quotes': ['error', 'prefer-double'],
    /* fixable 键值对排版 */
    'key-spacing': [
      'error', {
        multiLine: {
          beforeColon: false,
          afterColon: true,
          mode: 'minimum',
          align: 'value'
        }
      }
    ],
    /* fixable 关键字与括号间空格 */
    'keyword-spacing': [
      'error', {
        before: true,
        after: true
      }
    ],
    /* fixable 类成员间空行检查 */
    'lines-between-class-members': [
      'error',
      'always', {
        exceptAfterSingleLine: true
      }
    ],
    /* 最大嵌套层数 */
    'max-depth': ['error', 4],
    /* 最大单行长度 */
    'max-len': [
      'error', {
        code: 120,
        tabWidth: 2,
        ignoreUrls: true,
        ignoreTrailingComments: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: false,
        ignoreRegExpLiterals: true
      }
    ],
    /* 最大行数 */
    'max-lines': [
      'error', {
        max: 300,
        skipBlankLines: true,
        skipComments: true
      }
    ],
    /* 最大回调深度 */
    'max-nested-callbacks': ['error', 3],
    /* 参数表长度限制 */
    'max-params': ['warn', 5],
    /* 函数最大语句数 */
    'max-statements': ['error', 40],
    /* 单行最大语句数 */
    'max-statements-per-line': [
      'error', {
        max: 2
      }
    ],
    /* 三元表达式换行 */
    'multiline-ternary': 'off',
    /* new 操作的构造函数大写开头 */
    'new-cap': 'error',
    /* 禁止 new 运算省略无参数的括号 */
    'new-parens': 'error',
    /* 禁止 alert() confirm() prompt() */
    'no-alert': 'warn',
    /* 禁止循环内 await */
    'no-await-in-loop': 'error',
    /* 禁止 case 中定义 */
    'no-case-declarations': 'error',
    /* 禁止为 class 赋值 */
    'no-class-assign': 'error',
    /* 禁止 === -0，使用 Object.is() */
    'no-compare-neg-zero': 'error',
    /* 检查判断条件错用 = */
    'no-cond-assign': 'error',
    /* 检查歧义箭头函数返回值 */
    'no-confusing-arrow': [
      'error', {
        allowParens: true
      }
    ],
    /* 禁用 console */
    'no-console': 'warn',
    /* 判断语句禁用显式 false */
    'no-constant-condition': 'error',
    /* 正则表达式禁用不可见控制字符 */
    'no-control-regex': 'error',
    /* 禁用 debugger */
    'no-debugger': 'error',
    /* 禁止对变量 delete */
    'no-delete-var': 'error',
    /* 禁止 switch 中包含相同 case */
    'no-duplicate-case': 'error',
    /* 禁止多次从同一个模块 import */
    'no-duplicate-imports': 'error',
    /* fixable 不必要的 else return */
    'no-else-return': 'warn',
    /* 警告空的块 */
    'no-empty': 'error',
    /* 警告空的函数体 */
    'no-empty-function': 'error',
    /* 禁止空的深层解构 */
    'no-empty-pattern': 'warn',
    /* 禁用 eval() */
    'no-eval': 'error',
    /* 禁止对 catch 的参数再赋值 */
    'no-ex-assign': 'error',
    /* 禁止扩展内建对象成员 */
    'no-extend-native': 'error',
    /* fixable 警告不必要的 bind() */
    'no-extra-bind': 'error',
    /* 警告不必要的 Boolean() */
    'no-extra-boolean-cast': 'error',
    /* fixable 警告不必要的语句标签 */
    'no-extra-label': 'error',
    /* fixable 警告多余分号 */
    'no-extra-semi': 'error',
    /* 禁止 switch 中 case 突破到另一 case */
    'no-fallthrough': [
      'error', {
        commentPattern: '/(falls? through)|(break omitted)/i'
      }
    ],
    /* 要求小数点前后非空 */
    'no-floating-decimal': 'error',
    /* 禁止利用位运算达成隐性转换 */
    'no-implicit-coercion': 'error',
    /* 禁止定时器中使用 js 语句字符串 */
    'no-implied-eval': 'error',
    /* 禁止错误的正则表达式 */
    'no-invalid-regexp': 'error',
    /* 禁止错误的 this 引用 */
    'no-invalid-this': 'error',
    /* 禁用 label */
    'no-labels': 'error',
    /* 禁止不必要的块 */
    'no-lone-blocks': 'error',
    /* 禁止 else 中唯一 if */
    'no-lonely-if': 'warn',
    /* 禁用 magic numbers */
    'no-magic-numbers': [
      'error', {
        ignore: [
          -1,
          0,
          1,
          2,
          3,
          4,
          10,
          1000
        ],
        ignoreArrayIndexes: true,
        detectObjects: true
      }
    ],
    /* 禁用混合运算符 */
    'no-mixed-operators': [
      'error', {
        groups: [
          ["&", "|", "^", "~", "<<", ">>", ">>>"],
          ["==", "!=", "===", "!==", ">", ">=", "<", "<="],
          ["in", "instanceof"]
        ],
        allowSamePrecedence: true
      }
    ],
    /* 禁止混用 tab 与空格缩进 */
    'no-mixed-spaces-and-tabs': 'error',
    /* 禁止链式赋值 */
    'no-multi-assign': 'error',
    /* 禁止多余空格 */
    'no-multi-spaces': 'error',
    /* 禁止反斜杠创建多行字符串 */
    'no-multi-str': 'error',
    /* fixable 禁止连续空行 */
    'no-multiple-empty-lines': 'error',
    /* 禁止未赋值的 new 运算 */
    'no-new': 'error',
    /* 禁止 new Function() */
    'no-new-func': 'error',
    /* 禁止 new Object() */
    'no-new-object': 'error',
    /* 禁止 new require() */
    'no-new-require': 'error',
    /* 禁止 new 基本类型 */
    'no-new-wrappers': 'error',
    /* 禁止调用内建工具类 Math, JSON, Reflect 作为构造器 */
    'no-obj-calls': 'error',
    /* 禁用八进制 */
    'no-octal': 'error',
    /* 禁用八进制转义序列 */
    'no-octal-escape': 'error',
    /* 禁止对函数参数再赋值 */
    'no-param-reassign': 'error',
    /* 禁止自增运算 */
    'no-plusplus': 'error',
    /* 禁止重复定义 */
    'no-redeclare': 'error',
    /* 禁止正则表达式中使用多个空格 */
    'no-regex-spaces': 'error',
    /* 禁止 return 语句中赋值 */
    'no-return-assign': 'error',
    /* 禁止 return await */
    'no-return-await': 'error',
    /* 禁止自我赋值或不变的解构赋值 */
    'no-self-assign': 'error',
    /* 禁止自我比较 */
    'no-self-compare': 'error',
    /* 禁止不包含在括号内的逗号语句 */
    'no-sequences': 'error',
    /* 阻止定义保留字为变量名 */
    'no-shadow-restricted-names': 'error',
    /* 禁止稀疏数组 */
    'no-sparse-arrays': 'error',
    /* 禁止 super() 前使用 this */
    'no-this-before-super': 'error',
    /* 禁止抛出纯字符串 */
    'no-throw-literal': 'error',
    /* 禁止使用未定义标识符 */
    'no-undef': 'error',
    /* 禁止多余语句中换行 */
    'no-unexpected-multiline': 'error',
    /* 禁止循环判断条件中的变量未在循环体中被赋值 */
    'no-unmodified-loop-condition': 'error',
    /* 禁止能被转换为 Boolean 的冗余三元表达式 */
    'no-unneeded-ternary': 'error',
    /* 禁止不会被执行的代码 */
    'no-unreachable': 'warn',
    /* 禁止 finally 中的程序控制语句 */
    'no-unsafe-finally': 'error',
    /* fixable 禁止对关系运算左值取反 */
    'no-unsafe-negation': 'error',
    /* 禁止对程序状态没有影响的未使用表达式 */
    'no-unused-expressions': 'error',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    /* 禁止定义前访问 */
    'no-use-before-define': [
      'error', {
        functions: false
      }
    ],
    /* 禁止不必要的 call / apply */
    'no-useless-call': 'error',
    /* 禁止不必要的计算属性 */
    'no-useless-computed-key': 'error',
    /* 禁止不必要的字符串连接 */
    'no-useless-concat': 'error',
    /* 禁止不必要的构造函数定义 */
    'no-useless-constructor': 'error',
    /* 禁止不必要的正则表达式转义 */
    'no-useless-escape': 'error',
    /* 禁止不必要的解构重命名 */
    'no-useless-rename': 'error',
    /* fixable 禁用 var */
    'no-var': 'error',
    /* 检查工作标记注释 */
    'no-warning-comments': [
      'warn', {
        terms: [
          'todo', 'fixme'
        ],
        location: 'start'
      }
    ],
    /* fixable 大括号内换行 */
    'object-curly-newline': [
      'error', {
        consistent: true
      }
    ],
    /* fixable 大括号内部左右空格 */
    'object-curly-spacing': [
      'error',
      'always', {
        objectsInObjects: false
      }
    ],
    /* fixable 简化键值对 */
    'object-shorthand': [
      'error',
      'always', {
        avoidQuotes: true,
        ignoreConstructors: true
      }
    ],
    /* 禁止一个定义关键字对应多个标识符 */
    'one-var': ['error', 'never'],
    /* fixable 禁止一行多个定义 */
    'one-var-declaration-per-line': 'error',
    /* fixable 简化计算赋值 */
    'operator-assignment': 'warn',
    /* fixable 换行时运算符位置 */
    'operator-linebreak': ['error', 'before'],
    /* fixable 空行 */
    'padding-line-between-statements': [
      'warn', {
        blankLine: 'always',
        prev: '*',
        next: 'block-like'
      }, {
        blankLine: 'never',
        prev: ['break', 'continue'],
        next: '*'        
      }, {
        blankLine: 'always',
        prev: '*',
        next: 'class'
      }, {
        blankLine: 'always',
        prev: 'class',
        next: '*'
      }, {
        blankLine: 'always',
        prev: '*',
        next: ['if', 'while', 'do', 'try']
      }, {
        blankLine: 'any',
        prev: ['if', 'while', 'do', 'try', 'empty'],
        next: ['if', 'while', 'do', 'try']
      }
    ],
    /* fixable 推荐使用箭头函数 */
    'prefer-arrow-callback': 'warn',
    /* fixable 推荐使用 const */
    'prefer-const': 'warn',
    /* 推荐使用解构 */
    'prefer-destructuring': 'warn',
    /* 要求 Promise 中 reject Error */
    'prefer-promise-reject-errors': 'error',
    /* 推荐使用 Reflect */
    'prefer-reflect': 'warn',
    /* 推荐使用可变参数 */
    'prefer-rest-params': 'error',
    /* 推荐使用解构参数表 */
    'prefer-spread': 'warn',
    /* fixable 推荐使用模板字符串连接 */
    'prefer-template': 'error',
    /* fixable 对象键的引号 */
    'quote-props': ['error', 'as-needed'],
    /* fixable 建议引号风格 */
    quotes: [
      'error',
      'single', {
        avoidEscape: true
      }
    ],
    /* 禁止 parseInt 省略第二个参数 */
    radix: 'error',
    /* 禁止无 await 的异步函数 */
    'require-await': 'error',
    /* 要求文档注释 */
    'require-jsdoc': [
      'error', {
        require: {
          FunctionDeclaration: true,
          MethodDefinition: false,
          ClassDeclaration: true,
          ArrowFunctionExpression: false,
          FunctionExpression: false
        }
      }
    ],
    /* 禁止无 yield 的生成器函数 */
    'require-yield': 'error',
    /* fixable 解构运算符后空格 */
    'rest-spread-spacing': ['error', 'never'],
    /* fixable 强制使用分号 */
    'semi': ['error', 'always'],
    /* fixable 分号周围空格 */
    'semi-spacing': 'error',
    /* fixable 分号位置 */
    'semi-style': ['error', 'last'],
    /* fixable 模块 import 顺序（按名称升序） */
    'sort-imports': 'off',
    /* fixable 块间空格 */
    'space-before-blocks': ['error', 'always'],
    /* fixable 函数参数表前空格 */
    'space-before-function-paren': [
      'error', {
        anonymous: 'always',
        named: 'never',
        asyncArrow: 'always'
      }
    ],
    /* fixable 括号内左右空格 */
    'space-in-parens': ['error', 'never'],
    /* fixable 运算符间空格 */
    'space-infix-ops': [
      'error', {
        int32Hint: false
      }
    ],
    /* fixable 一元运算符空格 */
    'space-unary-ops': [
      'error', {
        words: true,
        nonwords: true,
        overrides: {
          '!': false,
          '-': false
        }
      }
    ],
    /* fixable 注释行首空格 */
    'spaced-comment': ['error', 'always'],
    /* fixable switch 中 case 语句冒号位置 */
    'switch-colon-spacing': 'error',
    /* fixable 模板字符串内表达式与花括号间空格 */
    'template-curly-spacing': 'error',
    /* fixable 模板字符串作为函数调用时与函数间的空格 */
    'template-tag-spacing': 'error',
    /* 禁止 NaN 比较 */
    'use-isnan': 'error',
    /* 文档注释格式限制 */
    'valid-jsdoc': [
      'error', {
        preferType: {
          'object': 'Object'
        },
        requireReturn: true,
        requireReturnType: true
      }
    ],
    /* typeof 返回值比较检查 */
    'valid-typeof': 'error',
    /* fixable 强制括号包裹 IIFE */
    'wrap-iife': 'error'
  }
}

module.exports = eslintConfig;
