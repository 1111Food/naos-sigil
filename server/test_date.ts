const tzOffset = -6;
const now = new Date();
console.log('UTC NOW:', now.toISOString());
const localTime = now.getTime() + (tzOffset * 60 * 60 * 1000);
const localDate = new Date(localTime);
console.log('LOCAL DATE ISO:', localDate.toISOString());
console.log('TODAY:', localDate.toISOString().split('T')[0]);
