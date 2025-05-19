namespace KISANSETU.Server.Model
{
    public class CartMaster
    {
        public int Id { get; set; }
        public string ProductId { get; set; } = string.Empty;
        public int NoOfItems { get; set; }
        public string CustomerMail { get; set; } = string.Empty;
        public int TotalAmount { get; set; }
    }
}
