using Razorpay.Api;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.ComponentModel.DataAnnotations;
using System.Data;
using KISANSETU.Server.DataLayer;
using Microsoft.Data.SqlClient;
using System.Security.Cryptography;
using System.Text;

namespace KISANSETU.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        SqlServerDb db = new SqlServerDb();
        private static readonly string RazorpayKeyId = "rzp_test_oDRdyrqNCDM1W4";
        private static readonly string RazorpayKeySecret = "DlPDhIMAbfOCKqOcudfvUAq1";

        private string ConvertImageToBase64(string imagePath)
        {
            try
            {
                if (string.IsNullOrEmpty(imagePath)) return null;

                string fullPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", imagePath.TrimStart('/'));

                if (!System.IO.File.Exists(fullPath))
                {
                    Console.WriteLine($"⚠️ Image not found at path: {fullPath}");
                    return null;
                }

                byte[] imageBytes = System.IO.File.ReadAllBytes(fullPath);
                string base64String = Convert.ToBase64String(imageBytes);

                return base64String;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error converting image to base64: {ex.Message}");
                return null;
            }
        }

        [HttpPost("InitiatePayment")]
        public IActionResult InitiatePayment([FromBody] OrderRequest orderRequest)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                Console.WriteLine($"❌ Validation failed: {string.Join(", ", errors)}");
                return BadRequest(new { message = "Validation failed", errors });
            }

            try
            {
                Console.WriteLine($"📝 Initiating payment for {orderRequest.CustomerEmail}, Amount: {orderRequest.TotalAmount}");

                var client = new RazorpayClient(RazorpayKeyId, RazorpayKeySecret);
                var totalAmountInPaise = orderRequest.TotalAmount * 100;

                var options = new Dictionary<string, object>
        {
            { "amount", totalAmountInPaise },
            { "currency", "INR" },
           
            { "receipt", "rcpt_" + Guid.NewGuid().ToString("N").Substring(0, 30) },

            { "notes", new Dictionary<string, string> {
                { "customer_email", orderRequest.CustomerEmail },
                { "items_count", orderRequest.CartItems?.Count.ToString() ?? "0" }
            }}
        };

                var order = client.Order.Create(options);
                string razorpayOrderId = order["id"].ToString();

                SavePaymentSession(razorpayOrderId, orderRequest);

                Console.WriteLine($"✅ Razorpay order created: {razorpayOrderId}");

                return Ok(new
                {
                    order_id = razorpayOrderId,
                    amount = totalAmountInPaise,
                    currency = "INR"
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Payment initiation failed: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
        }
    
        private void SavePaymentSession(string orderId, OrderRequest orderRequest)
        {
            try
            {
                // Store payment session details to reference during verification
                SqlParameter[] sessionParams = new SqlParameter[]
                {
                    new SqlParameter("@OrderId", orderId),
                    new SqlParameter("@CustomerEmail", orderRequest.CustomerEmail),
                    new SqlParameter("@TotalAmount", orderRequest.TotalAmount),
                    new SqlParameter("@ItemCount", orderRequest.CartItems?.Count ?? 0),
                    new SqlParameter("@Status", "Initiated"),
                    new SqlParameter("@CreatedAt", DateTime.UtcNow)
                };

                db.InsertUpdateDeleteOperation("InsertPaymentSession", sessionParams);

                // Store cart items reference for later order creation
                foreach (var item in orderRequest.CartItems)
                {
                    SqlParameter[] itemParams = new SqlParameter[]
                    {
                        new SqlParameter("@OrderId", orderId),
                        new SqlParameter("@ProductId", item.ProductId),
                        new SqlParameter("@Quantity", item.Quantity),
                        new SqlParameter("@TotalAmount", item.TotalAmount)
                    };

                    db.InsertUpdateDeleteOperation("InsertPaymentSessionItem", itemParams);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error saving payment session: {ex.Message}");
                // This is non-fatal, so we won't throw the exception
            }
        }

        [HttpPost("VerifyAndCreateOrder")]
        public IActionResult VerifyAndCreateOrder([FromBody] Payment payment)
        {
            Console.WriteLine($"🔍 Verifying payment: {payment.RazorpayPaymentId} for order {payment.RazorpayOrderId}");

            try
            {
                // Step 1: Verify payment signature
                if (!VerifyPaymentSignature(payment))
                {
                    Console.WriteLine("❌ Payment signature verification failed");
                    return BadRequest(new { success = false, message = "Payment verification failed" });
                }

                Console.WriteLine("✅ Payment signature verified successfully");

                // Step 2: Get session items from temporary storage
                var sessionItems = GetPaymentSessionItems(payment.RazorpayOrderId);
                if (sessionItems == null || !sessionItems.Any())
                {
                    Console.WriteLine("❌ No session items found");
                    return BadRequest(new { success = false, message = "Order items not found" });
                }

                // Step 3: Create the order now that payment is confirmed
                CreateOrderFromPayment(payment, sessionItems);

                // Step 4: Save payment details
                SavePaymentDetails(payment);

                // Step 5: Update payment session status
                UpdatePaymentSessionStatus(payment.RazorpayOrderId, "Completed");

                // Step 6: Clear the cart for the customer after the order is placed
                SqlParameter[] cartParams = new SqlParameter[]
                {
            new SqlParameter("@Mail", payment.Email)
                };
                int cartDeletionResult = db.InsertUpdateDeleteOperation("SP_DELETE_CART_BY_MAIL", cartParams);

                if (cartDeletionResult > 0)
                {
                    Console.WriteLine("✅ Cart cleared successfully");
                }
                else
                {
                    Console.WriteLine("❌ Failed to clear cart after order creation");
                }

                Console.WriteLine($"✅ Order created successfully for {payment.Email}");

                return Ok(new
                {
                    success = true,
                    message = "Payment verified and order created successfully"
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error processing payment: {ex.Message}");
                return StatusCode(500, new { success = false, message = "An error occurred processing the payment", error = ex.Message });
            }
        }


        private bool VerifyPaymentSignature(Payment payment)
        {
            try
            {
                // Get signature components
                string payload = $"{payment.RazorpayOrderId}|{payment.RazorpayPaymentId}";

                // Create signature using HMAC-SHA256
                using (HMACSHA256 hmac = new HMACSHA256(Encoding.UTF8.GetBytes(RazorpayKeySecret)))
                {
                    byte[] hashBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
                    string generatedSignature = BitConverter.ToString(hashBytes).Replace("-", "").ToLower();

                    // Compare with provided signature
                    return generatedSignature == payment.RazorpaySignature;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Signature verification error: {ex.Message}");
                return false;
            }
        }

        private List<CartItem> GetPaymentSessionItems(string orderId)
        {
            try
            {
                SqlParameter[] parameters = new SqlParameter[]
                {
                    new SqlParameter("@OrderId", orderId)
                };

                DataTable itemsTable = db.selectOperationForId("GetPaymentSessionItems", parameters);

                if (itemsTable.Rows.Count == 0)
                {
                    return null;
                }

                var items = new List<CartItem>();

                foreach (DataRow row in itemsTable.Rows)
                {
                    items.Add(new CartItem
                    {
                        ProductId = row["ProductId"].ToString(),
                        Quantity = Convert.ToInt32(row["Quantity"]),
                        TotalAmount = Convert.ToDecimal(row["TotalAmount"])
                    });
                }

                return items;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error retrieving session items: {ex.Message}");
                return null;
            }
        }

        private void CreateOrderFromPayment(Payment payment, List<CartItem> items)
        {
            SqlParameter[] orderParams = new SqlParameter[]
            {
                new SqlParameter("@OrderId", payment.RazorpayOrderId),
                new SqlParameter("@CustomerEmail", payment.Email),
                new SqlParameter("@TotalAmount", payment.Amount),
                new SqlParameter("@PaymentId", payment.RazorpayPaymentId),
                new SqlParameter("@OrderDate", DateTime.UtcNow),
                new SqlParameter("@Status", "Paid")
            };

            db.InsertUpdateDeleteOperation("InsertOrder", orderParams);

            foreach (var item in items)
            {
                SqlParameter[] itemParams = new SqlParameter[]
                {
                    new SqlParameter("@OrderId", payment.RazorpayOrderId),
                    new SqlParameter("@ProductId", item.ProductId),
                    new SqlParameter("@Quantity", item.Quantity),
                    new SqlParameter("@TotalAmount", item.TotalAmount)
                };

                db.InsertUpdateDeleteOperation("InsertOrderItem", itemParams);
            }
        }

        private void SavePaymentDetails(Payment payment)
        {
            SqlParameter[] parameters = new SqlParameter[]
            {
                new SqlParameter("@RazorpayPaymentId", payment.RazorpayPaymentId),
                new SqlParameter("@RazorpayOrderId", payment.RazorpayOrderId),
                new SqlParameter("@RazorpaySignature", (object?)payment.RazorpaySignature ?? DBNull.Value),
                new SqlParameter("@Email", payment.Email),
                new SqlParameter("@Amount", payment.Amount),
                new SqlParameter("@Currency", payment.Currency),
                new SqlParameter("@Date", DateTime.UtcNow)
            };

            db.InsertUpdateDeleteOperation("SavePaymentDetails", parameters);
        }

        private void UpdatePaymentSessionStatus(string orderId, string status)
        {
            SqlParameter[] parameters = new SqlParameter[]
            {
                new SqlParameter("@OrderId", orderId),
                new SqlParameter("@Status", status),
                new SqlParameter("@UpdatedAt", DateTime.UtcNow)
            };

            db.InsertUpdateDeleteOperation("UpdatePaymentSessionStatus", parameters);
        }
        [HttpGet("GetFarmerOrders")]
        public IActionResult GetFarmerOrders(string email)
        {
            if (string.IsNullOrEmpty(email))
            {
                return BadRequest("Farmer email is required.");
            }

            try
            {
                Console.WriteLine($"🌾 Fetching orders for farmer: {email}");

                // Fetch orders for the farmer
                SqlParameter[] parameters = new SqlParameter[]
                {
            new SqlParameter("@FarmerEmail", email)
                };

                DataTable ordersTable = db.selectOperationForId("GetOrdersByFarmerEmail", parameters);

                if (ordersTable.Rows.Count == 0)
                {
                    Console.WriteLine("❌ No orders found for farmer.");
                    return NotFound("No orders found for this farmer.");
                }

                var farmerOrders = new List<CustomerOrderDTO>();

                foreach (DataRow orderRow in ordersTable.Rows)
                {
                    string orderId = orderRow["OrderId"].ToString();
                    var itemParams = new SqlParameter[]
                    {
                new SqlParameter("@OrderId", orderId),
                new SqlParameter("@FarmerEmail", email)
                    };

                    // Fetch items for the specific order
                    DataTable itemsTable = db.selectOperationForId("GetFarmerOrderItemsByOrderId", itemParams);

                    var items = itemsTable.AsEnumerable().Select(item => new OrderItemDTO
                    {
                        ProductId = item["ProductId"].ToString(),
                        ProductName = item["ProductName"].ToString(),
                        Quantity = Convert.ToInt32(item["Quantity"]),
                        TotalAmount = Convert.ToDecimal(item["ItemTotal"]),
                        ProductImage = ConvertImageToBase64(item["ProductImage"]?.ToString())
                    }).ToList();

                    // Add order with items to the list
                    farmerOrders.Add(new CustomerOrderDTO
                    {
                        OrderId = orderId,
                        CustomerEmail = orderRow["CustomerEmail"].ToString(),
                        TotalAmount = Convert.ToDecimal(orderRow["TotalAmount"]),
                        OrderDate = Convert.ToDateTime(orderRow["OrderDate"]),
                        DeliveryStatus = orderRow["DeliveryStatus"].ToString(),
                        Items = items
                    });

                    Console.WriteLine($"✅ Order {orderId} for farmer {email} fetched.");
                }

                return Ok(farmerOrders);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error fetching farmer orders: {ex.Message}");
                return StatusCode(500, new { message = "Internal Server Error", error = ex.Message });
            }
        }
        [HttpGet("GetAllOrders")]
        public IActionResult GetAllOrders()
        {
            try
            {
                Console.WriteLine("📦 Fetching all orders...");

                DataTable ordersTable = db.selectOperation("GetAllOrders");

                if (ordersTable.Rows.Count == 0)
                {
                    return NotFound("No orders found.");
                }

                var allOrders = new List<CustomerOrderDTO>();

                foreach (DataRow row in ordersTable.Rows)
                {
                    allOrders.Add(new CustomerOrderDTO
                    {
                        OrderId = row["OrderId"].ToString(),
                        CustomerEmail = row["CustomerEmail"].ToString(),
                        TotalAmount = Convert.ToDecimal(row["TotalAmount"]),
                        OrderDate = Convert.ToDateTime(row["OrderDate"]),
                        DeliveryStatus = row["deliveryStatus"].ToString(),
                        Items = new List<OrderItemDTO>() // Optional: fetch items if needed
                    });
                }

                return Ok(allOrders);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error fetching all orders: {ex.Message}");
                return StatusCode(500, new { message = "Internal Server Error", error = ex.Message });
            }
        }

        [HttpPost("UpdateOrderStatus")]
        public IActionResult UpdateOrderStatus([FromBody] UpdateStatusRequest request)
        {
            if (string.IsNullOrEmpty(request.OrderId) || string.IsNullOrEmpty(request.Status))
            {
                return BadRequest("OrderId and Status are required.");
            }

            try
            {
                SqlParameter[] parameters = new SqlParameter[]
                {
            new SqlParameter("@OrderId", request.OrderId),
            new SqlParameter("@Status", request.Status)
                };

                db.InsertUpdateDeleteOperation("UpdateOrderStatus", parameters);

                Console.WriteLine($"✅ Order {request.OrderId} status updated to '{request.Status}'");

                return Ok(new { success = true, message = "Status updated successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error updating order status: {ex.Message}");
                return StatusCode(500, new { success = false, message = "Failed to update status", error = ex.Message });
            }
        }

        public class UpdateStatusRequest
        {
            public string OrderId { get; set; }
            public string Status { get; set; }
        }


        // Existing GetCustomerOrders method
        [HttpGet("GetCustomerOrders")]
        public IActionResult GetCustomerOrders(string email)
        {
            if (string.IsNullOrEmpty(email))
            {
                return BadRequest("Email is required.");
            }

            try
            {
                Console.WriteLine($"🔍 Fetching orders for: {email}");

                SqlParameter[] parameters = new SqlParameter[]
                {
                    new SqlParameter("@Email", email)
                };

                // Get orders
                DataTable ordersTable = db.selectOperationForId("GetCustomerOrders", parameters);

                if (ordersTable.Rows.Count == 0)
                {
                    Console.WriteLine("❌ No orders found.");
                    return NotFound("No orders found.");
                }

                var finalOrders = new List<CustomerOrderDTO>();

                foreach (DataRow orderRow in ordersTable.Rows)
                {
                    string orderId = orderRow["OrderId"].ToString();
                    var itemParams = new SqlParameter[] { new SqlParameter("@OrderId", orderId) };
                    DataTable itemsTable = db.selectOperationForId("GetOrderItemsByOrderId", itemParams);

                    var items = itemsTable.AsEnumerable().Select(item => new OrderItemDTO
                    {
                        ProductId = item["ProductId"].ToString(),
                        ProductName = item["ProductName"].ToString(),
                        Quantity = Convert.ToInt32(item["Quantity"]),
                        TotalAmount = Convert.ToDecimal(item["ItemTotal"]),
                        ProductImage = ConvertImageToBase64(item["ProductImage"]?.ToString())
                    }).ToList();

                    finalOrders.Add(new CustomerOrderDTO
                    {
                        OrderId = orderRow["OrderId"].ToString(),
                        CustomerEmail = orderRow["CustomerEmail"].ToString(),
                        TotalAmount = Convert.ToDecimal(orderRow["TotalAmount"]),
                        OrderDate = Convert.ToDateTime(orderRow["OrderDate"]),
                        DeliveryStatus = orderRow["DeliveryStatus"].ToString(),
                        Items = items
                    });


                    Console.WriteLine($"✅ Order {orderId} fetched with {items.Count} items.");
                }

                return Ok(finalOrders);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error: {ex.Message}");
                return StatusCode(500, new { message = "Internal Server Error", error = ex.Message });
            }
        }

        // DTOs
        public class CustomerOrderDTO
        {
            public string OrderId { get; set; }
            public string CustomerEmail { get; set; }
            public decimal TotalAmount { get; set; }
            public DateTime OrderDate { get; set; }
            public string DeliveryStatus { get; set; }
            public List<OrderItemDTO> Items { get; set; }
        }

        public class OrderItemDTO
        {
            public string ProductId { get; set; }
            public string ProductName { get; set; }
            public int Quantity { get; set; }
            public decimal TotalAmount { get; set; }
            public string ProductImage { get; set; }
        }

        public class OrderRequest
        {
            [Required] public string CustomerEmail { get; set; }
            [Required][Range(0.01, double.MaxValue)] public decimal TotalAmount { get; set; }
            [Required] public List<CartItem> CartItems { get; set; }
        }

        public class CartItem
        {
            [Required] public string ProductId { get; set; } = string.Empty;
            [Required][Range(1, int.MaxValue)] public int Quantity { get; set; }
            [Required][Range(0.01, double.MaxValue)] public decimal TotalAmount { get; set; }
        }

        public class Payment
        {
            public string RazorpayPaymentId { get; set; }               
            public string RazorpayOrderId { get; set; }
            public string RazorpaySignature { get; set; }
            public string Email { get; set; }
            public decimal Amount { get; set; }
            public string Currency { get; set; }
        }
    }
}