package org.apache.pdfbox.util.model;

import java.util.LinkedList;
import java.util.List;

import org.apache.pdfbox.util.TextPosition;

public class PDFLine extends PDFBox implements PDFElement {

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
			
	@Override
	public void updateBox() {
		if(words.size()==0)
			return;
		
		/* left, top, right, bottom */
		float l = Float.MAX_VALUE;
		float t = Float.MAX_VALUE;
		float r = Float.MIN_VALUE;
		float b = Float.MIN_VALUE;
		for(PDFWord word: words) {
			l = l < word.getLeft() ? l : word.getLeft();
			t = t < word.getTop() ? t : word.getTop();
			r = r > word.getRight() ? r : word.getRight();
			b = b > word.getBottom() ? b : word.getBottom();
		}
		set(l, t, r, b); 
	}
}
