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
    public class TalukController : ControllerBase
    {

        SqlServerDb sqlserver = new SqlServerDb();
        [HttpPost]
        [Route("SaveTaluk")]
        public IActionResult SaveTaluk([FromBody] TalukMaster talukMaster)
        {
            try
            {
                SqlParameter[] parameter = new SqlParameter[]
                   {
                    new SqlParameter("@Id",talukMaster.Id),
                    new SqlParameter("@Name",talukMaster.Name),
                    new SqlParameter("@DISTRICT_ID",talukMaster.DistrictId)
                   };
                int count = sqlserver.InsertUpdateDeleteOperation("SP_INSERT_TALUK", parameter);
                if (count > 0)
                {
                    return Ok("Data inserted sucessfully");
                }
                else
                {
                    return BadRequest("Data not inserted");
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPut]
        [Route("TalukUpdate")]
        public IActionResult UpdateTaluk([FromBody] TalukMaster talukMaster, int id, int districtId)
        {
            try
            {
                SqlParameter[] parameters = new SqlParameter[]
                {
                new SqlParameter("@Id",talukMaster.Id),
                new SqlParameter("@District_Id",talukMaster.DistrictId),
                new SqlParameter("@Name",talukMaster.Name)
                };
                int count = sqlserver.InsertUpdateDeleteOperation("SP_UPDATE_TALUK", parameters);
                if (count > 0)
                {
                    return Ok("Data updateed sucessfully");
                }
                else
                {
                    return BadRequest("Data not updated");
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete]
        [Route("TalukDelete")]
        public IActionResult DeleteTaluk(int id)
        {
            try
            {
                SqlParameter[] parameters = new SqlParameter[]
                {
                new SqlParameter("@Id",id)
                };
                int count = sqlserver.InsertUpdateDeleteOperation("SP_DELETE_TALUK", parameters);
                if (count > 0)
                {
                    return Ok("Data deleted");
                }
                else
                {
                    return BadRequest("Data not deleted");
                }
            }
            catch (Exception ex)
            {
                return BadRequest($"Failed to delete {ex.Message}");
            }
        }
        [HttpGet]
        [Route("GetTaluk")]
        public List<TalukMaster> GetTaluk()
        {
            DataTable dataTable = sqlserver.selectOperation("SP_SELECT_TALUK");

            List<TalukMaster> talukMasters = new List<TalukMaster>();
            foreach (DataRow row in dataTable.Rows)
            {
                TalukMaster talukMaster = new TalukMaster
                {
                    Id = Convert.ToInt32(row["ID"]),
                    Name = row["Name"].ToString(),
                    DistrictId = Convert.ToInt32(row["District_Id"])

                };
                talukMasters.Add(talukMaster);
            }
            return talukMasters;

        }
    }
}
