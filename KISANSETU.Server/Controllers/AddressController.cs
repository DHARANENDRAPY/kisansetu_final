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
    public class AddressController : ControllerBase
    {
        SqlServerDb sqlserver = new SqlServerDb();

        [HttpPost]
        [Route("PostAddress")]
        public IActionResult PostAddress([FromBody] AddressMaster address)
        {
            try
            {
                SqlParameter[] parameter = new SqlParameter[]
                {
                 new SqlParameter("@ID",address.Id),
                 new SqlParameter("@HouseNumber",address.HouseNumber),
                 new SqlParameter("@StreetName",address.StreetName),
                 new SqlParameter("@LandMark",address.LandMark),
                 new SqlParameter("@Village",address.Village),
                 new SqlParameter("@City",address.City),
                 new SqlParameter("@TalukId",address.TalukId),
                 new SqlParameter("@DistrictId",address.DistrictId),
                 new SqlParameter("@State_Name",address.StateName),
                };
                int count = sqlserver.InsertUpdateDeleteOperation("SP_INSERT_ADDRESS", parameter);
                if (count > 0)
                {
                    return Ok("Inserted data sucessfully");
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
        [HttpDelete]
        [Route("DeleteAddress")]
        public IActionResult DeleteAddress(string id)
        {
            try
            {
                SqlParameter[] parameters = new SqlParameter[]
                {
                new SqlParameter("@Id",id)
                };
                int count = sqlserver.InsertUpdateDeleteOperation("SP_DELETE_ADDRESS", parameters);
                if (count > 0)
                {
                    return Ok("Data deleted sucess...");
                }
                else
                {
                    return BadRequest("Data not deleted");
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPut]
        [Route("UpdateAddress")]
        public IActionResult UpdateAddress([FromBody] AddressMaster addressMaster, string id)
        {
            try
            {
                SqlParameter[] parameters = new SqlParameter[]
                {
                new SqlParameter("@Id",addressMaster.Id),
                new SqlParameter("@HouseNumber",addressMaster.HouseNumber),
                new SqlParameter("@StreetName",addressMaster.StreetName),
                new SqlParameter("@LandMark",addressMaster.LandMark),
                new SqlParameter("@Village",addressMaster.Village),
                new SqlParameter("@City",addressMaster.City),
                new SqlParameter("@TalukId",addressMaster.TalukId),
                new SqlParameter("@DistrictId",addressMaster.DistrictId),
                new SqlParameter("@State_Name",addressMaster.StateName)

                };
                int count = sqlserver.InsertUpdateDeleteOperation("SP_UPDATE_ADDRESS", parameters);
                if (count > 0)
                {
                    return Ok("Data updateed...");
                }
                else
                {
                    return BadRequest("Data not updated...");
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet]
        [Route("GetAddress")]
        public List<AddressMaster> GetAddresses()
        {
            DataTable dataTable = sqlserver.selectOperation("SP_SELECT_ADDRESS");
            List<AddressMaster> addressMasters = new List<AddressMaster>();
            foreach (DataRow row in dataTable.Rows)
            {
                AddressMaster addressMaster = new AddressMaster
                {
                    Id = row["ID"].ToString(),
                    HouseNumber = row["HOUSENUMBER"].ToString(),
                    StreetName = row["STREETNAME"].ToString(),
                    LandMark = row["LANDMARK"].ToString(),
                    Village = row["VILLAGE"].ToString(),
                    City = row["CITY"].ToString(),
                    TalukId = Convert.ToInt32(row["TALUKID"]),
                    DistrictId = Convert.ToInt32(row["DISTRICTID"]),
                    StateName = row["STATE_NAME"].ToString()

                };
                addressMasters.Add(addressMaster);
            }
            return addressMasters;
        }
    }
}
