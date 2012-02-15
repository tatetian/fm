package org.apache.pdfbox.util.model;

import org.apache.pdfbox.util.TextPosition;

public class PDFWord implements PDFElement {
	private TextPosition textPosition;
	
	@Override
	public void accept(PDFElementVisitor v) {
		v.visit(this);
	}
	
	public TextPosition getTextPosition() {
		return textPosition;
	}
	
	public void setTextPosition(TextPosition textPosition) {
		this.textPosition = textPosition;
	}
}
