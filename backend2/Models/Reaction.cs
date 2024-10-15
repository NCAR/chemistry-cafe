namespace Chemistry_Cafe_API.Models
{
    public class Reaction
    {
        public Guid uuid { get; set; }
        public string? type { get; set; }
        public bool isDel {  get; set; }
        public Guid reactant_list_uuid { get; set; }
        public Guid product_list_uuid { get; set; }
        public string reaction_string {  get; set; }
    }
}
