import { execFileSync } from 'node:child_process';

function processTree(rootPid) {
  if (!rootPid) return [];
  let rows = [];
  try {
    rows = execFileSync('ps', ['-eo', 'pid=,ppid='], { encoding: 'utf8' })
      .trim()
      .split('\n')
      .map((line) => line.trim().split(/\s+/).map(Number))
      .filter(([pid, ppid]) => Number.isInteger(pid) && Number.isInteger(ppid));
  } catch {
    return [rootPid];
  }
  const children = new Map();
  for (const [pid, ppid] of rows) {
    if (!children.has(ppid)) children.set(ppid, []);
    children.get(ppid).push(pid);
  }
  const result = [];
  const visit = (pid) => {
    for (const child of children.get(pid) || []) visit(child);
    result.push(pid);
  };
  visit(rootPid);
  return result;
}

export function killBrowserServer(browserServer) {
  const rootPid = browserServer?.process?.()?.pid;
  for (const pid of processTree(rootPid)) {
    try { process.kill(pid, 'SIGKILL'); } catch { /* already stopped */ }
  }
}
