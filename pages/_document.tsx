import Document, { Head, Html, Main, NextScript } from "next/document"
import { GA_TRACKING_ID } from "../utils/gtag"


export default class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head lang="en">
          <script
            dangerouslySetInnerHTML={{
              __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('set', 'anonymizeIp', true);
            gtag("js", new Date());
            gtag("config", "${GA_TRACKING_ID}", {
              page_path: window.location.pathname,
            });
          `,
            }}
          />
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`} />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
