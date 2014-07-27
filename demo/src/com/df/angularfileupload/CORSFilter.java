package com.df.angularfileupload;

import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class CORSFilter implements Filter {

	@Override
	public void doFilter(ServletRequest req, ServletResponse resp, FilterChain chain) throws IOException,
			ServletException {
		HttpServletResponse httpResp = (HttpServletResponse) resp;
		HttpServletRequest httpReq = (HttpServletRequest) req;

		httpResp.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
		httpResp.setHeader("Access-Control-Allow-Origin", "*");
		if (httpReq.getMethod().equalsIgnoreCase("OPTIONS")) {
			httpResp.setHeader("Access-Control-Allow-Headers",
					httpReq.getHeader("Access-Control-Request-Headers"));
		}
		chain.doFilter(req, resp);
	}

	@Override
	public void init(FilterConfig arg0) throws ServletException {
	}

	@Override
	public void destroy() {
	}
}