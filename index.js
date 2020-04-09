
const {spawn} = require('child_process'),
	kill = require('kill.tree');

const safe = (cd) => {
	try {
		cd();
	} catch (e) {
		//
	}
};

const run = (c, o) => {
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
		const wait = [];
		for (let i in this.process) {
			if (this.process[i]) {
				this.log('kill', this.process[i].pid);
				wait.push(kill(this.process[i].pid).catch(() => null).then(() => {
					safe(() => this.process[i].stdin.pause());
					safe(() => this.process[i].kill());
				}));
			}
			this.process[i] = null;
		}
		return Promise.all(wait);
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
				this.clean().then(() => {
					this.process.push(run(this.options.onStart));
					callback();
				});
			} else {
				callback();
			}
		});
		compiler.hooks.compile.tap('MyPlugin', (params) => {
			this.log('compile');
		});
		compiler.hooks.afterEmit.tapAsync('MyPlugin', (params, callback) => {
			this.log('afterCompile', this.options.onEnd);
			if (this.options.onEnd) {
				this.clean().then(() => {
					this.process.push(run(this.options.onEnd));
					callback();
				});
			} else {
				callback();
			}
		});
	}

}

module.exports = ShellPlugin;
