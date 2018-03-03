const readline = require('readline');
const model = require('./model');
const {log, biglog, errorlog, colorize} = require("./out");
const cmds = require("./cmds");

biglog('CORE Quiz', 'green');


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: colorize('quiz> ', 'blue'),
  completer:(line) => {
  const completions = 'h help add delete edit list test p play credits q quit'.split(' ');
  const hits = completions.filter((c) => c.startsWith(line));
  // show all completions if none found
  return [hits.length ? hits : completions, line];
}
});

rl.prompt();

rl
.on('line', (line) => {

	let args =line.split(" ");
	let cmd = args[0].toLowerCase().trim();


  switch (cmd) {
  	case "":
  	rl.prompt();
  	break;

    case 'help':
    case 'h':
      cmds.helpCMD(rl);
      break;

	case 'quit':
	case 'q':
		cmds.quitCMD(rl);
		break;

	case 'add':
		cmds.addCMD(rl);
		break;

	case 'list':
		cmds.listCMD(rl);
		break;

	case 'show':
		cmds.showCMD(rl, args[1]);
		break;

	case 'test':
		cmds.testCMD(rl, args[1]);
		break;	

	case 'play':
	case 'p':
		cmds.playCMD(rl);
		break;	

	case 'delete':
		cmds.deleteCMD(rl, args[1]);		
		break;	

	case 'edit':
		cmds.editCMD(rl, args[1]);		
		break;	

	case 'credits':
		cmds.creditsCMD(rl);		
		break;	
 
 
    default:
      console.log(`Comando desconocido:'${colorize(cmd, 'red')}'`);
      console.log('Use ' + colorize("help", "green") +' para ver todos los comandos disponibles. ')
      rl.prompt();
      break;
  }
})
.on('close', () => {
  console.log('Ten un buen día');
  process.exit(0);
});


