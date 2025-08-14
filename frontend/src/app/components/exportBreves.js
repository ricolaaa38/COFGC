import { Document, Packer, Paragraph, HeadingLevel, TextRun } from "docx";

export async function exportBreves(brevesForExport) {
  if (!brevesForExport || brevesForExport.length === 0) {
    alert("Aucune brève à exporter !");
    return;
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: brevesForExport
          .map((breve, idx) => [
            new Paragraph({
              text: `BQSM #${breve.bqsmNumb || ""} - ${breve.titre || ""}`,
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 300 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Date : ", bold: true }),
                new TextRun(`${breve.date || ""}\n`),
                new TextRun({ text: "Catégorie : ", bold: true }),
                new TextRun(`${breve.categorie || ""}\n`),
                new TextRun({ text: "Zone : ", bold: true }),
                new TextRun(`${breve.zone || ""}\n`),
                new TextRun({ text: "Pays : ", bold: true }),
                new TextRun(`${breve.pays || ""}\n`),
              ],
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Latitude : ", bold: true }),
                new TextRun(`${breve.latitude || ""}°N\n`),
                new TextRun({ text: "Longitude : ", bold: true }),
                new TextRun(`${breve.longitude || ""}°E\n`),
              ],
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Compte-Rendu : ", bold: true }),
                new TextRun(breve.contenu || ""),
              ],
              spacing: { after: 400 },
            }),
          ])
          .flat(),
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "breves_export.docx";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
