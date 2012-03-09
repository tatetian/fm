package com.feastmind.ws;

import java.io.*;
import java.util.Collection;

import javax.servlet.*;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.http.*;

@MultipartConfig(
		location="/tmp", 
		fileSizeThreshold=10*1024*1024, //10MB
		maxFileSize=50*1024*1024,		// 50MB 
		maxRequestSize=100*1024*1024)	// 100MB
public class UploadServlet extends HttpServlet {
	@Override
	public void doGet(HttpServletRequest request,
	                    HttpServletResponse response)
	      throws ServletException, IOException {
	      
	    // Use "request" to read incoming HTTP headers (e.g. cookies)
	// and HTML form data (e.g. data the user entered and submitted)
	
	// Use "response" to specify the HTTP response line and headers
	// (e.g. specifying the content type, setting cookies).
	
	PrintWriter out = response.getWriter();
	// Use "out" to send content to browser
	out.println("1111111Hello World");
	}
  
	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		resp.setContentType("text/html");
		PrintWriter out = resp.getWriter();
	
		Collection<Part> parts = req.getParts();
	
		out.write("<h2> Total parts : "+parts.size()+"</h2>");
	
		for(Part part : parts) {
			printPart(part, out);
			part.write("samplefile");
		}
	}
	
	private void printPart(Part part, PrintWriter pw) {
		StringBuffer sb = new StringBuffer();
		sb.append("<p>");
		sb.append("Name : "+part.getName());
		sb.append("<br>");
		sb.append("Content Type : "+part.getContentType());
		sb.append("<br>");
		sb.append("Size : "+part.getSize());
		sb.append("<br>");
		for(String header : part.getHeaderNames()) {
			sb.append(header + " : "+part.getHeader(header));
			sb.append("<br>");
		}
		sb.append("</p>");
		pw.write(sb.toString());
 
	}
}
