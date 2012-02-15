package org.apache.pdfbox.util.model;

import java.util.LinkedList;
import java.util.List;

public class PDFParagraph implements PDFElement {
	private List<PDFLine> lines = new LinkedList<PDFLine>();
	
	@Override
	public void accept(PDFElementVisitor v) {
		v.visit(this);
	}

	public List<PDFLine> getLines() {
		return lines;
	}

	public void addLine(PDFLine line) {
		lines.add(line);
	}
}
