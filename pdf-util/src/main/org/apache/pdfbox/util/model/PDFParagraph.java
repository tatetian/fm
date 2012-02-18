package org.apache.pdfbox.util.model;

import java.util.LinkedList;
import java.util.List;

public class PDFParagraph extends PDFBox implements PDFElement {
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
	
	@Override
	public void updateBox() {
		if(lines.size()==0)
			return;
		
		/* left, top, right, bottom */
		float l = Float.MAX_VALUE;
		float t = Float.MAX_VALUE;
		float r = Float.MIN_VALUE;
		float b = Float.MIN_VALUE;
		for(PDFLine line: lines) {
			l = l < line.getLeft() ? l : line.getLeft();
			t = t < line.getTop() ? t : line.getTop();
			r = r > line.getRight() ? r : line.getRight();
			b = b > line.getBottom() ? b : line.getBottom();
		}
		set(l, t, r, b); 
	}
}
