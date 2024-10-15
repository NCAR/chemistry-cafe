namespace Chemistry_Cafe_API.Models
{
    public class TagMechanismReactionList
    {
        public Guid uuid { get; set; }
        public Guid reaction_uuid { get; set; }
        public Guid tag_mechanism_uuid { get; set; }
        public string? version { get; set; }
        public bool isDel { get; set; }
    }
}
