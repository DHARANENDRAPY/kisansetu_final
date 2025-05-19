namespace KISANSETU.Server.Model
{
    public class OrderMaster
    {
        public int Id { get; set; }
        public string OrderId { get; set; } = string.Empty;
        public DateTime Date { get; set; } = DateTime.Now;
        public string CustomerId { get; set; } = string.Empty;
        public string FarmerId { get; set; } = string.Empty;
        public string ProductId { get; set; } = string.Empty;
        public bool OrderStatus { get; set; }
        public bool PaymentStatus { get; set; }
    }
}
