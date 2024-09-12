import fs from 'fs';
import { spawn } from 'child_process';

const ROTATION_STATUS_FILE = '/app/rotation_status.json';

interface RotationStatus {
  inProgress: boolean;
  startTime?: Date;
  endTime?: Date;
  error?: string;
}

function getRotationStatus(): RotationStatus {
  if (fs.existsSync(ROTATION_STATUS_FILE)) {
    return JSON.parse(fs.readFileSync(ROTATION_STATUS_FILE, 'utf-8'));
  }
  return { inProgress: false };
}

function updateRotationStatus(status: Partial<RotationStatus>) {
  const currentStatus = getRotationStatus();
  const newStatus = { ...currentStatus, ...status };
  fs.writeFileSync(ROTATION_STATUS_FILE, JSON.stringify(newStatus));
}

function startRotation() {
  const currentStatus = getRotationStatus();
  if (currentStatus.inProgress) {
    console.log('Rotation already in progress');
    return;
  }

  updateRotationStatus({ inProgress: true, startTime: new Date() });

  const rotationProcess = spawn('ts-node', ['rotateSecrets.ts'], { detached: true });

  rotationProcess.stdout.on('data', (data) => {
    console.log(`Rotation process: ${data}`);
  });

  rotationProcess.stderr.on('data', (data) => {
    console.error(`Rotation process error: ${data}`);
    updateRotationStatus({ error: data.toString() });
  });

  rotationProcess.on('close', (code) => {
    console.log(`Rotation process exited with code ${code}`);
    updateRotationStatus({ inProgress: false, endTime: new Date() });
  });

  rotationProcess.unref();
}

function checkRotationStatus() {
  const status = getRotationStatus();
  console.log('Current rotation status:', status);
}

function cleanupAfterRotation() {
  const status = getRotationStatus();
  if (status.inProgress) {
    console.log('Rotation still in progress. Cannot cleanup yet.');
    return;
  }

  // Remove the OLD_ENCRYPTION_KEY from the environment
  delete process.env.OLD_ENCRYPTION_KEY;

  // Update Docker service to remove OLD_ENCRYPTION_KEY
  spawn('docker', ['service', 'update', '--env-rm', 'OLD_ENCRYPTION_KEY', `${process.env.STACK_NAME}_backend`]);

  console.log('Cleanup completed');
}

const command = process.argv[2];

switch (command) {
  case 'start':
    startRotation();
    break;
  case 'status':
    checkRotationStatus();
    break;
  case 'cleanup':
    cleanupAfterRotation();
    break;
  default:
    console.log('Invalid command. Use "start", "status", or "cleanup"');
}