namespace KISANSETU.Server.Model
{
    public class ProductMaster
    {
        public string Id { get; set; } = string.Empty;
        public string Farmermail { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Profile { get; set; } = string.Empty;
        public int NormalPrice { get; set; }
        public string ProductType { get; set; } = string.Empty;
        public int BulkPrice { get; set; }
        public int Rating { get; set; }
        public string SoldIN { get; set; } = string.Empty;
        public int RemainingStock {  get; set; }

    }
}
