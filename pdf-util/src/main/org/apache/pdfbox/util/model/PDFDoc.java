package org.apache.pdfbox.util.model;

import java.util.Date;
import java.util.LinkedList;
import java.util.List;


public class PDFDoc implements PDFElement {
	private List<PDFPage> pages = new LinkedList<PDFPage>();
	
	private String title;
	private String[] authors;
	private String publication;
	private Date pub_date;
	private String abstracts;
	
	public PDFDoc() {
		
	}
	
	public List<PDFPage> getPages() {
		return pages;
	}
	
	public void addPage(PDFPage page) {
		pages.add(page);
	}
	
	public String getTitle() {
		return title;
	}
	
	public void setTitle(String title) {
		this.title = title;
	}
	
	public String[] getAuthors() {
		return authors;
	}
	
	public void setAuthors(String[] authors) {
		this.authors = authors;
	}
	
	public String getPublication() {
		return publication;
	}
	
	public void setPublication(String pub) {
		this.publication = pub;
	}
	
	public Date getPubDate() {
		return pub_date;
	}
	
	public void setPubDate(Date pub_date) {
		this.pub_date = pub_date;
	}
	
	public String getAbstracts() {
		return abstracts;
	}
	
	public void setAbstracts(String abstracts) {
		this.abstracts = abstracts;
	}
	
	@Override
	public void accept(PDFElementVisitor v) {
		v.visit(this);
	}

}
