import fs from 'fs';
let c = fs.readFileSync('src/App.tsx', 'utf-8');

c = c.replace(/    <\/div>\n\n      \{feedbackModalOpen && \(/, "      {feedbackModalOpen && (");

const endFixer = `\n    </div>\n  );\n}\n`;

c = c.replace(/    <\/div>\n  \);\n\}\n$/, "      {feedbackModalOpen && (\n");
// Wait, doing this dynamically is easier with string slice!

const target = '    </div>\n\n      {feedbackModalOpen && (';
c = c.replace(target, '      {feedbackModalOpen && (');
c = c.replace(/      \)\}\n  \);\n\}\n/, '      )}\n    </div>\n  );\n}\n');

fs.writeFileSync('src/App.tsx', c);
