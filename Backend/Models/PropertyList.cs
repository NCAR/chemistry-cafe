namespace Chemistry_Cafe_API.Models
{
    public class PropertyList
    {
        public Guid uuid { get; set; }
        public Guid parent_uuid { get; set; }
        public string? version { get; set; }
        public bool isDel {  get; set; }
    }
}
