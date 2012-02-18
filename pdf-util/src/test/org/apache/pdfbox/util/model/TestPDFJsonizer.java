package org.apache.pdfbox.util.model;

import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.Writer;

import junit.framework.TestCase;

public class TestPDFJsonizer extends TestCase {
	public void testBasic() throws IOException {
		// construct the doc
		PDFDoc doc = new PDFDoc();
		PDFPage page = new PDFPage();
		PDFParagraph para = new PDFParagraph();
		PDFLine line = new PDFLine();
		PDFWord hello = new PDFWord();
		PDFWord world = new PDFWord();
		line.addWord(hello); line.addWord(world);
		para.addLine(line);
		page.addParagraph(para);
		doc.addPage(page);
		doc.addPage(page);
		// init jsonizer
		Writer writer = new OutputStreamWriter(System.out);
		PDFJsonizer jsonizer = new PDFJsonizer(writer);
		doc.accept(jsonizer);
		writer.flush();
	}
}
