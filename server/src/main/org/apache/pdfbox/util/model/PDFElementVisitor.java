package org.apache.pdfbox.util.model;

public interface PDFElementVisitor {
	public void visit(PDFWord word);
	public void visit(PDFLine line);
	public void visit(PDFParagraph para);
	public void visit(PDFPage page);
	public void visit(PDFDoc doc);
}
