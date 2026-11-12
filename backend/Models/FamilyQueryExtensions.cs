using Microsoft.EntityFrameworkCore;

namespace ChemistryCafeAPI.Models;

/// <summary>
/// Reusable EF Core query extensions for loading Family and FamilyVersion graphs.
/// </summary>
public static class FamilyQueryExtensions
{
    /// <summary>
    /// Includes Owner, Contributors, and VerifiedVersions with their Verifier, DeprecatedBy, and ArchivedBy users.
    /// </summary>
    public static IQueryable<Family> IncludeMetadataAndVerifiedVersions(this IQueryable<Family> query)
    {
        return query
            .AsSplitQuery()
            .Include(f => f.Owner)
            .Include(f => f.Contributors)
            .Include(f => f.VerifiedVersions)
                .ThenInclude(v => v.Verifier)
            .Include(f => f.VerifiedVersions)
                .ThenInclude(v => v.DeprecatedBy)
            .Include(f => f.VerifiedVersions)
                .ThenInclude(v => v.ArchivedBy);
    }

    /// <summary>
    /// Includes CurrentVersion (with Species, Phases, PhaseSpecies, Reactions, Reactants, Products, and all 11 rate parameter tables)
    /// as well as Mechanisms (with Species, Reactions, and Phases).
    /// </summary>
    public static IQueryable<Family> IncludeFullCurrentVersion(this IQueryable<Family> query)
    {
        return query
            .AsSplitQuery()
            .Include(f => f.CurrentVersion)
                .ThenInclude(v => v.Species)
            .Include(f => f.CurrentVersion)
                .ThenInclude(v => v.Reactions)
                .ThenInclude(r => r.Reactants)
            .Include(f => f.CurrentVersion)
                .ThenInclude(v => v.Reactions)
                .ThenInclude(r => r.Products)
            .Include(f => f.CurrentVersion)
                .ThenInclude(v => v.Reactions)
                .ThenInclude(r => r.Arrhenius)
            .Include(f => f.CurrentVersion)
                .ThenInclude(v => v.Reactions)
                .ThenInclude(r => r.Tunneling)
            .Include(f => f.CurrentVersion)
                .ThenInclude(v => v.Reactions)
                .ThenInclude(r => r.Troe)
            .Include(f => f.CurrentVersion)
                .ThenInclude(v => v.Reactions)
                .ThenInclude(r => r.TernaryChemicalActivation)
            .Include(f => f.CurrentVersion)
                .ThenInclude(v => v.Reactions)
                .ThenInclude(r => r.Branched)
            .Include(f => f.CurrentVersion)
                .ThenInclude(v => v.Reactions)
                .ThenInclude(r => r.TaylorSeries)
            .Include(f => f.CurrentVersion)
                .ThenInclude(v => v.Reactions)
                .ThenInclude(r => r.Surface)
            .Include(f => f.CurrentVersion)
                .ThenInclude(v => v.Reactions)
                .ThenInclude(r => r.Emission)
            .Include(f => f.CurrentVersion)
                .ThenInclude(v => v.Reactions)
                .ThenInclude(r => r.FirstOrderLoss)
            .Include(f => f.CurrentVersion)
                .ThenInclude(v => v.Reactions)
                .ThenInclude(r => r.Photolysis)
            .Include(f => f.CurrentVersion)
                .ThenInclude(v => v.Reactions)
                .ThenInclude(r => r.UserDefined)
            .Include(f => f.CurrentVersion)
                .ThenInclude(v => v.Phases)
                .ThenInclude(p => p.Species)
            .Include(f => f.CurrentVersion)
                .ThenInclude(v => v.Phases)
                .ThenInclude(p => p.PhaseSpecies)
            .Include(f => f.Mechanisms)
                .ThenInclude(m => m.Species)
            .Include(f => f.Mechanisms)
                .ThenInclude(m => m.Reactions)
            .Include(f => f.Mechanisms)
                .ThenInclude(m => m.Phases);
    }

    /// <summary>
    /// Includes all Species, Phases (with Species and PhaseSpecies), and Reactions (with Reactants, Products, and all 11 rate parameter tables)
    /// for a FamilyVersion query.
    /// </summary>
    public static IQueryable<FamilyVersion> IncludeFullVersionGraph(this IQueryable<FamilyVersion> query)
    {
        return query
            .AsSplitQuery()
            .Include(v => v.Species)
            .Include(v => v.Phases)
                .ThenInclude(p => p.Species)
            .Include(v => v.Phases)
                .ThenInclude(p => p.PhaseSpecies)
            .Include(v => v.Reactions)
                .ThenInclude(r => r.Reactants)
            .Include(v => v.Reactions)
                .ThenInclude(r => r.Products)
            .Include(v => v.Reactions)
                .ThenInclude(r => r.Arrhenius)
            .Include(v => v.Reactions)
                .ThenInclude(r => r.Tunneling)
            .Include(v => v.Reactions)
                .ThenInclude(r => r.Troe)
            .Include(v => v.Reactions)
                .ThenInclude(r => r.TernaryChemicalActivation)
            .Include(v => v.Reactions)
                .ThenInclude(r => r.Branched)
            .Include(v => v.Reactions)
                .ThenInclude(r => r.TaylorSeries)
            .Include(v => v.Reactions)
                .ThenInclude(r => r.Surface)
            .Include(v => v.Reactions)
                .ThenInclude(r => r.Emission)
            .Include(v => v.Reactions)
                .ThenInclude(r => r.FirstOrderLoss)
            .Include(v => v.Reactions)
                .ThenInclude(r => r.Photolysis)
            .Include(v => v.Reactions)
                .ThenInclude(r => r.UserDefined);
    }
}

