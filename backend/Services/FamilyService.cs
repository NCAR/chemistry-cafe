using ChemistryCafeAPI.Models;

namespace ChemistryCafeAPI.Services;

public class FamilyService
{
    private readonly ChemistryDbContext _context;

    public FamilyService(ChemistryDbContext context)
    {
        _context = context;
    }


}