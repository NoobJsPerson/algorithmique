const { argv } = process;
const child_process = require('child_process');

let result = `class ${argv[2]} {\n`

for (let i = 3; i < argv.length; i++) result += `	${argv[i]};\n`

result += `	constructor (${argv.slice(3).join(', ')}) {\n`

for (let i = 3; i < argv.length; i++) {
	result += `		this.${argv[i]} = ${argv[i]};\n`
}
result += '	}\n}\n\n'

child_process.spawn('clip').stdin.end(result);



