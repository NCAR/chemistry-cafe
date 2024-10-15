namespace Chemistry_Cafe_API.Models
{
    public class PropertyType
    {
        public Guid uuid { get; set; }
        public string? name { get; set; }
        public string? units { get; set; }
        public string? validation { get; set; }
        public bool isDel { get; set; }
    }
}
