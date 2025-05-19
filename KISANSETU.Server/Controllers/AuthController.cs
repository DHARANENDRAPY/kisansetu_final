using Microsoft.AspNetCore.Mvc;
using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using KISANSETU.Server.DataLayer;
using KISANSETU.Server.Models;
using FirebaseAdmin.Auth.Hash;

namespace KISANSETU.Server.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _config;
        public AuthController(IConfiguration config)  // Inject IConfiguration via constructor
        {
            _config = config;
        }
        SqlServerDb sqlserver = new SqlServerDb();



      
        [HttpPost("register")]
        public IActionResult Register([FromBody] RegisterModel model)
        {
            if (string.IsNullOrWhiteSpace(model.Email) || string.IsNullOrWhiteSpace(model.Password))
            {
                return BadRequest("Email and password are required.");
            }

            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(model.Password); // Hashing password

            SqlParameter[] parameters = new SqlParameter[]
            {
        new SqlParameter("@Email", model.Email),
        new SqlParameter("@PasswordHash", hashedPassword),
        new SqlParameter("@Role", model.Role)
            };

            int result = sqlserver.InsertUpdateDeleteOperation("sp_RegisterUser", parameters);

            if (result > 0)
            {
                // ✅ Generate JWT token for the newly registered user
                string token = GenerateJwtToken(model.Email, model.Role);

                return Ok(new
                {
                    message = "User registered successfully",
                    token = token,
                    role = model.Role
                });
            }
            else
            {
                return BadRequest("Failed to register user");
            }
        }


        // 2️⃣ User Login Endpoint
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginModel model)
        {
            SqlParameter[] parameters = new SqlParameter[]
            {
                new SqlParameter("@Email", model.Email)
            };

            DataTable userTable = sqlserver.selectOperationForId("sp_GetUserByEmail", parameters);

            if (userTable.Rows.Count == 0)
                return Unauthorized("Invalid email or password");

            var user = userTable.Rows[0];

            string storedHashedPassword = user["PasswordHash"].ToString();
            string role = user["Role"].ToString();

            if (!BCrypt.Net.BCrypt.Verify(model.Password, storedHashedPassword))
                return Unauthorized("Invalid email or password");

            string token = GenerateJwtToken(model.Email, role);


            return Ok(new AuthResponseModel { Token = token, Role = role, Message = "Login successful" });
        }

        // 3️⃣ Generate JWT Token
        private string GenerateJwtToken(string email, string role)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.Email, email),
                new Claim(ClaimTypes.Role, role)
            };

            var token = new JwtSecurityToken(
                _config["Jwt:Issuer"],
                _config["Jwt:Issuer"],
                claims,
                expires: DateTime.UtcNow.AddHours(2),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
