const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

router.post('/', async (req, res) => {
  const { code, language, input = '' } = req.body;
  if (!code || !language) {
    return res.status(400).json({ output: 'Code and language are required.' });
  }

  // Only allow certain languages
  const allowed = ['python', 'java', 'cpp', 'c'];
  if (!allowed.includes(language)) {
    return res.status(400).json({ output: 'Language not supported.' });
  }

  try {
    const tempDir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    let filename, command;
    const inputFile = path.join(tempDir, 'input.txt');
    fs.writeFileSync(inputFile, input);
    if (language === 'python') {
      filename = path.join(tempDir, `temp.py`);
      fs.writeFileSync(filename, code);
      // Use spawn to pipe input to stdin
      const { spawn } = require('child_process');
      const py = spawn('python', [filename]);
      let output = '';
      py.stdout.on('data', data => output += data);
      py.stderr.on('data', data => output += data);
      py.on('close', () => res.json({ output }));
      py.stdin.write(input);
      py.stdin.end();
      return;
    } else if (language === 'java') {
      // Detect public class name
      const match = code.match(/public\s+class\s+(\w+)/);
      const className = match ? match[1] : 'Temp';
      filename = path.join(tempDir, `${className}.java`);
      fs.writeFileSync(filename, code);
      const command = `javac "${filename}" && java -cp "${tempDir}" ${className} < "${inputFile}"`;
      exec(command, { timeout: 5000 }, (error, stdout, stderr) => {
        if (error) {
          return res.json({ output: stderr || error.message });
        }
        res.json({ output: stdout });
      });
      return;
    } else if (language === 'cpp') {
      filename = path.join(tempDir, `temp.cpp`);
      fs.writeFileSync(filename, code);
      const isWin = process.platform === 'win32';
      const outputExe = path.join(tempDir, isWin ? 'temp.exe' : 'temp.out');
      // Compile first
      exec(`g++ "${filename}" -o "${outputExe}"`, { timeout: 5000 }, (compileErr, compileStdout, compileStderr) => {
        if (compileErr) {
          console.log('Compilation error:', compileStderr || compileErr.message);
          return res.json({ output: compileStderr || compileErr.message });
        }
        console.log('Compilation successful, running executable...');
        if (isWin) {
          // Use spawn and pipe input for Windows
          const { spawn } = require('child_process');
          const child = spawn(outputExe, [], { stdio: ['pipe', 'pipe', 'pipe'] });
          let output = '';
          let errorOutput = '';
          
          child.stdout.on('data', data => {
            output += data.toString();
            console.log('stdout data:', data.toString());
          });
          
          child.stderr.on('data', data => {
            errorOutput += data.toString();
            console.log('stderr data:', data.toString());
          });
          
          child.on('close', (code) => {
            console.log('Process closed with code:', code);
            const finalOutput = output || errorOutput || 'No output generated';
            console.log('Final output:', finalOutput);
            res.json({ output: finalOutput });
          });
          
          child.on('error', (err) => {
            console.log('Process error:', err);
            res.json({ output: `Execution error: ${err.message}` });
          });
          
          if (input) {
            child.stdin.write(input);
          }
          child.stdin.end();
        } else {
          // Use input redirection for Linux/Mac
          exec(`"${outputExe}" < "${inputFile}"`, { timeout: 5000 }, (runErr, runStdout, runStderr) => {
            if (runErr) {
              console.log('Execution error:', runStderr || runErr.message);
              return res.json({ output: runStderr || runErr.message });
            }
            console.log('Execution successful, output:', runStdout);
            res.json({ output: runStdout || 'No output' });
          });
        }
      });
      return;
    } else if (language === 'c') {
      filename = path.join(tempDir, `temp.c`);
      fs.writeFileSync(filename, code);
      const isWin = process.platform === 'win32';
      const outputExe = path.join(tempDir, isWin ? 'temp_c.exe' : 'temp_c.out');
      exec(`gcc "${filename}" -o "${outputExe}"`, { timeout: 5000 }, (compileErr, compileStdout, compileStderr) => {
        if (compileErr) {
          return res.json({ output: compileStderr || compileErr.message });
        }
        if (isWin) {
          // Use spawn and pipe input for Windows
          const { spawn } = require('child_process');
          const child = spawn(outputExe, [], { stdio: ['pipe', 'pipe', 'pipe'] });
          let output = '';
          child.stdout.on('data', data => output += data);
          child.stderr.on('data', data => output += data);
          child.on('close', () => res.json({ output }));
          child.stdin.write(input);
          child.stdin.end();
        } else {
          exec(`"${outputExe}" < "${inputFile}"`, { timeout: 5000 }, (runErr, runStdout, runStderr) => {
            if (runErr) {
              return res.json({ output: runStderr || runErr.message });
            }
            res.json({ output: runStdout });
          });
        }
      });
      return;
    }
  } catch (err) {
    res.json({ output: err.message || 'Unknown error occurred.' });
  }
});

module.exports = router; 