"use client";

import React, { useState } from "react";
import styles from "./pdfViewer.module.css";

export default function PdfViewer({ fileUrl }) {
  return (
    <div className={styles.pdfViewerSection}>
      {fileUrl && (
        <iframe
          className={styles.pdfViewerFrame}
          src={fileUrl}
          title="PDF Test"
        ></iframe>
      )}
    </div>
  );
}
