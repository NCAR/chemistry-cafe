namespace Chemistry_Cafe_API.Models
{
    public class User
    {
        public Guid uuid { get; set; }
        public string? log_in_info { get; set; }
        public bool isDel {  get; set; }
    }
}
