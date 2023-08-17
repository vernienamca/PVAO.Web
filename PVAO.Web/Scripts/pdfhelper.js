var PdfHelper = function () {
    var form = this;
    form.exportTableToPdf = function (table, pdfName, orientation) {
        var doc = new jsPDF(orientation);
        doc.autoTable({
            html: table,
            didParseCell: function (table) {
                if (table.section === "head") {
                    table.cell.styles.fillColor = [118, 160, 60];
                    table.cell.styles.textColor = [0, 0, 0];
                }
            }
        });
        doc.save(pdfName);
    }
}

var pdfHelper = new PdfHelper();
