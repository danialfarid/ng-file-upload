package com.df.angularfileupload;

import com.google.api.server.spi.IoUtil;
import com.google.appengine.repackaged.com.google.common.io.BaseEncoding;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;

public class S3Signature extends HttpServlet {
	@Override
	protected void service(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
		String policy_document = IoUtil.readStream(req.getInputStream());
		System.out.println(policy_document);
		String policy = BaseEncoding.base64().encode(policy_document.getBytes("UTF-8")).
		    replaceAll("\n","").replaceAll("\r","");

		Mac hmac;
		try {
			hmac = Mac.getInstance("HmacSHA1");
			String aws_secret_key = req.getParameter("aws-secret-key");
			System.out.println(aws_secret_key);

			hmac.init(new SecretKeySpec(aws_secret_key.getBytes("UTF-8"), "HmacSHA1"));
			String signature = BaseEncoding.base64().encode(
			    hmac.doFinal(policy.getBytes("UTF-8")))
			    .replaceAll("\n", "");
			res.setStatus(HttpServletResponse.SC_OK);
			res.setContentType("application/json");
			res.getWriter().write("{\"signature\":\"" + signature + "\",\"policy\":\"" + policy + "\"}");
		} catch (NoSuchAlgorithmException e) {
			throw new RuntimeException(e);
		} catch (InvalidKeyException e) {
			throw new RuntimeException(e);
		}
	}
}