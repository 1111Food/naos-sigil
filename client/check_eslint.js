const { execSync } = require('child_process');
try {
    const output = execSync('npx eslint src/components/GroupDynamicsModule.tsx --format stylish', { encoding: 'utf-8' });
    console.log(output);
} catch (e) {
    console.log(e.stdout);
}
