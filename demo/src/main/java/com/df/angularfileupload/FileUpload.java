package com.df.angularfileupload;

import com.google.appengine.repackaged.org.joda.time.LocalDateTime;
import org.apache.commons.fileupload.FileItemIterator;
import org.apache.commons.fileupload.FileItemStream;
import org.apache.commons.fileupload.servlet.ServletFileUpload;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.Enumeration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Logger;

public class FileUpload extends HttpServlet {
	private static final long serialVersionUID = -8244073279641189889L;
	private final Logger log = Logger.getLogger(FileUpload.class.getName());

	class SizeEntry {
		public int size;
		public LocalDateTime time;
	}
	static Map<String, SizeEntry> sizeMap = new ConcurrentHashMap<>();
	int counter;

	@Override
	protected void service(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
		try {
			clearOldValuesInSizeMap();

			String ipAddress = req.getHeader("X-FORWARDED-FOR");
			if (ipAddress == null) {
				ipAddress = req.getRemoteAddr();
			}
			if (req.getMethod().equalsIgnoreCase("GET")) {
				if (req.getParameter("restart") != null) {
					sizeMap.remove(ipAddress + req.getParameter("name"));
				}
				SizeEntry entry = sizeMap.get(ipAddress + req.getParameter("name"));
				res.getWriter().write("{\"size\":" + (entry == null ? 0 : entry.size) + "}");
				res.setContentType("application/json");
				return;
			}
			req.setCharacterEncoding("utf-8");
			if (!"OPTIONS".equalsIgnoreCase(req.getMethod()) && req.getParameter("errorCode") != null) {
//				res.getWriter().write(req.getParameter("errorMessage"));
//				res.getWriter().flush();
				res.sendError(Integer.parseInt(req.getParameter("errorCode")), req.getParameter("errorMessage"));
				return;
			}
			StringBuilder sb = new StringBuilder("{\"result\": [");
			
			if (req.getHeader("Content-Type") != null
					&& req.getHeader("Content-Type").startsWith("multipart/form-data")) {
				ServletFileUpload upload = new ServletFileUpload();

				FileItemIterator iterator = upload.getItemIterator(req);

				while (iterator.hasNext()) {
					FileItemStream item = iterator.next();
					sb.append("{");
					sb.append("\"fieldName\":\"").append(item.getFieldName()).append("\",");
					if (item.getName() != null) {
						sb.append("\"name\":\"").append(item.getName()).append("\",");
					}
					if (item.getName() != null) {
						sb.append("\"size\":\"").append(size(ipAddress + item.getName(), item.openStream())).append("\"");
					} else {
						sb.append("\"value\":\"").append(read(item.openStream()).replace("\"", "'")).append("\"");
					}
					sb.append("}");
					if (iterator.hasNext()) {
						sb.append(",");
					}
				}
			} else {
				sb.append("{\"size\":\"" + size(ipAddress, req.getInputStream()) + "\"}");
			}

			sb.append("]");
			sb.append(", \"requestHeaders\": {");
			@SuppressWarnings("unchecked")
			Enumeration<String> headerNames = req.getHeaderNames();
			while (headerNames.hasMoreElements()) {
				String header = headerNames.nextElement();
				sb.append("\"").append(header).append("\":\"").append(req.getHeader(header)).append("\"");
				if (headerNames.hasMoreElements()) {
					sb.append(",");
				}
			}
			sb.append("}}");
			res.setCharacterEncoding("utf-8");
			res.getWriter().write(sb.toString());
		} catch (Exception ex) {
			throw new ServletException(ex);
		}
	}

	private void clearOldValuesInSizeMap() {
		if (counter++ == 100) {
            for (Map.Entry<String, SizeEntry> entry : sizeMap.entrySet()) {
                if (entry.getValue().time.isBefore(LocalDateTime.now().minusHours(1))) {
                    sizeMap.remove(entry.getKey());
                }
            }
            counter = 0;
        }
	}

	protected int size(String key, InputStream stream) {
		int length = sizeMap.get(key) == null ? 0 : sizeMap.get(key).size;
		try {
			byte[] buffer = new byte[200000];
			int size;
			while ((size = stream.read(buffer)) != -1) {
				length += size;
				SizeEntry entry = new SizeEntry();
				entry.size = length;
				entry.time = LocalDateTime.now();
				sizeMap.put(key, entry);
//				 for (int i = 0; i < size; i++) {
//				 System.out.print((char) buffer[i]);
//				 }
			}
		} catch (IOException e) {
			throw new RuntimeException(e);
		}
		System.out.println(length);
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
				//ignore
			}
		}
		return sb.toString();
	}
}