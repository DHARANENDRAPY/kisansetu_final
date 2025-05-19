namespace KISANSETU.Server.Models
{
    public class RegisterModel
    {
        public string Email { get; set; }
        public string Password { get; set; }
        public string Role { get; set; } // "admin", "farmer", or "customer"
    }
}
