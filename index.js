
const {spawn, exec} = require('child_process'),
	os = require('os');

const run = (c, o) => {
	if (os.platform() === 'win32') {
		const cmd = exec(c, o, (e, stdout, stderr) => {
			if (e) {
				throw e;
			}
			process.stdout.write(stdout);
			process.stderr.write(stderr);
		});
		return cmd;
	}
	const cmd = spawn('sh', ['-c', c], o);
	cmd.stdout.on('data', (d) => {
		process.stdout.write(d);
	});
	cmd.stderr.on('data', (d) => {
		process.stderr.write(d);
	});
	cmd.on('error', (e) => {
		throw e;
	});
	return cmd;
};

class ShellPlugin {

	constructor(options) {
		this.options = {
			onStart: '',
			onEnd: '',
			verbose: false,
			...options
		};
		this.process = [];
	}

	clean() {
		for (let i in this.process) {
			try {
				this.process[i].close();
			} catch (e) {
				//
			}
		}
	}

	log(...a) {
		if (this.options.verbose) {
			console.log(...a);
		}
	}

	apply(compiler) {
		compiler.hooks.beforeCompile.tapAsync('MyPlugin', (params, callback) => {
			this.log('beforeCompile', this.options.onStart);
			if (this.options.onStart) {
				this.clean();
				this.process.push(run(this.options.onStart));
			}
			callback();
		});
		compiler.hooks.compile.tap('MyPlugin', (params) => {
			console.log('compile');
		});
		compiler.hooks.afterEmit.tapAsync('MyPlugin', (params, callback) => {
			this.log('afterCompile', this.options.onStart);
			if (this.options.onEnd) {
				this.clean();
				this.process.push(run(this.options.onEnd));
			}
			callback();
		});
	}

}

module.exports = ShellPlugin;
