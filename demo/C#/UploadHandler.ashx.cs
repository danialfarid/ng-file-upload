using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MyApp.Uploads
{
    /// <summary>
    /// Summary description for UploadHandler
    /// </summary>
    public class UploadHandler : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            if (context.Request.Files.Count > 0)
            {
                HttpFileCollection files = context.Request.Files;
                var userName = context.Request.Form["name"];
                for (int i = 0; i < files.Count; i++)
                {
                    HttpPostedFile file = files[i];

                    string fname = context.Server.MapPath("Uploads\\" + userName.ToUpper() + "\\" + file.FileName);
                    file.SaveAs(fname);
                }
            }
            context.Response.ContentType = "text/plain";
            context.Response.Write("File/s uploaded successfully!");
        }

        public bool IsReusable
        {
            get
            {
                return false;
            }
        }
    }
}
