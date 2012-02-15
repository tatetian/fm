package org.apache.pdfbox.util.model;

import java.util.LinkedList;
import java.util.List;

public class PDFPage implements PDFElement {
	private List<PDFParagraph> paragraphs = new LinkedList<PDFParagraph>();
	
	@Override
	public void accept(PDFElementVisitor v) {
		v.visit(this);
	}
	
	public List<PDFParagraph> getParagraphs() {
		return paragraphs;
	}
	
	public void addParagraph(PDFParagraph paragraph) {
		paragraphs.add(paragraph);
	}
}
