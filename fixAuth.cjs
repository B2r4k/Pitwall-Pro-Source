const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf-8');

c = c.replace(
  "import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User as FirebaseUser } from 'firebase/auth';",
  "import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut, User as FirebaseUser } from 'firebase/auth';"
);

// We need to build an Auth UI
// Look for `<svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" ...` inside appView === 'account'
const authRegex = /<div className="flex flex-col items-center gap-4">\s*<p className="text-sm font-medium text-slate-700 dark:text-slate-300">Sign in with Google to continue\.\.<\/p>[\s\S]*?<\/div>/;

const newAuthUI = `
                          <div className="flex flex-col items-center gap-4 w-full">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 text-center">Giriş Yap veya Kayıt Ol</p>
                            <form className="w-full flex flex-col gap-3" onSubmit={(e: any) => {
                                e.preventDefault();
                                const email = e.target.email.value;
                                const password = e.target.password.value;
                                const isSignUp = e.nativeEvent.submitter.name === 'signup';
                                
                                if (!email || !password) {
                                    alert('Lütfen email ve şifre girin.');
                                    return;
                                }

                                if (isSignUp) {
                                    createUserWithEmailAndPassword(auth, email, password)
                                      .then(() => setSyncStatus('Kayıt Başarılı!'))
                                      .catch(err => alert('Kayıt Hatası: ' + err.message));
                                } else {
                                    signInWithEmailAndPassword(auth, email, password)
                                      .then(() => setSyncStatus('Giriş Başarılı!'))
                                      .catch(err => alert('Giriş Hatası: ' + err.message));
                                }
                            }}>
                               <input type="email" name="email" placeholder="Email Adresi" className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required />
                               <input type="password" name="password" placeholder="Şifre" className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required />
                               <div className="flex gap-2 mt-2">
                                  <button type="submit" name="login" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition shadow-sm">Giriş Yap</button>
                                  <button type="submit" name="signup" className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold py-3 rounded-lg transition shadow-sm">Kayıt Ol</button>
                               </div>
                               <button type="button" onClick={() => {
                                   const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement;
                                   const email = emailInput?.value;
                                   if (!email) {
                                       alert('Şifre sıfırlama için önce email adresinizi yukarıya yazın.');
                                       return;
                                   }
                                   sendPasswordResetEmail(auth, email).then(() => alert('Şifre sıfırlama bağlantısı mailinize gönderildi.')).catch(err => alert('Hata: ' + err.message));
                               }} className="text-xs text-indigo-500 hover:text-indigo-700 mt-2 text-center font-bold">Şifremi Unuttum</button>
                            </form>
                          </div>
`;

c = c.replace(authRegex, newAuthUI);
fs.writeFileSync('src/App.tsx', c);
