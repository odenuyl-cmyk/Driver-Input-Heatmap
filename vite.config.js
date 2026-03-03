import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const parseUploadedFile = async (req) => {
  const contentType = req.headers['content-type'] || '';
  const boundaryMatch = contentType.match(/boundary=([^\s;]+)/i);
  if (!boundaryMatch) {
    throw new Error('Missing multipart boundary.');
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const rawBuffer = Buffer.concat(chunks);
  const raw = rawBuffer.toString('latin1');
  const boundary = `--${boundaryMatch[1]}`;
  const parts = raw.split(boundary).filter((part) => part.includes('Content-Disposition'));

  for (const part of parts) {
    const [rawHeaders, rawBody] = part.split('\r\n\r\n');
    if (!rawHeaders || rawBody === undefined) {
      continue;
    }

    const nameMatch = rawHeaders.match(/name="([^"]+)"/i);
    const filenameMatch = rawHeaders.match(/filename="([^"]*)"/i);
    if (!nameMatch || !filenameMatch || nameMatch[1] !== 'mdf') {
      continue;
    }

    const cleanedBody = rawBody.replace(/\r\n--$/, '').replace(/\r\n$/, '');
    const fileBuffer = Buffer.from(cleanedBody, 'latin1');
    const safeFilename = path.basename(filenameMatch[1]).replace(/[^a-zA-Z0-9._-]/g, '_');
    return { fileBuffer, filename: safeFilename || 'upload.mdf' };
  }

  throw new Error('No MDF file was uploaded.');
};

const runImportPipeline = async (inputPath, outputDir) => {
  const scriptPath = path.resolve(process.cwd(), 'src', 'full_data.py');
  await execFileAsync(
    'python3',
    ['-u', scriptPath, '--input', inputPath, '--output', outputDir],
    { cwd: process.cwd(), maxBuffer: 1024 * 1024 * 8 }
  );
};

const importApiPlugin = () => ({
  name: 'import-mdf-api',
  configureServer(server) {
    server.middlewares.use('/api/import-mdf', async (req, res) => {
      if (req.method !== 'POST') {
        res.statusCode = 405;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Method not allowed. Use POST.' }));
        return;
      }

      try {
        const { fileBuffer, filename } = await parseUploadedFile(req);

        const tmpInputPath = path.join(os.tmpdir(), `${Date.now()}_${filename}`);
        await fs.writeFile(tmpInputPath, fileBuffer);

        const runId = `import_${Date.now()}`;
        const outputDir = path.resolve(process.cwd(), 'public', 'imports', runId);
        await fs.mkdir(outputDir, { recursive: true });

        await runImportPipeline(tmpInputPath, outputDir);

        const manifestPath = path.join(outputDir, 'manifest.json');
        const manifestRaw = await fs.readFile(manifestPath, 'utf-8');
        const manifest = JSON.parse(manifestRaw);

        const lapFiles = (manifest.lap_files || []).map((relPath) => `/imports/${runId}/${relPath}`);
        const fullDataFile = manifest.full_data_file
          ? `/imports/${runId}/${manifest.full_data_file}`
          : null;

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            runId,
            lapFiles,
            lapCount: lapFiles.length,
            fullDataFile,
            manifestPath: `/imports/${runId}/manifest.json`,
          })
        );
      } catch (error) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: error.message || 'Import failed.' }));
      }
    });
  },
});

export default defineConfig({
  plugins: [react(), importApiPlugin()],
});
