import { transform } from '@babel/standalone';
import React from 'react';

function App() {
    window.React = React;
    const code1 =`
    function add(a, b) {
        return a + b;
    }
    export { add };
    `;

    const url = URL.createObjectURL(new Blob([code1], { type: 'application/javascript' }));
    console.log(url)
    const transformImportSourcePlugin = {
        visitor: {
            ImportDeclaration(path) {
                path.node.source.value = url;
            }
        },
    }


  const code = `import { add } from './add.ts'; console.log(add(2, 3));`

  function onClick() {
    const res = transform(code, {
      presets: ['react', 'typescript'],
      filename: 'guang.ts',
      plugins: [transformImportSourcePlugin]
    });
    console.log(res.code);
    eval(res.code)
  }

  return (
    <div>
      <button onClick={onClick}>编译</button>
    </div>
  )
}

export default App