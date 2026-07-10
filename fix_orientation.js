import fs from 'fs';
let c = fs.readFileSync('src/App.tsx', 'utf-8');
const oldOri = `  useEffect(() => {
    const handleOrientation = () => {
      if (window.screen && window.screen.orientation) {
         if (window.screen.orientation.type.startsWith('landscape')) {
            document.documentElement.setAttribute('data-landscape', 'true');
         } else {
            document.documentElement.removeAttribute('data-landscape');
         }
      } else {
         if (window.innerWidth > window.innerHeight * 1.3) {
            document.documentElement.setAttribute('data-landscape', 'true');
         } else {
            document.documentElement.removeAttribute('data-landscape');
         }
      }
    };
    handleOrientation();
    window.addEventListener('orientationchange', handleOrientation);
    window.addEventListener('resize', handleOrientation);
    return () => {
       window.removeEventListener('orientationchange', handleOrientation);
       window.removeEventListener('resize', handleOrientation);
    };
  }, []);`;

const newOri = `  useEffect(() => {
    const handleOrientation = () => {
      const isLandscape = window.matchMedia("(orientation: landscape)").matches;
      // Do not use resize + innerHeight as soft keyboards shrink the height
      if (isLandscape) {
         document.documentElement.setAttribute('data-landscape', 'true');
      } else {
         document.documentElement.removeAttribute('data-landscape');
      }
    };
    handleOrientation();
    window.addEventListener('orientationchange', handleOrientation);
    // Optional: matchMedia listener is safer than window resize
    const mql = window.matchMedia("(orientation: landscape)");
    const mqlListener = (e: MediaQueryListEvent) => {
       if (e.matches) document.documentElement.setAttribute('data-landscape', 'true');
       else document.documentElement.removeAttribute('data-landscape');
    };
    if (mql.addEventListener) mql.addEventListener('change', mqlListener);
    
    return () => {
       window.removeEventListener('orientationchange', handleOrientation);
       if (mql.removeEventListener) mql.removeEventListener('change', mqlListener);
    };
  }, []);`;

c = c.replace(oldOri, newOri);
fs.writeFileSync('src/App.tsx', c);
