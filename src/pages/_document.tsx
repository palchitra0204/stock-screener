import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en" className="dark">
      <Head>
        <meta charSet="utf-8" />
        <meta
          name="description"
          content="Production-Quality Indian Real-Time Stock Screener with 5,000+ NSE/BSE stocks, 30+ financial/technical filters, AND/OR filter builder, 252-day interactive candlestick charts, and sub-50ms WebSocket streaming."
        />
        <meta name="theme-color" content="#090d16" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body className="bg-background text-slate-100 antialiased selection:bg-brand-500 selection:text-white">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
