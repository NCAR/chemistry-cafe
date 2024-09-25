namespace Chemistry_Cafe_API.Models
{
    public class PropertyVersion
    {
        public Guid uuid { get; set; }
        public Guid parent_property_uuid { get; set; }
        public string? frozen_version { get; set; }
        public Guid tag_mechanism_uuid { get; set; }
        public Guid property_type { get; set; }
        public float? float_value { get; set; }
        public double? double_value { get; set; }
        public int? int_value { get; set; }
        public string? string_value { get; set; }
        public string? action { get; set; }
        public Guid user_uuid { get; set; }
        public DateTime datetime { get; set; }
        public bool isDel {  get; set; }
    }
}
