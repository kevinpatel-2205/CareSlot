import ExcelJS from "exceljs";

export const generateExcelReport = async (res, title, headers, rows) => {
  if (!rows || rows.length === 0) {
    throw new Error("No data found");
  }

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(title);

  sheet.columns = headers.map((header) => ({
    header,
    key: header,
    width: 20,
  }));

  rows.forEach((row) => {
    sheet.addRow(row);
  });

  sheet.getRow(1).font = { bold: true };

  sheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };

      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
      };
    });
  });

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );

  res.setHeader("Content-Disposition", `attachment; filename=${title}.xlsx`);

  await workbook.xlsx.write(res);

  res.end();
};
