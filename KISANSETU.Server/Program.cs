using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using KISANSETU.Server.DataLayer;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // ✅ Add services to the container
        builder.Services.AddControllers();
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();

        // ✅ Inject Configuration for JWT
        var configuration = builder.Configuration;

        // ✅ Configure JWT Authentication
        var key = Encoding.UTF8.GetBytes(configuration["Jwt:Key"]);

        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = false,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = configuration["Jwt:Issuer"],
                    IssuerSigningKey = new SymmetricSecurityKey(key)
                };
            });

        // ✅ Enable CORS for frontend access
        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowAll",
                policy => policy
                    .WithOrigins("https://localhost:59151") // Your frontend URL
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .AllowCredentials()); // Keep this for authentication
        });

        // ✅ Register SQL Server DB Layer
        builder.Services.AddSingleton<SqlServerDb>();

        var app = builder.Build();

        app.UseDefaultFiles();
        app.UseStaticFiles();

        // ✅ Enable Swagger UI in development
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseHttpsRedirection();

        // ✅ Apply CORS policy
        app.UseCors("AllowAll");

        // ✅ Apply Authentication & Authorization middleware
        app.UseAuthentication(); // 👈 Missing in your code
        app.UseAuthorization();

        // ✅ Map Controllers
        app.MapControllers();
        app.MapFallbackToFile("/index.html");

        app.Run();
    }
}
