namespace Chemistry_Cafe_API.Models
{
    public class UserPreferences
    {
        public Guid uuid { get; set; }
        public Guid user_uuid { get; set; }
        public string? preferences { get; set; }
        public bool isDel {  get; set; }
    }
}
