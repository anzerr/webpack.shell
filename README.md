
### `Intro`
Plugin to hook before and start compile/build to run a commands

#### `Install`
``` bash
npm install --save git+https://git@github.com/anzerr/webpack.shell.git
```

### `Example`
``` javascript
const ShellPlugin = require('webpack.shell');

{
    plugins: [
        new ShellPlugin({
            onStart: 'echo "Webpack Start"',
            onEnd: 'node bundle.js'
        })
    ]
}
```