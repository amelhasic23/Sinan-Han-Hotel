const fs = require('fs');
const content = fs.readFileSync('SiminHan.min.js', 'utf8');
const start = content.indexOf('const translation={');
const end = content.indexOf('async function loadExternalTranslations');
const snippet = content.slice(start, end);
try {
  const fn = new Function(snippet + '; return translation;');
  const translation = fn();
  const langs = Object.keys(translation);
  console.log('Syntax OK. Languages:', langs.join(', '));
  langs.forEach(l => {
    const r = translation[l]['footer-registration'];
    const e = translation[l]['reg-explanation-title'];
    console.log(l + ': footer-registration=' + JSON.stringify(r) + ', reg-explanation-title=' + JSON.stringify(e));
  });
} catch(e) {
  console.log('SYNTAX ERROR:', e.message);
}
