namespace Chemistry_Cafe_API.Models
{
    public class TagMechanismReactionListVersion
    {
        public Guid uuid { get; set; }
        public Guid tag_mechanism_uuid { get; set; }
        public Guid reaction_uuid { get; set; }
        public string? frozen_version { get; set; }
        public string? action { get; set; }
        public Guid user_uuid { get; set; }
        public DateTime datetime { get; set; }
        public bool isDel {  get; set; }
    }
}
