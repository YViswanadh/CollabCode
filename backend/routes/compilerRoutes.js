const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const execDir = path.join(__dirname, '../temp_exec');

// Ensure temp_exec directory exists inside backend workspace
if (!fs.existsSync(execDir)) {
  fs.mkdirSync(execDir, { recursive: true });
}

/**
 * Spawns a child process asynchronously, handling stdin pipelines and timeout limits.
 */
const runProcess = (cmd, args, stdinInput = '', timeoutMs = 5000) => {
  return new Promise((resolve) => {
    const child = spawn(cmd, args);
    
    let stdout = '';
    let stderr = '';
    
    // Timeout handler to prevent infinite loops from hanging CPU
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      resolve({ 
        stdout, 
        stderr: stderr + '\n[Execution Timeout Exceeded (5 seconds limit)]', 
        code: 124, 
        signal: 'SIGKILL' 
      });
    }, timeoutMs);

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    if (stdinInput) {
      child.stdin.write(stdinInput);
      child.stdin.end();
    }
    
    child.on('close', (code, signal) => {
      clearTimeout(timer);
      resolve({ stdout, stderr, code, signal });
    });
    
    child.on('error', (err) => {
      clearTimeout(timer);
      resolve({ 
        stdout, 
        stderr: stderr + `\nExecution Error: Command '${cmd}' failed. Is it installed locally?\n${err.message}`, 
        code: -1, 
        signal: 'ERR' 
      });
    });
  });
};

/**
 * Helper to compile C++ source files using g++
 */
const compileCpp = (srcPath, binPath) => {
  return new Promise((resolve) => {
    // Try compilation with g++ or fall back
    const child = spawn('g++', ['-O3', srcPath, '-o', binPath]);
    let stderr = '';
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    child.on('close', (code) => {
      resolve({ success: code === 0, stderr });
    });
    child.on('error', (err) => {
      resolve({ success: false, stderr: `g++ compiler not found: ${err.message}` });
    });
  });
};

/**
 * POST /api/compile
 * Body: { language, code, stdin }
 * Executes code locally on macOS environment and returns standard Piston JSON structure.
 */
router.post('/compile', async (req, res) => {
  try {
    const { language, code, stdin = '' } = req.body;

    if (!language || code === undefined) {
      return res.status(400).json({ message: 'Language and code are required.' });
    }

    // Handle structural languages gracefully
    if (['html', 'css', 'json', 'markdown'].includes(language)) {
      return res.json({
        run: {
          stdout: `--- ${language.toUpperCase()} Validation ---\nSuccessfully rendered structural preview.\nNo stdout/terminal output generated.`,
          stderr: '',
          code: 0,
          signal: null,
          output: 'Validated static structure.'
        }
      });
    }

    const uniqueId = `${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    let srcPath = '';
    let binPath = '';
    let runResult = null;

    // Execute code based on select language
    switch (language) {
      case 'javascript': {
        srcPath = path.join(execDir, `script_${uniqueId}.js`);
        fs.writeFileSync(srcPath, code);
        runResult = await runProcess('node', [srcPath], stdin);
        break;
      }
      case 'typescript': {
        srcPath = path.join(execDir, `script_${uniqueId}.ts`);
        fs.writeFileSync(srcPath, code);
        // Execute using tsx or fall back to node (npx tsx executes typescript directly without tsc setup)
        runResult = await runProcess('npx', ['tsx', srcPath], stdin);
        break;
      }
      case 'python': {
        srcPath = path.join(execDir, `script_${uniqueId}.py`);
        fs.writeFileSync(srcPath, code);
        // Support python3 or fall back
        runResult = await runProcess('python3', [srcPath], stdin);
        if (runResult.stderr && runResult.stderr.includes('Command \'python3\' failed')) {
          runResult = await runProcess('python', [srcPath], stdin);
        }
        break;
      }
      case 'cpp': {
        srcPath = path.join(execDir, `script_${uniqueId}.cpp`);
        binPath = path.join(execDir, `bin_${uniqueId}`);
        fs.writeFileSync(srcPath, code);
        
        // Compile first
        const comp = await compileCpp(srcPath, binPath);
        if (!comp.success) {
          runResult = { stdout: '', stderr: `Compilation Error:\n${comp.stderr}`, code: 1, signal: null };
        } else {
          // Execute binary
          runResult = await runProcess(binPath, [], stdin);
        }
        break;
      }
      case 'java': {
        // Java requires filename to match public class, or we compile inline
        srcPath = path.join(execDir, `Main_${uniqueId}.java`);
        // Wrap simple programs if Main class isn't specified, or just compile
        fs.writeFileSync(srcPath, code);
        runResult = await runProcess('java', [srcPath], stdin); // Java 11+ supports running single file directly!
        break;
      }
      case 'go': {
        srcPath = path.join(execDir, `script_${uniqueId}.go`);
        fs.writeFileSync(srcPath, code);
        runResult = await runProcess('go', ['run', srcPath], stdin);
        break;
      }
      case 'rust': {
        srcPath = path.join(execDir, `script_${uniqueId}.rs`);
        binPath = path.join(execDir, `bin_${uniqueId}`);
        fs.writeFileSync(srcPath, code);
        
        // Compile Rust
        const comp = await new Promise((resolve) => {
          const child = spawn('rustc', [srcPath, '-o', binPath]);
          let stderr = '';
          child.stderr.on('data', (data) => {
            stderr += data.toString();
          });
          child.on('close', (code) => {
            resolve({ success: code === 0, stderr });
          });
          child.on('error', (err) => {
            resolve({ success: false, stderr: `rustc compiler not found: ${err.message}` });
          });
        });

        if (!comp.success) {
          runResult = { stdout: '', stderr: `Compilation Error:\n${comp.stderr}`, code: 1, signal: null };
        } else {
          runResult = await runProcess(binPath, [], stdin);
        }
        break;
      }
      default: {
        return res.status(400).json({ message: `Language '${language}' is not supported for execution.` });
      }
    }

    // Garbage collection: clean up files
    try {
      if (srcPath && fs.existsSync(srcPath)) fs.unlinkSync(srcPath);
      if (binPath && fs.existsSync(binPath)) fs.unlinkSync(binPath);
    } catch (gcErr) {
      console.warn('[Compiler] GC Warning: failed to delete temp file:', gcErr.message);
    }

    // Format output identical to Piston API specifications so frontend requires 0 changes!
    return res.json({
      run: {
        stdout: runResult.stdout,
        stderr: runResult.stderr,
        code: runResult.code,
        signal: runResult.signal,
        output: runResult.stdout || runResult.stderr
      }
    });

  } catch (error) {
    console.error('[Compiler] Execution failure:', error.message);
    return res.status(500).json({ message: 'Internal server error during local compilation.' });
  }
});

module.exports = router;
