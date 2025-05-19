namespace KISANSETU.Server.Model
{
    public class AddressMaster
    {
        public string Id { get; set; } = string.Empty;
        public string HouseNumber { get; set; } = string.Empty;
        public string StreetName { get; set; } = string.Empty;
        public string LandMark { get; set; } = string.Empty;
        public string Village { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public int TalukId { get; set; }
        public int DistrictId { get; set; }
        public string StateName { get; set; } = string.Empty;
    }
}
