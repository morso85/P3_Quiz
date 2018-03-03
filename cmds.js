
const model = require('./model');
const {log, biglog, errorlog, colorize} = require("./out");



exports.helpCMD = rl => {
	  log('Commandos:');
      log('  h|help - Muestra la ayuda.');
      log('  list - Listar los quizzes existentes.');
      log('  show <id> - Muestra la pregunta y la respuesta del quiz indicado');
      log('  add - Añadir un nuevo quiz interactivamente');
      log('  delete <id> - Borrar el quiz indicado.');
      log('  test <id> - Probar el quiz indicado.');
      log('  p|play - Jugar con las preguntas aleatorias de todos los quizzes.');
      log('  credits - Créditos.');
      log('  q|quit - Salir del programa.');
      rl.prompt();
}
exports.listCMD = rl => {
	
	model.getAll().forEach((quiz, id) => {
		log(` [${colorize(id, 'magenta')}]: ${quiz.question}`);
	});

	rl.prompt();
};

exports.addCMD = rl => {
	rl.question(colorize(' Introduzca una pregunta: ', 'red'), question => {

		rl.question(colorize(' Introduzca la respuesta ', 'red'), answer => {

			model.add(question,answer);
			log(` ${colorize('Se ha añadido', 'magenta')}: ${question} ${colorize("=>", "magenta")} ${answer}`);
		rl.prompt();
		});
	});
	
};

exports.testCMD =(rl, id)=> {

	if (typeof id  === "undefined"){
		errorlog(`Falta el parametro id.`);
		rl.prompt();
	}else{
		try {
			const quiz = model.getByIndex(id);	
			log(` ${colorize(quiz.question, 'magenta')} `);
			rl.question(colorize(' Introduzca la respuesta ', 'red'), respuesta => {

				//args[0].toLowerCase().trim();

				if ( respuesta.toLowerCase().trim() === quiz.answer.toLowerCase().trim()){

					log('CORRECTO', 'green');
					rl.prompt();
				}else{

					log('INCORRECTO', 'red');
					rl.prompt();	
				}

			});
			
		} catch(error){
			errorlog(error.message);
			rl.prompt();
		}
	}
	
};

exports.showCMD = (rl, id) => {
	
	if (typeof id  === "undefined"){
		errorlog(`Falta el parametro id.`);
	}else{
		try {
			const quiz = model.getByIndex(id);
			log(` [${colorize(id, 'magenta')}]: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);

		} catch(error){
			errorlog(error.message);
		
	}
}
rl.prompt();
};



exports.playCMD = rl => {
	//Creo un array con los ids de las preguntas que hay para responder
	let score = 0;
	let numeroPreguntas = model.count();
	arrayIds = new Array(numeroPreguntas);

	for (var i = 0; i< numeroPreguntas; i++){
		arrayIds[i] = i;
	}

	if( arrayIds.length === 0){
		log(`No hay preguntas `, 'red')
		
		rl.prompt();
	}

	const preguntica = () => {

		if( arrayIds.length === 0){
			log(`No quedan preguntas. Tu puntuación ha sido: `, 'red');
			//log(` Tu puntuación ha sido: `, 'yelllow');
			biglog(score, `yellow`);

			rl.prompt();

		}else{

			preguntaAleatoria= Math.floor(Math.random() * arrayIds.length);

			var quiz = model.getByIndex(arrayIds[preguntaAleatoria]);

			log(` ${colorize(quiz.question, 'magenta')} `);

			rl.question(colorize(' Introduzca la respuesta ', 'red'), respuesta => {
				
				arrayIds.splice(preguntaAleatoria,1);

				if ( respuesta.toLowerCase().trim() === quiz.answer.toLowerCase().trim()){
					score = score +1;
					log(` Correcto. Tu puntuación es de: ${colorize(score, "yellow")} `);
					preguntica();

				}else{			

					log('INCORRECTO', 'red');
					log(' Tu puntuación ha sido: ');
					biglog(score, `yellow`);
					log(' Fin ');
					rl.prompt();	
				}

			});
		}
	}
	preguntica()
};

exports.deleteCMD = (rl, id) => {
	if (typeof id  === "undefined"){
		errorlog(`Falta el parametro id.`);
	}else{
		try {
			model.deleteByIndex(id);
			

		} catch(error){
			errorlog(error.message);
		
	}
}
rl.prompt();
};


exports.editCMD = (rl, id)=> {
	
	if (typeof id  === "undefined"){
		errorlog(`Falta el parametro id.`);
		rl.prompt();
	}else{
		try {
			const quiz = model.getByIndex(id);
			process.stdout.isTTY && setTimeout(() => { rl.write(quiz.question)},0);

			rl.question(colorize(' Introduzca una pregunta: ', 'red'), question => {

				process.stdout.isTTY && setTimeout(() => { rl.write(quiz.answer)},0);

				rl.question(colorize(' Introduzca la respuesta ', 'red'), answer => {
					model.update(id, question, answer);
					log(` Se ha cambiado el quiz ${colorize(id, 'magenta')} por : ${question} ${colorize("=>", "magenta")} ${answer}`);
					rl.prompt();
				});
			});
		} catch(error){
			errorlog(error.message);
			rl.prompt();
		}
	}

};


exports.quitCMD = rl => {
	rl.close();

}

exports.creditsCMD = rl => {
        log('Autores de la práctica:', 'red');
		log('ALVARO CEPEDA ZAMORANO', 'green');
		log('ALVARO MORSO GRANERO', 'green');
		rl.prompt();
	}
