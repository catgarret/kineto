// Release preparation updates current source labels, not historical publication
// evidence. A new source version cannot imply that npm or Pages already shipped.
export function updateReleaseDocumentVersion(relative, source, current, next) {
  const escaped = current.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const replaceExpected = (pattern, replacement, label) => {
    if (!pattern.test(source)) throw new Error(`${relative} ${label} is not ${current}`);
    source = source.replace(pattern, replacement);
  };

  if (relative === 'docs/AI-HANDOFF.md') {
    replaceExpected(new RegExp(`^(- Current source version: \\x60)${escaped}(\\x60)$`, 'm'),
      `$1${next}$2`, 'source version');
    return source;
  }

  if (relative === 'docs/QA_REPORT.md') {
    replaceExpected(new RegExp(`^(# Kineto v)${escaped}( QA Report)$`, 'm'),
      `$1${next}$2`, 'heading version');
    replaceExpected(new RegExp(`^대상: (?:npm )?v${escaped}[^\\n]*$`, 'm'),
      `대상: v${next} 릴리스 후보 소스 · 이전 공개 배포 근거는 버전별로 유지`, 'source target');
    replaceExpected(new RegExp(`(패키지명은\\s*\\n?\\x60@dong-gri/kineto\\x60, 버전은 \\x60)${escaped}(\\x60입니다\\.)`),
      `$1${next}$2`, 'package version');
    return source;
  }

  throw new Error(`unsupported versioned release document: ${relative}`);
}
