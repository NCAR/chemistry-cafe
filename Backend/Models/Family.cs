namespace Chemistry_Cafe_API.Models
{
    public class Family
    {
        public Guid uuid { get; set; }
        public string? name { get; set; }
        public Guid super_tag_mechanism_uuid { get; set; }
        public bool isDel {  get; set; }
    }
}
