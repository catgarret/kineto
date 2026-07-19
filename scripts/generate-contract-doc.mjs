import { readFile, writeFile } from 'node:fs/promises';

const contractUrl = new URL('../kineto.features.json', import.meta.url);
const outputUrl = new URL('../docs/module-reference.md', import.meta.url);
const contract = JSON.parse(await readFile(contractUrl, 'utf8'));

const lines = [
  '# Kineto Module Behavior Reference',
  '',
  '> 이 문서는 `kineto.features.json`에서 생성됩니다. 직접 수정하지 말고 계약 파일을 명시적으로 변경한 뒤 `npm run docs:contract`를 실행하세요.',
  '',
  `- Library: ${contract.libraryVersion}`,
  `- Feature contract: ${contract.contractVersion}`,
  `- Behavior contract: ${contract.behaviorContractVersion}`,
  `- Public modules: ${contract.moduleCount}`,
  `- Root properties: ${contract.coreProperties.map((value) => `\`${value}\``).join(', ')}`,
  `- Core methods: ${contract.coreApi.map((value) => `\`${value}()\``).join(', ')}`,
  `- Additional named exports: ${contract.additionalNamedExports.map((value) => `\`${value}\``).join(', ')}`,
  '',
  '각 모듈의 이름, 활성화 속성, 기본 모드, 허용 모드, 공개 옵션은 patch/minor 릴리스에서 임의로 변경할 수 없습니다.',
  ''
];

for (const module of contract.modules) {
  lines.push(`## ${module.name}`);
  lines.push('');
  lines.push(`- Attribute: \`${module.attribute}\``);
  lines.push(`- Default variant: \`${module.defaultVariant}\``);
  lines.push(`- Variants: ${module.variants.map((value) => `\`${value}\``).join(', ')}`);
  lines.push(`- Public options: ${module.publicOptions.length ? module.publicOptions.map((value) => `\`${value}\``).join(', ') : '없음'}`);
  lines.push('');
}

const output = `${lines.join('\n').trim()}\n`;
if (process.argv.includes('--check')) {
  const current = await readFile(outputUrl, 'utf8').catch(() => '');
  if (current !== output) {
    console.error('docs/module-reference.md is out of sync. Run: npm run docs:contract');
    process.exitCode = 1;
  } else {
    console.log('Generated module reference is in sync.');
  }
} else {
  await writeFile(outputUrl, output);
  console.log('Generated docs/module-reference.md.');
}
