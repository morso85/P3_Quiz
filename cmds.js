const Sequelize = require('sequelize');
const {models} = require('./model');
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

models.quiz.findAll()
.each(quiz => {
		log(` [${colorize(quiz.id, 'magenta')}]: ${quiz.question}`);
	
	})
.catch(error => {
	errorlog(error.message);
})
.then(() => {
	rl.prompt();
});};



const makeQuestion = (rl, text) => {
	return new Sequelize.Promise( (resolve, reject) => {
		rl.question(colorize(text, "red"), answer=> {
			resolve(answer.trim());

		});
	});
};


exports.addCMD = rl => {

	makeQuestion(rl, 'Introduzca una pregunta: ')
	.then(q => {
		return makeQuestion(rl, "Introduzcala la  respuesta")
		.then(a => {
			return{question: q, answer: a};
		});
	})
	.then(quiz => {
		return models.quiz.create(quiz);
	})
	.then(quiz => {
		log(` ${colorize('Se ha añadido', 'magenta')}: ${quiz.question} ${colorize("=>", "magenta")} ${quiz.answer}`);
	})
	.catch(Sequelize.ValidationError, error => {
		errorlog('El quiz es erroneo: ');
		error.errors.forEach(({message}) => errorlog(message));

	})
	.catch(error => {
		errorlog(error.message);
	})
	.then(() => {
		rl.prompt();
	});
};

exports.testCMD =(rl, id)=> {
	validateId(id)
	.then(id => models.quiz.findById(id))
	.then(quiz => {
		if (!quiz){
			throw new Error (`No existe un quiz asociado al id=${id}.`);
		}

		return makeQuestion(rl, quiz.question)
		.then(respuesta => {
			if ( respuesta.toLowerCase().trim() === quiz.answer.toLowerCase().trim()){

				log('CORRECTO', 'green');
				rl.prompt();
			}else{

				log('INCORRECTO', 'red');
				rl.prompt();	
			}

		})
	})
	 .catch(error => {
			errorlog(error.message);
			rl.prompt();
	 });
	
};

const validateId = id => {
	return new Sequelize.Promise((resolve, reject) => {
		if (typeof id === "undefined"){
			reject(new Error(`Falta el parametro <id>. `));
		}else{
			id = parseInt(id);
			if (Number.isNaN(id)){
				reject(new Error(`El valor del parametro <id> no es un numero`));
			}else{
				resolve(id);
			}
		}
	});
};

exports.showCMD = (rl, id) => {
validateId(id)
	.then(id => models.quiz.findById(id))
	.then(quiz => {
		if (!quiz){
			throw new Error (`No existe un quiz asociado al id=${id}.`);
		}

		log(` [${colorize(quiz.id, 'magenta')}]: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
	})
	.catch(error => {
		errorlog(error.message);
	})
	.then(() => {
		rl.prompt();
	});
};


exports.playCMD = rl => {
	let score = 0;
	let arrayIds = [];

	models.quiz.findAll()
	.then(quizzes => {
		quizzes.forEach((quiz, id) => {
  		arrayIds[id] = quiz;
		});

		const preguntica = () => {
			if( arrayIds.length === 0){
			log(`No quedan preguntas. Tu puntuación ha sido: `, 'red');
			//log(` Tu puntuación ha sido: `, 'yelllow');
			biglog(score, `yellow`);

			rl.prompt();
			} else{ 

				var preguntaAleatoria= Math.floor(Math.random() * arrayIds.length);

				var quiz = arrayIds[preguntaAleatoria];

				log(` ${colorize(quiz.question, 'magenta')} `);

				arrayIds.splice(preguntaAleatoria,1);

				makeQuestion(rl,'Introduzca una respuesta')
				.then(a => {
					if(a.toLowerCase().trim() === quiz.answer.toLowerCase()){
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
				})
				.catch((error) => {
					errorlog(error.message);
				});
			}
		};


		preguntica();
	})
	.catch((error) => {
		errorlog(error.message);
	});

};
	


exports.deleteCMD = (rl, id) => {
	
validateId(id)
.then(id => models.quiz.destroy({where: {id}}))
.catch(error => {
	errorlog(error.message);
})
.then(()=> {
	rl.prompt();
});
};


exports.editCMD = (rl, id)=> {
	
validateId(id)
.then(id => models.quiz.findById(id))
.then(quiz => {
	if (!quiz){
		throw new Error(`No existe un quiz asociado al id <id>.`);
	}

	process.stdout.isTTY && setTimeout(() => { rl.write(quiz.question)},0);
	return makeQuestion(rl, 'Introduzca la pregunta: ')
	.then(q => {
		process.stdout.isTTY && setTimeout(() => { rl.write(quiz.answer)},0);
		return makeQuestion(rl, 'Introduzca la respuesta: ')
		.then(a => {
			quiz.question = q;
			quiz.answer = a;
			return quiz;
		});
	});
})
.then(quiz => {
	return quiz.save();
})
.then(quiz => {
log(` Se ha cambiado el quiz ${colorize(id, 'magenta')} por : ${quiz.question} ${colorize("=>", "magenta")} ${quiz.answer}`);
})
.catch(Sequelize.ValidationError, error => {
	errorlog("El quiz es erroneo: ");
	error.errors.forEach(({message}) => errorlog(message));
})
.catch(error => {
	errorlog(error.message);
})
.then(() => {
	rl.prompt();
});
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
