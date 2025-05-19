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
    public class CustomerController : ControllerBase
    {
        SqlServerDb db = new SqlServerDb();
        [HttpGet]
        [Route("getCustomer")]
        public IActionResult getAllCustomer()
        {
            List<CustomerMaster> masterList = new List<CustomerMaster>();
            try
            {
                DataTable dt = db.selectOperation("SP_SELECT_CUSTOMER");
                string baseUrl = $"{Request.Scheme}://{Request.Host}/";

                foreach (DataRow row in dt.Rows)
                {
                    CustomerMaster customerobj = new CustomerMaster
                    {
                        Id = row["Id"].ToString(),
                        Name = row["Name"].ToString(),
                        LastName = row["LastName"].ToString(),
                        PhoneNumber = row["Mobile_number"].ToString(),
                        AlternativeNumber = row["Alternate_number"].ToString(),
                        Profile = $"{baseUrl}{row["Profile"].ToString()}", // Full Image URL
                        GmailId = row["GmailId"].ToString()
                    };
                    masterList.Add(customerobj);
                }
                return Ok(masterList);
            }
            catch (Exception ex)
            {
                return NotFound("Something went wrong: " + ex.Message);
            }
        }


        [HttpPost]
        [Route("postCustomerData")]
        public async Task<IActionResult> postCustomer([FromBody] CustomerMaster custobj)
        {
            try
            {
                string imagePath = null;

                // Check if Profile is a Base64 string
                if (!string.IsNullOrEmpty(custobj.Profile) && custobj.Profile.StartsWith("data:image"))
                {
                    // Extract Base64 string (removing metadata like "data:image/png;base64,")
                    var base64Data = custobj.Profile.Substring(custobj.Profile.IndexOf(',') + 1);
                    var imageBytes = Convert.FromBase64String(base64Data);

                    // Create folder if it doesn't exist
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

                SqlParameter[] parameters = new SqlParameter[]
                {
            new SqlParameter("@Id", custobj.Id),
            new SqlParameter("@Name", custobj.Name),
            new SqlParameter("@LastName", custobj.LastName),
            new SqlParameter("@Mobile_number", custobj.PhoneNumber),
            new SqlParameter("@Alternate_number", custobj.AlternativeNumber),
            new SqlParameter("@Profile", imagePath ?? custobj.Profile), // Store new or existing URL
            new SqlParameter("@GmailId", custobj.GmailId)
                };

                int count = db.InsertUpdateDeleteOperation("SP_INSERT_CUSTOMER", parameters);
                if (count > 0)
                {
                    return Ok("Customer data added successfully");
                }
                else
                {
                    return BadRequest("Customer data not added");
                }
            }
            catch (Exception ex)
            {
                return BadRequest("Something went wrong: " + ex.Message);
            }
        }

        [HttpPut]
        [Route("updateCustomer")]
        public IActionResult updateCustomer([FromQuery] string Id, [FromBody] CustomerMaster customerObj)
        {
            try
            {
                string imagePath = null;

                if (!string.IsNullOrEmpty(customerObj.Profile) && customerObj.Profile.StartsWith("data:image"))
                {
                    // Handle base64 image upload
                    var base64Data = customerObj.Profile.Substring(customerObj.Profile.IndexOf(',') + 1);
                    var imageBytes = Convert.FromBase64String(base64Data);

                    string folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "Images");
                    if (!Directory.Exists(folderPath))
                    {
                        Directory.CreateDirectory(folderPath);
                    }

                    string fileName = Guid.NewGuid().ToString() + ".png";
                    string filePath = Path.Combine(folderPath, fileName);
                    System.IO.File.WriteAllBytes(filePath, imageBytes);

                    imagePath = $"/Images/{fileName}";
                }
                else if (!string.IsNullOrEmpty(customerObj.Profile))
                {
                    // Handle existing image path or full URL
                    if (Uri.IsWellFormedUriString(customerObj.Profile, UriKind.Absolute))
                    {
                        var uri = new Uri(customerObj.Profile);
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

                        imagePath = imagePath.Replace("//", "/");
                    }
                    else if (customerObj.Profile.StartsWith("/Images/"))
                    {
                        imagePath = customerObj.Profile.Replace("//", "/");
                    }
                    else
                    {
                        string filename = Path.GetFileName(customerObj.Profile);
                        imagePath = $"/Images/{filename}";
                    }
                }

                SqlParameter[] parameters = new SqlParameter[]
                {
            new SqlParameter("@ID", Id),
            new SqlParameter("@NAME", customerObj.Name),
            new SqlParameter("@LASTNAME", customerObj.LastName),
            new SqlParameter("@MOBILE_NUMBER", customerObj.PhoneNumber),
            new SqlParameter("@ALTERNATE_NUMBER", customerObj.AlternativeNumber),
            new SqlParameter("@GMAILID", customerObj.GmailId),
            new SqlParameter("@PROFILE", imagePath)
                };

                int count = db.InsertUpdateDeleteOperation("SP_UPDATE_CUSTOMER", parameters);
                if (count > 0)
                {
                    return Ok("Customer updated successfully");
                }
                else
                {
                    return NotFound("Customer data not updated");
                }
            }
            catch (Exception ex)
            {
                return NotFound("Something went wrong: " + ex.Message);
            }
        }

        [HttpDelete]
        [Route("deleteCustomer")]
        public IActionResult deleteCustomer([FromQuery] string Id)
        {
            try
            {

                SqlParameter[] parameters = new SqlParameter[]
                {
                new SqlParameter("@Id",Id),
                };
                int count = db.InsertUpdateDeleteOperation("SP_DELETE_CUSTOMER", parameters);
                if (count > 0)
                {
                    return Ok("Customer data deletd succesfully");
                }
                else
                {
                    return BadRequest("Customer data not deleted ");
                }

            }
            catch (Exception ex)
            {
                return BadRequest("Something went wrong" + ex.Message);
            }
        }

        [HttpGet]
        [Route("getCustomerById")]
        public IActionResult GetCustomerById([FromQuery] string Id)
        {
            try
            {
                SqlServerDb db = new SqlServerDb();

                SqlParameter[] parameters = new SqlParameter[]
                {
            new SqlParameter("@ID", Id)
                };

                DataTable dt = db.selectOperationForId("SP_SELECT_CUSTOMER_ID", parameters);

                if (dt.Rows.Count == 0)
                {
                    return NotFound("Customer not found.");
                }

                DataRow row = dt.Rows[0];

                // Get base URL dynamically
                var request = HttpContext.Request;
                var baseUrl = $"{request.Scheme}://{request.Host}";

                // Construct full image URL
                string profileImage = row["PROFILE"] != DBNull.Value && !string.IsNullOrEmpty(row["PROFILE"].ToString())
                    ? $"{baseUrl}{row["PROFILE"]}"  // Ensure correct URL
                    : null;

                CustomerMaster customerObj = new CustomerMaster
                {
                    Id = row["ID"].ToString(),
                    Name = row["NAME"].ToString(),
                    LastName = row["LASTNAME"].ToString(),
                    PhoneNumber = row["MOBILE_NUMBER"].ToString(),
                    AlternativeNumber = row["ALTERNATE_NUMBER"].ToString(),
                    Profile = profileImage, // Updated profile URL
                    GmailId = row["GMAILID"].ToString()
                };

                return Ok(customerObj);
            }
            catch (Exception ex)
            {
                return BadRequest("Something went wrong: " + ex.Message);
            }
        }
        //-----------------------------------------------------------------------------------------------------------------------------------------------
        [HttpGet]
        [Route("getCustomerByEmail")]
        public IActionResult getCustomerByEmail([FromQuery] string Email)
        {
            try
            {
                SqlServerDb db = new SqlServerDb();

                SqlParameter[] parameters = new SqlParameter[]
                {
            new SqlParameter("@Email", Email)
                };

                DataTable dt = db.selectOperationForId("SP_SELECT_CUSTOMER_EMAIL", parameters);

                if (dt.Rows.Count == 0)
                {
                    return NotFound("Customer not found.");
                }

                DataRow row = dt.Rows[0];

                // Get base URL dynamically
                var request = HttpContext.Request;
                var baseUrl = $"{request.Scheme}://{request.Host}";

                // Handle profile image (check if it's a file path or Base64)
                string profileImage = null;
                if (row["PROFILE"] != DBNull.Value && !string.IsNullOrEmpty(row["PROFILE"].ToString()))
                {
                    string profileValue = row["PROFILE"].ToString();

                    if (profileValue.StartsWith("data:image"))
                    {
                        // If it's already a Base64 string, return as-is
                        profileImage = profileValue;
                    }
                    else
                    {
                        // Assume it's a file path and convert to full URL
                        profileImage = $"{baseUrl}{profileValue}";
                    }
                }

                CustomerMaster customerObj = new CustomerMaster
                {
                    Id = row["ID"].ToString(),
                    Name = row["NAME"].ToString(),
                    LastName = row["LASTNAME"].ToString(),
                    PhoneNumber = row["MOBILE_NUMBER"].ToString(),
                    AlternativeNumber = row["ALTERNATE_NUMBER"].ToString(),
                    Profile = profileImage, // Updated profile handling
                    GmailId = row["GMAILID"].ToString()
                };

                return Ok(customerObj);
            }
            catch (Exception ex)
            {
                return BadRequest("Something went wrong: " + ex.Message);
            }
        }


    }
}

