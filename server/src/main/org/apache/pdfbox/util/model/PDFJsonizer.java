package org.apache.pdfbox.util.model;

import java.io.IOException;
import java.io.Writer;
import java.util.Stack;

import org.json.simple.JSONObject;

public class PDFJsonizer implements PDFElementVisitor{
	private boolean compact = false;	// if the output is written in compact fomrat
	private Writer writer;
	private int indentLevel = 0;

	private PDFPage currentPage = null;
	
	private Stack<Boolean> commaFlags = new Stack<Boolean>();
	
	public PDFJsonizer(Writer writer) {
		if(writer == null)
			throw new NullPointerException();
		this.writer = writer;
	}
		
	public void setCompact(boolean compact) {
		this.compact = compact;
	}
	
	
	private void writeBox(PDFBox box) {
		writeDictEntry("l", box.getLeft() /*/ currentPage.getPageWidth() * 21.587f*/);
		writeDictEntry("r", box.getRight() /*/ currentPage.getPageWidth() * 21.587f*/);
		writeDictEntry("t", box.getTop() /*/ currentPage.getPageHeight() * 27.937f*/);
		writeDictEntry("b", box.getBottom() /*/ currentPage.getPageHeight() * 27.937f*/);
	}
	
	@Override
	public void visit(PDFWord word) {
		writeString(word.toString());
	}

	@Override
	public void visit(PDFLine line) {
		beginDict();

		writeBox(line);
		
		beginDictEntry("words");
		beginTinyArray();
		for(PDFWord word: line.getWords()) {
			beginArrayEntry();
			word.accept(this);
			endArrayEntry();
		}
		endTinyArray();
		
		beginDictEntry("xs");
		beginTinyArray();
		for(PDFWord word: line.getWords()) {
			beginArrayEntry();
			write(word.getLeft());
			endArrayEntry();
		}
		endTinyArray();
		
		beginDictEntry("ws");
		beginTinyArray();
		for(PDFWord word: line.getWords()) {
			beginArrayEntry();
			write(word.getWidth());
			endArrayEntry();
		}
		endTinyArray();
		
		endDict();
	}

	@Override
	public void visit(PDFParagraph para) {
		beginDict();
		
		writeBox(para);
		
		beginDictEntry("lines");
		beginBigArray();
		for(PDFLine line: para.getLines()) {
			beginArrayEntry();
			line.accept(this);
			endArrayEntry();
		}
		endBigArray();
		
		endDict();
	}

	@Override
	public void visit(PDFPage page) {
		currentPage = page;
		
		beginDict();
		
		writeDictEntry("width", page.getPageWidth());
		writeDictEntry("height", page.getPageHeight());
		
		beginDictEntry("paragraphs");
		beginBigArray();
		for(PDFParagraph paragraph: page.getParagraphs()) {
			beginArrayEntry();
			paragraph.accept(this);
			endArrayEntry();
		}
		endBigArray();
		
		endDict();
		
		currentPage = null;
	}
	
	@Override
	public void visit(PDFDoc doc) {
		beginDict();
		
		writeDictEntry("title", doc.getTitle());
		
		beginDictEntry("pages");
		beginBigArray();
		for(PDFPage page: doc.getPages()) {
			beginArrayEntry();
			page.accept(this);
			endArrayEntry();
		}
		endBigArray();
		endDictEntry();
		
		endDict();
		
		assert(commaFlags.size() == 0);
		
		flush();
	}
	
	private void beginDict()  
	{
		beginLine();
		write("{");
		endLine();
		indentLevel ++;
		commaFlags.push(false);
	}
	
	private void endDict() {
		indentLevel --;
		beginLine();
		write("}");
		endLine();
		commaFlags.pop();
	}
	
	private void writeDictEntry(String entryName, float val) {
		beginDictEntry(entryName);
		write(val);
		endDictEntry();
	}
	
	private void writeDictEntry(String entryName, String val) {
		beginDictEntry(entryName);
		writeString(val);
		endDictEntry();
	}
	
	private void beginDictEntry(String str) {
		if(commaFlags.peek())
			write(",");
		beginLine();
		writeString(str);
		write(":");
		if(!compact) write(" ");
	}
	
	private void endDictEntry() {
		commaFlags.pop();
		commaFlags.push(true);
		endLine();
	}
	
	private void beginBigArray() {
		write("[");
		indentLevel ++;
		commaFlags.push(false);
	}
	
	private void endBigArray() {
		indentLevel --;
		beginLine();
		write("]");
		endLine();
		commaFlags.pop();
	}
	
	private void beginTinyArray() {
		write("[");
		commaFlags.push(false);
	}
	
	private void endTinyArray() {
		write("]");
		commaFlags.pop();
	}
	
	private void beginArrayEntry() {
		if(commaFlags.peek())
			write(",");
	}
	
	private void endArrayEntry() {
		commaFlags.pop();
		commaFlags.push(true);
	}
	
	private void separateEntry() {
		write(",");
	}
	
	private void write(String str) {
		try {
			writer.write(str);
		} catch (IOException e) {
			throw new RuntimeException(e);
		}
	}
	
	private void write(float val) {
		write(""+val);
	}
	
	private void flush() {
		try {
			writer.flush();
		} catch (IOException e) {
			throw new RuntimeException(e);
		}
	}
	
	private void writeIndent() {
		if(compact) return;
		for(int i = 0; i < indentLevel; ++i) {
			write("\t");
		}
	}
	
	private void beginLine() {
		if(!compact) write("\n");
		writeIndent();
	}
	
	private void endLine() {
		
	}
	
	private void writeString(String str) {
		if(str == null)
			str = "";
		write("\"");
		write(JSONObject.escape(str));
		write("\"");
	}
}
