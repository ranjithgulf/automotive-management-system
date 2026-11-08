"use client";

import Script from "next/script";

// Public installation URL supplied by AutoFlow. This is not an OAuth credential.
// Stable IDs let next/script deduplicate both scripts across client navigation.
export default function SalesIQWidget() {
  return <>
    <Script id="zsiq-init" strategy="afterInteractive">
      {`window.$zoho = window.$zoho || {};
window.$zoho.salesiq = window.$zoho.salesiq || {
  ready: function() {}
};`}
    </Script>
    <Script
      id="zsiqscript"
      src="https://salesiq.zohopublic.com/widget?wc=siqc40d9cb0301bb9403237d930267bf34d3b5e5abee92a7fb3d92d4c5068884b91"
      strategy="afterInteractive"
      defer
    />
  </>;
}
