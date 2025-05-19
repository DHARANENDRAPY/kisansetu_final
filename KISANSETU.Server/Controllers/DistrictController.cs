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
    public class DistrictController : ControllerBase
    {
        SqlServerDb db = new SqlServerDb(); 
        [HttpGet]
        [Route("getDistrict")]
        public IActionResult getDistrict()
        {
            List<DistrictMaster> districtmasterobj = new List<DistrictMaster>();

          

            try
            {
                DataTable dt = db.selectOperation("SP_SELECT_DISTRICT");

                foreach (DataRow row in dt.Rows)
                {
                    DistrictMaster distobj = new DistrictMaster();
                    distobj.Id = Convert.ToInt32(row["ID"]);
                    distobj.Name = row["Name"].ToString();
                    districtmasterobj.Add(distobj);
                }


                return Ok(districtmasterobj);

            }
            catch (Exception ex)
            {
                return BadRequest("Something went wrong" + ex.Message);
            }

        }




        [HttpPost]
        [Route("addDistrict")]

        public IActionResult postDistrict([FromBody] DistrictMaster distobj)
        {
          
            try
            {
                SqlParameter[] sqlParameter = new SqlParameter[]
                {
                 new SqlParameter("@Id",distobj.Id),
                 new SqlParameter("@Name",distobj.Name),
                };
                int count = db.InsertUpdateDeleteOperation("SP_INSERT_DISTRICT", sqlParameter);
                if (count > 0)
                {
                    return Ok("District Added sucessfully");
                }
                else
                {
                    return BadRequest("District not added successfully");
                }
            }
            catch (Exception ex)
            {
                return BadRequest("Something went wrong" + ex.Message);
            }


        }

        [HttpPut]
        [Route("updateDistrict")]
        public IActionResult updateDistrict([FromQuery] int Id, [FromBody] DistrictMaster distobj)
        {
           
            try
            {
                SqlParameter[] parameters = new SqlParameter[]
                {
                 new SqlParameter("@Id",Id),
                 new SqlParameter("@Name",distobj.Name)
                };
                int count = db.InsertUpdateDeleteOperation("SP_UPDATE_DISTRICT", parameters);
                if (count > 0)
                {
                    return Ok("District updated succesfully");
                }
                else
                {
                    return NotFound("District not updated");
                }
            }
            catch (Exception ex)
            {
                return NotFound("Something went wrong" + ex.Message);
            }



        }

        [HttpDelete]
        [Route("deleteDistrict")]

        public IActionResult deleteDistrict([FromQuery] int Id)
        {
           
            DistrictMaster distobj = new DistrictMaster();
            try
            {
                SqlParameter[] parametre = new SqlParameter[]
                {
                 new SqlParameter("@Id",Id)
                };
                int count = db.InsertUpdateDeleteOperation("SP_DELETE_DISTRICT", parametre);
                if (count > 0)
                {
                    return Ok("District deleted successfully");
                }
                else
                {
                    return NotFound("District not deleted successfully");
                }

            }
            catch (Exception ex)
            {
                return BadRequest("something went wrong" + ex.Message);
            }
        }



    }
}
