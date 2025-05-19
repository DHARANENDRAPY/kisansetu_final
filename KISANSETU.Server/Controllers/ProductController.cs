using KISANSETU.Server.DataLayer;
using KISANSETU.Server.Model;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Data;

namespace KISANSETU.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        SqlServerDb db = new SqlServerDb();
        [HttpGet]
        [Route("getProductData")]
        public IActionResult getProduct()
        {
            List<ProductMaster> productMastersobj = new List<ProductMaster>();

            try
            {
                DataTable dt = db.selectOperation("SP_SELECT_PRODUCT");
                string baseUrl = $"{Request.Scheme}://{Request.Host}/";

                foreach (DataRow dr in dt.Rows)
                {
                    ProductMaster productobj = new ProductMaster
                    {
                        Id = dr["Id"].ToString(),
                        Farmermail = dr["Farmermail"].ToString(),
                        Name = dr["Name"].ToString(),
                        Profile = baseUrl + dr["Profile"].ToString(),
                        NormalPrice = Convert.ToInt32(dr["NormalPrice"]),
                        BulkPrice = Convert.ToInt32(dr["BulkPrice"]),
                        ProductType = dr["ProductType"].ToString(),
                        Rating = Convert.ToInt32(dr["Rating"]),
                        SoldIN = dr["SoldIN"].ToString(),
                        RemainingStock = Convert.ToInt32(dr["RemainingStock"])
                    };

                    productMastersobj.Add(productobj);
                }
                return Ok(productMastersobj);
            }
            catch (Exception ex)
            {
                return NotFound("Something went wrong: " + ex.Message);
            }
        }

        [HttpGet]
        [Route("getProductDataByEmail")]
        public IActionResult GetProductByEmail(string email)
        {
            if (string.IsNullOrEmpty(email))
            {
                return BadRequest("Email parameter is required.");
            }

            List<ProductMaster> productMastersobj = new List<ProductMaster>();

            try
            {
                SqlParameter[] parameters = 
                {
                      new SqlParameter("@GMAIL", email)
                };
                // Pass the email as a parameter to the stored procedure
                DataTable dt = db.selectOperationForId("SP_SELECT_PRODUCT_BY_FARMERMAIL",parameters);
                string baseUrl = $"{Request.Scheme}://{Request.Host}/";

                foreach (DataRow dr in dt.Rows)
                {
                    ProductMaster productobj = new ProductMaster
                    {
                        Id = dr["Id"].ToString(),
                        Farmermail = dr["Farmermail"].ToString(),
                        Name = dr["Name"].ToString(),
                        Profile = baseUrl + dr["Profile"].ToString(),
                        NormalPrice = Convert.ToInt32(dr["NormalPrice"]),
                        BulkPrice = Convert.ToInt32(dr["BulkPrice"]),
                        ProductType = dr["ProductType"].ToString(),
                        Rating = Convert.ToInt32(dr["Rating"]),
                        SoldIN = dr["SoldIN"].ToString(),
                        RemainingStock = Convert.ToInt32(dr["RemainingStock"])
                    };

                    productMastersobj.Add(productobj);
                }
                return Ok(productMastersobj);
            }
            catch (Exception ex)
            {
                return NotFound("Something went wrong: " + ex.Message);
            }
        }




        [HttpPost]
        [Route("postProduct")]
        public async Task<IActionResult> postproduct([FromBody] ProductMaster productobj)
        {
            try
            {
                string imagePath = null;

                if (!string.IsNullOrEmpty(productobj.Profile) && productobj.Profile.StartsWith("data:image"))
                {
                    // Extract Base64 string (remove metadata like "data:image/png;base64,")
                    var base64Data = productobj.Profile.Substring(productobj.Profile.IndexOf(',') + 1);
                    var imageBytes = Convert.FromBase64String(base64Data);

                    string folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "Images");
                    if (!Directory.Exists(folderPath))
                    {
                        Directory.CreateDirectory(folderPath);
                    }

                    // Generate a unique filename
                    string fileName = Guid.NewGuid().ToString() + ".png"; // Defaulting to PNG
                    string filePath = Path.Combine(folderPath, fileName);

                    // Save image to server
                    await System.IO.File.WriteAllBytesAsync(filePath, imageBytes);

                    // Store relative URL in database
                    imagePath = $"/Images/{fileName}";
                }
                SqlParameter[] sp = new SqlParameter[]
                               {
                    new SqlParameter("@ID", productobj.Id),
                    new SqlParameter("@FARMERMAIL", productobj.Farmermail),
                    new SqlParameter("@NAME", productobj.Name),
                  new SqlParameter("@PROFILE", imagePath ?? (object)DBNull.Value),
                    new SqlParameter("@NORMALPRICE", productobj.NormalPrice),
                    new SqlParameter("@BULKPRICE", productobj.BulkPrice),
                    new SqlParameter("@PRODUCTTYPE", productobj.ProductType),
                    new SqlParameter("@RATING", productobj.Rating),
                    new SqlParameter("@SOLDIN", productobj.SoldIN),
                    new SqlParameter("@REMAININGSTOCK", productobj.RemainingStock)
                               };

                int count = db.InsertUpdateDeleteOperation("SP_INSERT_PRODUCT", sp);
                if (count > 0)
                {
                    return Ok("Product added successfully");
                }
                else
                {
                    return BadRequest("Product not added");
                }
            }
            catch (Exception ex)
            {
                return NotFound("Something went wrong: " + ex.Message);
            }
        }


        [HttpPut]
        [Route("updateProduct")]
        public async Task<IActionResult> updateProduct([FromQuery] string Id, [FromBody] ProductMaster productobj)
        {
            try
            {
                string imagePath = null;

                if (!string.IsNullOrEmpty(productobj.Profile) && productobj.Profile.StartsWith("data:image"))
                {
                    // Handle new image upload from base64
                    var base64Data = productobj.Profile.Substring(productobj.Profile.IndexOf(',') + 1);
                    var imageBytes = Convert.FromBase64String(base64Data);
                    string folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "Images");
                    if (!Directory.Exists(folderPath))
                    {
                        Directory.CreateDirectory(folderPath);
                    }
                    string fileName = Guid.NewGuid().ToString() + ".png";
                    string filePath = Path.Combine(folderPath, fileName);
                    await System.IO.File.WriteAllBytesAsync(filePath, imageBytes);
                    imagePath = $"/Images/{fileName}";
                }
                else if (!string.IsNullOrEmpty(productobj.Profile))
                {
                    // Handle existing image path or full URL
                    if (Uri.IsWellFormedUriString(productobj.Profile, UriKind.Absolute))
                    {
                        var uri = new Uri(productobj.Profile);
                        imagePath = uri.AbsolutePath;

                        // Ensure path starts with /Images/
                        if (!imagePath.StartsWith("/Images/"))
                        {
                            var index = imagePath.IndexOf("/Images/");
                            if (index != -1)
                            {
                                imagePath = imagePath.Substring(index);
                            }
                        }

                        // Normalize any double slashes
                        imagePath = imagePath.Replace("//", "/");
                    }
                    else if (productobj.Profile.StartsWith("/Images/"))
                    {
                        imagePath = productobj.Profile.Replace("//", "/");
                    }
                    else
                    {
                        // Assume it's just the filename
                        string filename = Path.GetFileName(productobj.Profile);
                        imagePath = $"/Images/{filename}";
                    }
                }

                SqlParameter[] parameters = new SqlParameter[]
                {
            new SqlParameter("@ID", Id),
            new SqlParameter("@Farmermail", productobj.Farmermail),
            new SqlParameter("@NAME", productobj.Name),
            new SqlParameter("@PROFILE", imagePath),
            new SqlParameter("@NORMALPRICE", productobj.NormalPrice),
            new SqlParameter("@BULKPRICE", productobj.BulkPrice),
            new SqlParameter("@PRODUCTTYPE", productobj.ProductType),
            new SqlParameter("@RATING", productobj.Rating),
            new SqlParameter("@SOLDIN", productobj.SoldIN),
            new SqlParameter("@REMAININGSTOCK", productobj.RemainingStock)
                };

                int count = db.InsertUpdateDeleteOperation("SP_UPDATE_PRODUCT", parameters);
                if (count > 0)
                {
                    return Ok("Product updated successfully");
                }
                else
                {
                    return BadRequest("Product not updated");
                }
            }
            catch (Exception ex)
            {
                return BadRequest("Something went wrong: " + ex.Message);
            }
        }



        [HttpDelete]
        [Route("deleteProduct")]

        public IActionResult deleteProduct([FromQuery] string Id)
        {
            try
            {
            
                SqlParameter[] sqlParameter = new SqlParameter[]
                {
                 new SqlParameter("@ID",Id)
                };
                int count = db.InsertUpdateDeleteOperation("SP_DELETE_PRODUCT", sqlParameter);
                if (count > 0)
                {
                    return Ok("Product data deleted successfully");
                }
                else
                {
                    return BadRequest("Product data not deleted ");
                }
            }
            catch (Exception ex)
            {
                return BadRequest("Somtheing went wrong" + ex.Message);
            }
        }


        [HttpGet]
        [Route("getProductDataById")]
        public IActionResult GetProductById(string Id)
        {
            if (string.IsNullOrEmpty(Id))
            {
                return BadRequest("Id parameter is required.");
            }

            List<ProductMaster> productMastersobj = new List<ProductMaster>();

            try
            {
                SqlParameter[] parameters =
                {
                      new SqlParameter("@ID", Id)
                };
                // Pass the email as a parameter to the stored procedure
                DataTable dt = db.selectOperationForId("SP_SELECT_PRODUCT_BY_ID", parameters);
                string baseUrl = $"{Request.Scheme}://{Request.Host}/";

                foreach (DataRow dr in dt.Rows)
                {
                    ProductMaster productobj = new ProductMaster
                    {
                        Id = dr["Id"].ToString(),
                        Farmermail = dr["Farmermail"].ToString(),
                        Name = dr["Name"].ToString(),
                        Profile = baseUrl + dr["Profile"].ToString(),
                        NormalPrice = Convert.ToInt32(dr["NormalPrice"]),
                        BulkPrice = Convert.ToInt32(dr["BulkPrice"]),
                        ProductType = dr["ProductType"].ToString(),
                        Rating = Convert.ToInt32(dr["Rating"]),
                        SoldIN = dr["SoldIN"].ToString(),
                        RemainingStock = Convert.ToInt32(dr["RemainingStock"])
                    };

                    productMastersobj.Add(productobj);
                }
                return Ok(productMastersobj);
            }
            catch (Exception ex)
            {
                return NotFound("Something went wrong: " + ex.Message);
            }
        }


    }
}
