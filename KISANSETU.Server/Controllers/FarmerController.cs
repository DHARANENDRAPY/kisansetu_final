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
    public class FarmerController : ControllerBase
    {
        SqlServerDb db = new SqlServerDb();
        [HttpGet]
        [Route("getFarmerData")]


        public IActionResult getFarmer()
        {
            List<FarmerMaster> farmerList = new List<FarmerMaster>();
            try
            {
                DataTable dt = db.selectOperation("SP_SELECT_FARMER");
                string baseUrl = $"{Request.Scheme}://{Request.Host}/";

                foreach (DataRow row in dt.Rows)
                {
                    FarmerMaster farmer = new FarmerMaster
                    {
                        Id = row["Id"].ToString(),
                        Name = row["Name"].ToString(),
                        LastName = row["LastName"].ToString(),
                        MobileNumber = row["Mobile_Number"].ToString(),
                        AlternateMobileNumber = row["Alternate_Number"].ToString(),
                        AccountNumber = row["Account_Number"].ToString(),
                        Ifsc = row["Ifsc"].ToString(),
                        Profile = $"{baseUrl}{row["Profile"].ToString()}", // Full Image URL
                        GmailId = row["GmailId"].ToString()
                    };
                    farmerList.Add(farmer);
                }

                return Ok(farmerList);
            }
            catch (Exception ex)
            {
                return BadRequest("Something went wrong: " + ex.Message);
            }
        }


        [HttpGet]
        [Route("getFarmerByEmail")]
        public IActionResult GetFarmerByEmail(string email)
        {
            List<FarmerMaster> farmerList = new List<FarmerMaster>();
            try
            {
                SqlParameter[] parameters = new SqlParameter[]
                {
                   new SqlParameter("@Email",email)
                };
                DataTable dt = db.selectOperationForId("SP_SELECT_FARMER_BY_EMAIL",parameters);
                string baseUrl = $"{Request.Scheme}://{Request.Host}/";

                foreach (DataRow row in dt.Rows)
                {
                    FarmerMaster farmer = new FarmerMaster
                    {
                        Id = row["Id"].ToString(),
                        Name = row["Name"].ToString(),
                        LastName = row["LastName"].ToString(),
                        MobileNumber = row["Mobile_Number"].ToString(),
                        AlternateMobileNumber = row["Alternate_Number"].ToString(),
                        AccountNumber = row["Account_Number"].ToString(),
                        Ifsc = row["Ifsc"].ToString(),
                        Profile = $"{baseUrl}{row["Profile"].ToString()}",
                        GmailId = row["GmailId"].ToString()
                    };
                    farmerList.Add(farmer);
                }

                if (farmerList.Count == 0)
                {
                    return NotFound("No farmer found with the provided email.");
                }

                return Ok(farmerList);
            }
            catch (Exception ex)
            {
                return BadRequest("Something went wrong: " + ex.Message);
            }
        }



        [HttpPost]
        [Route("addFarmerdata")]
        public async Task<IActionResult> PostFarmers([FromBody] FarmerMaster farmerObj)
        {
            try
            {
                string imagePath = null;

                // Check if Profile is a Base64 string
                if (!string.IsNullOrEmpty(farmerObj.Profile) && farmerObj.Profile.StartsWith("data:image"))
                {
                    // Extract Base64 string (removing metadata like "data:image/png;base64,")
                    var base64Data = farmerObj.Profile.Substring(farmerObj.Profile.IndexOf(',') + 1);
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

                SqlParameter[] sqlParameter = new SqlParameter[]
                {
            new SqlParameter("@ID", farmerObj.Id),
            new SqlParameter("@NAME", farmerObj.Name),
            new SqlParameter("@LASTNAME", farmerObj.LastName),
            new SqlParameter("@MOBILE_NUMBER", farmerObj.MobileNumber),
            new SqlParameter("@ALTERNATE_NUMBER", farmerObj.AlternateMobileNumber),
            new SqlParameter("@ACCOUNT_NUMBER", farmerObj.AccountNumber),
            new SqlParameter("@IFSC", farmerObj.Ifsc),
            new SqlParameter("@PROFILE", imagePath ?? farmerObj.Profile), // Store new or existing URL
            new SqlParameter("@GMAILID", farmerObj.GmailId)
                };

                int count = db.InsertUpdateDeleteOperation("SP_INSERT_FARMER", sqlParameter);
                if (count > 0)
                {
                    return Ok("Farmer data saved successfully");
                }
                else
                {
                    return BadRequest("Farmer data not saved");
                }
            }
            catch (Exception ex)
            {
                return BadRequest("Something went wrong: " + ex.Message);
            }
        }

        [HttpPut]
        [Route("updateFarmer")]
        public IActionResult updateFarmerData([FromQuery] string Id, [FromBody] FarmerMaster farmerobj)
        {
            try
            {
                string imagePath = null;

                if (!string.IsNullOrEmpty(farmerobj.Profile) && farmerobj.Profile.StartsWith("data:image"))
                {
                    // Handle base64 image upload
                    var base64Data = farmerobj.Profile.Substring(farmerobj.Profile.IndexOf(',') + 1);
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
                else if (!string.IsNullOrEmpty(farmerobj.Profile))
                {
                    // Handle existing image path or full URL
                    if (Uri.IsWellFormedUriString(farmerobj.Profile, UriKind.Absolute))
                    {
                        var uri = new Uri(farmerobj.Profile);
                        imagePath = uri.AbsolutePath;

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
                    else if (farmerobj.Profile.StartsWith("/Images/"))
                    {
                        imagePath = farmerobj.Profile.Replace("//", "/");
                    }
                    else
                    {
                        string filename = Path.GetFileName(farmerobj.Profile);
                        imagePath = $"/Images/{filename}";
                    }
                }

                SqlParameter[] parameters = new SqlParameter[]
                {
            new SqlParameter("@ID", Id),
            new SqlParameter("@NAME", farmerobj.Name),
            new SqlParameter("@LASTNAME", farmerobj.LastName),
            new SqlParameter("@MOBILE_NUMBER", farmerobj.MobileNumber),
            new SqlParameter("@ALTERNATE_NUMBER", farmerobj.AlternateMobileNumber),
            new SqlParameter("@ACCOUNT_NUMBER", farmerobj.AccountNumber),
            new SqlParameter("@IFSC", farmerobj.Ifsc),
            new SqlParameter("@PROFILE", imagePath),
            new SqlParameter("@GMAILID", farmerobj.GmailId)
                };

                int count = db.InsertUpdateDeleteOperation("SP_UPDATE_FARMER", parameters);
                if (count > 0)
                {
                    return Ok("Farmer data is saved");
                }
                else
                {
                    return NotFound("Farmer data not saved");
                }
            }
            catch (Exception ex)
            {
                return NotFound("Something went wrong: " + ex.Message);
            }
        }

        [HttpDelete]
        [Route("deleteFarmer")]

        public IActionResult deleteFarmerData([FromQuery] string Id)
        {
            try
            {

                SqlParameter[] sqlParameter = new SqlParameter[]
                {
                new SqlParameter("@ID",Id)
                };
                int count = db.InsertUpdateDeleteOperation("SP_DELETE_FARMER", sqlParameter);
                if (count > 0)
                {
                    return Ok("Farmer data deleted successfully");
                }
                else
                {
                    return BadRequest("Farmer data not deleted ");
                }
            }
            catch (Exception ex)
            {
                return NotFound("Something went wrong" + ex.Message);
            }

        }

        [HttpGet]
        [Route("getFarmerById")]
        public IActionResult getFarmerById([FromQuery] string id)
        {
            try
            {
                SqlServerDb db = new SqlServerDb();

                SqlParameter[] Parameters = new SqlParameter[]
                {
                   new SqlParameter("@FarmerId", id)
                };

                DataTable dt = db.selectOperationForId("SP_SELECT_FARMER_ID", Parameters);

                if (dt.Rows.Count == 0)
                {
                    return NotFound("Farmer not found.");
                }

                DataRow row = dt.Rows[0];

                // Get base URL dynamically
                var request = HttpContext.Request;
                var baseUrl = $"{request.Scheme}://{request.Host}";

                // Construct full image URL
                string profileImage = row["Profile"] != DBNull.Value && !string.IsNullOrEmpty(row["Profile"].ToString())
                    ? $"{baseUrl}{row["Profile"]}"  // Ensure correct URL
                    : null;

                FarmerMaster farmerMaster = new FarmerMaster
                {
                    Id = row["Id"].ToString(),
                    Name = row["Name"].ToString(),
                    LastName = row["LastName"].ToString(),
                    MobileNumber = row["Mobile_Number"].ToString(),
                    AlternateMobileNumber = row["Alternate_Number"].ToString(),
                    AccountNumber = row["Account_Number"].ToString(),
                    Ifsc = row["Ifsc"].ToString(),
                    Profile = profileImage, // Updated profile URL
                    GmailId = row["GmailId"].ToString()
                };

                return Ok(farmerMaster);
            }
            catch (Exception e)
            {
                return BadRequest("Error: " + e.Message);
            }
        }
    }

    }
