package com.df.angularfileupload;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.FileItemIterator;
import org.apache.commons.fileupload.FileItemStream;
import org.apache.commons.fileupload.servlet.ServletFileUpload;

public class FileUpload extends HttpServlet {
	private static final long serialVersionUID = -8244073279641189889L;

	@Override
	protected void service(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
		try {
			if (req.getHeader("Content-Type").startsWith("multipart/form-data")) {
				ServletFileUpload upload = new ServletFileUpload();

				FileItemIterator iterator = upload.getItemIterator(req);

				StringBuilder sb = new StringBuilder("{\"result\": [");

				while (iterator.hasNext()) {
					sb.append("{");
					FileItemStream item = iterator.next();
					sb.append("\"fieldName\":\"").append(item.getFieldName()).append("\",");
					if (item.getName() != null) {
						sb.append("\"name\":\"").append(item.getName()).append("\",");
					}
					if (item.getName() != null) {
						sb.append("\"size\":\"").append(size(item.openStream())).append("\"");
					} else {
						sb.append("\"value\":\"").append(read(item.openStream())).append("\"");
					}
					sb.append("}");
					if (iterator.hasNext()) {
						sb.append(",");
					}
				}
				sb.append("]}");
				res.setContentType("application/json");
				PrintWriter printWriter = new PrintWriter(res.getOutputStream());
				try {
					printWriter.print(sb.toString());
					printWriter.flush();
				} finally {
					printWriter.close();
				}
			} else {
				res.setContentType("application/json");
				PrintWriter printWriter = new PrintWriter(res.getOutputStream());
				try {
					printWriter.print("{\"result\":[{\"size\":" + size(req.getInputStream()) + "}]}");
					printWriter.flush();
				} finally {
					printWriter.close();
				}
			}
		} catch (Exception ex) {
			throw new ServletException(ex);
		}
	}

	protected int size(InputStream stream) {
		int length = 0;
		try {
			byte[] buffer = new byte[2048];
			int size;
			while ((size = stream.read(buffer)) != -1) {
				length += size;
			}
		} catch (IOException e) {
			throw new RuntimeException(e);
		}
		return length;

	}

	protected String read(InputStream stream) {
		StringBuilder sb = new StringBuilder();
		BufferedReader reader = new BufferedReader(new InputStreamReader(stream));
		try {
			String line;
			while ((line = reader.readLine()) != null) {
				sb.append(line);
			}
		} catch (IOException e) {
			throw new RuntimeException(e);
		} finally {
			try {
				reader.close();
			} catch (IOException e) {
			}
		}
		return sb.toString();

	}
}