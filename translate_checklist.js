import fs from 'fs';
let c = fs.readFileSync('src/components/ChecklistView.tsx', 'utf-8');

c = c.replace(/>Race Assistant<\/h3>/g, ">{t('Race Assistant')}</h3>");
c = c.replace(/>Need help preparing for the race\?<\/p>/g, ">{t('Need help preparing for the race?')}</p>");
c = c.replace(/<p>All checks complete! Great job, your car setup and strategy are ready\. Trust your analysis and good luck out there on the track!<\/p>/g, "<p>{t('All checks complete! Great job, your car setup and strategy are ready. Trust your analysis and good luck out there on the track!')}</p>");
c = c.replace(/<p>You're almost there\. Double check your tyre strategy based on the track temperature\. It often drops towards the end of the race!<\/p>/g, "<p>{t('You\\'re almost there. Double check your tyre strategy based on the track temperature. It often drops towards the end of the race!')}</p>");
c = c.replace(/Welcome to race day! Start by configuring your/g, "{t('Welcome to race day! Start by configuring your')}");
c = c.replace(/to pull in the correct Track data, then check your/g, "{t('to pull in the correct Track data, then check your')}");
c = c.replace(/limits\.<\/p>/g, "{t('limits.')}</p>");

fs.writeFileSync('src/components/ChecklistView.tsx', c);
