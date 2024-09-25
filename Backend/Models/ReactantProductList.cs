namespace Chemistry_Cafe_API.Models
{
    public class ReactantProductList
    {
        public Guid reactant_product_uuid { get; set; }
        public Guid reaction_uuid { get; set; }
        public Guid species_uuid { get; set;}
        public int quantity { get; set; }
    }
}
