using Microsoft.EntityFrameworkCore;

namespace ChemistryCafeAPI.Models;

[Index(nameof(Name), IsUnique = true)]
public class Family
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public User Owner { get; set; } = null!;
    public DateTime CreatedDate { get; set; }

    public virtual ICollection<Mechanism> Mechanisms { get; set; } = new List<Mechanism>();
}