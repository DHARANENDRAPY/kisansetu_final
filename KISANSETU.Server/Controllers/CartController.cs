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
    public class CartController : ControllerBase
    {
        SqlServerDb sqlserver = new SqlServerDb();
        [HttpGet]
        [Route("GetCartbyMail")]
        public IActionResult GetCartMasters([FromQuery] string Mail)
        {
            try
            {
                SqlParameter[] parameters = new SqlParameter[]
                {
                    new SqlParameter("@CustomerMail",Mail)
                };
                DataTable dataTable = sqlserver.selectOperationForId("SP_SELECT_CART_FROM_MAIL", parameters);
                List<CartMaster> cartMasters = new List<CartMaster>();
                foreach (DataRow row in dataTable.Rows)
                {
                    CartMaster cartMaster = new CartMaster
                    {
                        Id = Convert.ToInt32(row["id"]),
                        ProductId = row["PRODUCTID"].ToString(),
                        NoOfItems = Convert.ToInt32(row["NOOFITEMS"]),
                        CustomerMail = row["CUSTOMERMAIL"].ToString(),
                        TotalAmount = Convert.ToInt32(row["TOTALAMOUNT"])
                    };
                    cartMasters.Add(cartMaster);
                }
                return Ok(cartMasters);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

      
        [HttpGet]
        [Route("GetCart")]
        public IActionResult GetCart()
        {
            try
            {
              
                DataTable dataTable = sqlserver.selectOperation ("SP_SELECT_CART");
                List<CartMaster> cartMasters = new List<CartMaster>();
                foreach (DataRow row in dataTable.Rows)
                {
                    CartMaster cartMaster = new CartMaster
                    {
                        Id = Convert.ToInt32(row["id"]),
                        ProductId = row["PRODUCTID"].ToString(),
                        NoOfItems = Convert.ToInt32(row["NOOFITEMS"]),
                        CustomerMail = row["CUSTOMERMAIL"].ToString(),
                        TotalAmount = Convert.ToInt32(row["TOTALAMOUNT"])
                    };
                    cartMasters.Add(cartMaster);
                }
                return Ok(cartMasters);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }



        [HttpPost]
        [Route("InsertCart")]
        public IActionResult InsertCart([FromBody] CartMaster cartMaster)
        {
            try
            {
                SqlParameter[] parameters = new SqlParameter[]
                {
                
                new SqlParameter("@PRODUCTID",cartMaster.ProductId),
                new SqlParameter("@NOOFITEMS",cartMaster.NoOfItems),
                new SqlParameter("@CUSTOMERMAIL",cartMaster.CustomerMail),
                new SqlParameter("@TOTALAMOUNT",cartMaster.TotalAmount)
                };
                int count = sqlserver.InsertUpdateDeleteOperation("SP_INSERT_CART", parameters);
                if (count > 0)
                {
                    return Ok("Data inserted...");
                }
                else
                {
                    return BadRequest("Data not inserted...");
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpDelete]
        [Route("DeleteCartByProductId")]
        public IActionResult DeleteCartById(string productId)
        {
            try
            {
                // Define SQL parameters for the stored procedure
                SqlParameter[] parameters = new SqlParameter[]
                {
            new SqlParameter("@PRODUCTID", productId)
                };

                // Perform the delete operation using the stored procedure
                int count = sqlserver.InsertUpdateDeleteOperation("SP_DELETE_CART_BY_PRODUCTID", parameters);

                // Check if the operation was successful
                if (count > 0)
                {
                    return Ok("Item successfully deleted from cart.");
                }
                else
                {
                    return BadRequest("Failed to delete item from cart.");
                }
            }
            catch (Exception ex)
            {
                // Return error message in case of failure
                return BadRequest($"Error: {ex.Message}");
            }
        }


        
        [HttpPut]
        [Route("UpdateCart")]
        public IActionResult UpdateCart([FromBody] CartMaster cartMaster, int ID)
        {
            try
            {
                SqlParameter[] parameters = new SqlParameter[]
                {
                new SqlParameter("@Id",cartMaster.Id),
                new SqlParameter("@ProductId",cartMaster.ProductId),
                new SqlParameter("@NoOFItems",cartMaster.NoOfItems),
                new SqlParameter("@CUSTOMERMAIL",cartMaster.CustomerMail),
                new SqlParameter("@TotalAmount",cartMaster.TotalAmount)
                };
                int count = sqlserver.InsertUpdateDeleteOperation("SP_UPDATE_CART", parameters);
                if (count > 0)
                {
                    return Ok("Data updated...");
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
    }
}
