package org.apache.pdfbox.util.model;

public abstract class PDFBox {
	/* left, top, right, bottom
	 * (0,0) is at upper left corner 
	 * */
	private float[] box = {0f, 0f, 0f, 0f}; 

	public PDFBox() {}
	
	public float getLeft() { return box[0]; }
	public float getRight() { return box[2]; }
	public float getTop() { return box[1]; }
	public float getBottom() { return box[3]; }
	public float getWidth() { return getRight() - getLeft(); }
	public float getHeight() { return getBottom() - getTop(); }
	
	public void set(float left, float top, float right, float bottom) {
		if (left > right || top > bottom)
			throw new IllegalArgumentException(
					"Left should be smaller than right and " +
					"top should be smaller than bottom");
		box[0] = left;
		box[1] = top;
		box[2] = right;
		box[3] = bottom;
	}
	
	/*
	 * Update the bounding box according to latest state
	 * 
	 * Implemented by subclasses
	 * */
	public abstract void updateBox() ;
}
