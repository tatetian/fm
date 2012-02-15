package org.apache.pdfbox.util.model;

import java.util.LinkedList;
import java.util.List;

public class PDFLine implements PDFElement {

	List<PDFWord> words = new LinkedList<PDFWord>();
	
	public PDFLine() {
		
	}
	
	@Override
	public void accept(PDFElementVisitor v) {
		v.visit(this);
	}
	
	public List<PDFWord> getWords() {
		return words;
	}
	
	public void addWord(PDFWord word) {
		words.add(word);
	}
			
}
