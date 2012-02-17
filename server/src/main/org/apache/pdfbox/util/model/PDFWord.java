package org.apache.pdfbox.util.model;

import java.io.IOException;
import java.util.LinkedList;
import java.util.List;

import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.util.TextPosition;

public class PDFWord extends PDFBox implements PDFElement  {
	private List<TextPosition> textPositions = new LinkedList<TextPosition>();
	private String normalizedString = null;
	
	@Override
	public void accept(PDFElementVisitor v) {
		v.visit(this);
	}
	
	public List<TextPosition> getTextPositions() {
		return textPositions;
	}
	
	public void setTextPosition(List<TextPosition> textPositions) {
		this.textPositions = textPositions;
	}
	
	public void addTextPosition(TextPosition text) {
		textPositions.add(text);
	}
	
	/*
	 * See SmartPDFTextStripper.normalize for more information about normalization
	 * */
	public void setNormalizedString(String ns) {
		normalizedString = ns;
	}
	
	public String toString() {
		if(normalizedString != null)
			return normalizedString;
		
		StringBuilder sb = new StringBuilder();
		for(TextPosition text: textPositions)
			sb.append(text.getCharacter());
		return sb.toString();
	}
	
	@Override
	public void updateBox() {
		if(textPositions.size()==0)
			return;
		
		/* left, top, right, bottom */
		float[] box = { 0f, 0f, 0f, 0f };
		float l = Float.MAX_VALUE;
		float t = Float.MAX_VALUE;
		float r = Float.MIN_VALUE;
		float b = Float.MIN_VALUE;
		for(TextPosition text: textPositions) {
			calTextPositionBox(text, box);
			l = l < box[0] ? l : box[0];
			t = t < box[1] ? t : box[1];
			r = r > box[2] ? r : box[2];
			b = b > box[3] ? b : box[3];
		}
		set(l, t, r, b); 
	}
	
	/*
	 * Calculate the bounding box of TextPosition
	 * @arg text input
	 * @arg box output
	 * */
	private void calTextPositionBox(TextPosition text, float[] box) {
		float l, t, r, b;
		l = text.getX();
		r = l + text.getWidth();
		
		/*try {
			PDFont font = text.getFont();
			PDRectangle rect = font.getFontBoundingBox();
			float yFactor = getTransformFactor(font);
			float fontSize = text.getFontSize();
			t = rect.getUpperRightY() * yFactor * fontSize;
			b = rect.getLowerLeftY() * yFactor * fontSize;
		} catch (IOException e) {*/
			// In case, the bounding box is not available
		b = text.getY() - text.getBottom();
		t = text.getY() - text.getTop();
		//}
		box[0] = l; box[1] = t; box[2] = r; box[3] = b;
	}
	
	/**
	 * A factor that transform glyph unit to display unit
	 * 
	 * Code written according to PDFStreamEngine.processEncodedText
	 * */
	private float getTransformFactor(PDFont font) {
		//float fontSizeText =  
		//float retVal = verticalDisplacement * textXctm.getYScale();
		//return retVal;
		return 1.0f;
	}
}
