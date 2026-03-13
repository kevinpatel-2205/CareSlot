import PDFDocument from "pdfkit";

export const generatePDFReport = (res, title, headers, rows) => {
  if (!rows || rows.length === 0) {
    throw new Error("No data found");
  }

  const doc = new PDFDocument({
    size: "A4",
    margin: 40,
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=${title}.pdf`);

  doc.pipe(res);

  const startX = 40;
  const pageWidth = 515;
  const bottomLimit = 760;

  let y = 100;

  const columnWidth = pageWidth / headers.length;

  const checkPage = () => {
    if (y > bottomLimit) {
      doc.addPage();
      y = 60;
      drawHeader();
    }
  };

  const drawRow = (row, isHeader = false) => {
    let x = startX;

    const heights = row.map((cell) =>
      doc.heightOfString(String(cell), {
        width: columnWidth - 8,
        align: "center",
      }),
    );

    const maxHeight = Math.max(...heights) + 10;

    row.forEach((cell) => {
      doc.rect(x, y, columnWidth, maxHeight).stroke();

      doc
        .font(isHeader ? "Helvetica-Bold" : "Helvetica")
        .fontSize(9)
        .text(String(cell), x + 4, y + 5, {
          width: columnWidth - 8,
          align: "center",
        });

      x += columnWidth;
    });

    y += maxHeight;
  };

  const drawHeader = () => {
    drawRow(headers, true);
  };

  doc.fontSize(18).font("Helvetica-Bold").text(title, { align: "center" });

  doc.moveDown(1);

  doc
    .fontSize(11)
    .font("Helvetica")
    .text(`Generated: ${new Date().toLocaleDateString()}`);

  y = doc.y + 20;

  drawHeader();

  rows.forEach((row) => {
    checkPage();
    drawRow(row);
  });

  doc.end();
};
