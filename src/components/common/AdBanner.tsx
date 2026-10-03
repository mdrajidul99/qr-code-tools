import React, { useId } from 'react';

interface AdBannerProps {
  unit: 1 | 2;
  className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ unit, className = '' }) => {
  const adId = useId();

  if (unit === 1) {
    // 320x50 Ad Unit 1
    const adHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <base target="_blank">
  <style>
    body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: transparent; overflow: hidden; }
  </style>
</head>
<body>
  <script type="text/javascript">
    atOptions = {
      'key' : '08e03e1fcad8912486d7ed79f6e44bd2',
      'format' : 'iframe',
      'height' : 50,
      'width' : 320,
      'params' : {}
    };
  </script>
  <script type="text/javascript" src="https://www.highrevenueformat.com/08e03e1fcad8912486d7ed79f6e44bd2/invoke.js"></script>
</body>
</html>`;

    return (
      <aside
        aria-label="Advertisement"
        className={`my-8 flex flex-col items-center justify-center overflow-hidden w-full ${className}`}
      >
        <span className="text-[10px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-1 font-mono">
          Advertisement
        </span>
        <div className="w-[320px] max-w-full h-[50px] flex items-center justify-center rounded overflow-hidden bg-neutral-100/50 dark:bg-neutral-900/50">
          <iframe
            id={`ad-frame-${adId}`}
            title="Sponsor Advertisement 320x50"
            srcDoc={adHtml}
            width="320"
            height="50"
            scrolling="no"
            className="border-0 overflow-hidden block"
            sandbox="allow-scripts allow-popups allow-same-origin"
          />
        </div>
      </aside>
    );
  }

  // 468x60 Ad Unit 2
  const adHtml2 = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <base target="_blank">
  <style>
    body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: transparent; overflow: hidden; }
  </style>
</head>
<body>
  <script type="text/javascript">
    atOptions = {
      'key' : 'f4af6c08c26e54c25e3a0642c28e1b1b',
      'format' : 'iframe',
      'height' : 60,
      'width' : 468,
      'params' : {}
    };
  </script>
  <script type="text/javascript" src="https://www.highrevenueformat.com/f4af6c08c26e54c25e3a0642c28e1b1b/invoke.js"></script>
</body>
</html>`;

  return (
    <aside
      aria-label="Advertisement"
      className={`my-8 flex flex-col items-center justify-center overflow-hidden w-full ${className}`}
    >
      <span className="text-[10px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-1 font-mono">
        Advertisement
      </span>
      <div className="w-full max-w-[468px] h-[60px] flex items-center justify-center rounded overflow-hidden bg-neutral-100/50 dark:bg-neutral-900/50">
        <iframe
          id={`ad-frame-${adId}`}
          title="Sponsor Advertisement 468x60"
          srcDoc={adHtml2}
          width="468"
          height="60"
          scrolling="no"
          className="border-0 overflow-hidden block max-w-full"
          sandbox="allow-scripts allow-popups allow-same-origin"
        />
      </div>
    </aside>
  );
};
