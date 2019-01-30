var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var child_process = require('child_process');

var workloadDir = path.join(__dirname, '..', 'workload')
var uploadDir = path.join(workloadDir, 'uploaded')
var script = path.join(__dirname, '..', 'markdownExperiment', 'convertor.py')
const outputDir = path.join(workloadDir, 'output')

/* GET users listing. */
router.post('/', function(req, res, next) {
	let file = req.files.file;
	let filePath = path.join(uploadDir, file.name)
	console.log(file)
	console.log(req.body)
	fs.writeFile(filePath, file.data, (err) => {
		if (err) {
			return res.status(500).send(err);
		}

		const handler = child_process.spawn('python', [script, filePath], {cwd: workloadDir})

		handler.stdout.on('data', (data) => {
			const strippedString = `${data}`.replace(/(\r\n|\n|\r)/gm, "")
			const swiftPath = path.join(outputDir, `${strippedString}.swift`)
			const kotlinPath = path.join(outputDir, `${strippedString}.kt`)
			res.json({
				swift: `http:\/\/localhost:3000${swiftPath}`,
				kotlin: `http:\/\/localhost:3000${kotlinPath}`
			})
			console.log(`stdout: ${data}`)
		})
		handler.stderr.on('data', (data) => {
			console.log(`error: ${data}`)
		})
		handler.on('close', (code) => {
			console.log(`python closed ${code}`)
			// res.json({file: `public/${req.body.fileName}`})
		})
	})
});

module.exports = router;