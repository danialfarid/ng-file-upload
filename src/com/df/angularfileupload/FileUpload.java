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
	public void doPost(HttpServletRequest req, HttpServletResponse res)
			throws ServletException, IOException {
		try {
			ServletFileUpload upload = new ServletFileUpload();

			FileItemIterator iterator = upload.getItemIterator(req);

			StringBuilder sb = new StringBuilder();

			while (iterator.hasNext()) {
				FileItemStream item = iterator.next();
				sb.append(item.getFieldName());
				if (item.getName() != null) {
					sb.append(" - ").append(item.getName());

				}
				sb.append(" : ");
				if (item.getName() != null) {
					sb.append("file size on the server: ").append(
							fileSize(item.openStream()));
				} else {
					sb.append(read(item.openStream()));
				}
				sb.append("<br/>");
			}
			res.setContentType("text/plain");
			PrintWriter printWriter = new PrintWriter(res.getOutputStream());
			try {
				printWriter.print(sb.toString());
				printWriter.flush();
			} finally {
				printWriter.close();
			}
		} catch (Exception ex) {
			throw new ServletException(ex);
		}
	}

	protected int fileSize(InputStream stream) {
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
		BufferedReader reader = new BufferedReader(
				new InputStreamReader(stream));
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