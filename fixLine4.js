import fs from 'fs';
let c = fs.readFileSync('src/components/CalibrationView.tsx', 'utf-8');
c = c.replace(/\\nimport \{ t \} from '\.\.\/i18n';/, "");
fs.writeFileSync('src/components/CalibrationView.tsx', "import { t } from '../i18n';\\n" + c);
