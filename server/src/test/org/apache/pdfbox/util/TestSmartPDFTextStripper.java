package org.apache.pdfbox.util;

import java.io.File;
import java.io.IOException;
import java.io.OutputStreamWriter;

import junit.framework.TestCase;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.pdfbox.pdmodel.PDDocument;

public class TestSmartPDFTextStripper extends TestCase{
    /**
     * Logger instance.
     */
    private static final Log log = LogFactory.getLog(TestSmartPDFTextStripper.class);
    
    private SmartPDFTextStripper stripper = null;
    private final String encoding = "UTF-16LE";
    
    /**
     * Test class constructor.
     *
     * @param name The name of the test class.
     *
     * @throws IOException If there is an error creating the test.
     */
    public TestSmartPDFTextStripper( String name ) throws IOException
    {
        super( name );
        stripper = new SmartPDFTextStripper(encoding);
        stripper.setLineSeparator("\n");
    }

    public void testPrint() throws IOException {
    	String fileName = "src/test/resources/input/a1.pdf";
    	File inFile = new File(fileName);
    	PDDocument doc = PDDocument.load(inFile);
    	OutputStreamWriter writer = new OutputStreamWriter(System.out);
    	stripper.writeText(doc, writer);
    	writer.flush();
    }
}
