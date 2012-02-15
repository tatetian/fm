package org.apache.pdfbox.util.model;

public interface PDFElement {
	void accept(PDFElementVisitor v);
}
