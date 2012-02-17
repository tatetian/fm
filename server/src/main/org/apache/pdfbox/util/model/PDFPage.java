package org.apache.pdfbox.util.model;

import java.util.LinkedList;
import java.util.List;

public class PDFPage implements PDFElement {
	private List<PDFParagraph> paragraphs = new LinkedList<PDFParagraph>();
	private int pageNum = 1;
	private float pageWidth = 0, pageHeight = 0;
	
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
	
	public int getPageNum() {
		return pageNum;
	}
	
	public void setPageNum(int pageNum) {
		this.pageNum = pageNum;
	}
	
	public float getPageHeight() {
		return pageHeight;
	}
	
	public void setPageHeight(float h) {
		pageHeight = h;
	}
	
	public float getPageWidth() {
		return pageWidth;
	}
	
	public void setPageWidth(float w) {
		pageWidth = w;
	} 
}
