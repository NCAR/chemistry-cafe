using ChemistryCafeAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace ChemistryCafeAPI.Services;

/// <summary>
/// Shared helper for archiving verified mechanism versions when a family or user is deleted.
/// </summary>
internal static class FamilyArchiveHelper
{
    /// <summary>
    /// Resolves the account that should own archived families and reassigned verified versions
    /// (prefers the "NCAR" account, falling back to another Admin account).
    /// </summary>
    public static async Task<User?> ResolveArchiveOwnerAsync(
        ChemistryDbContext context,
        Guid? excludedUserId = null)
    {
        return await context.Users.FirstOrDefaultAsync(
                u => u.Username == "NCAR" && (!excludedUserId.HasValue || u.Id != excludedUserId.Value))
            ?? await context.Users.FirstOrDefaultAsync(
                u => u.Role == Role.Admin && (!excludedUserId.HasValue || u.Id != excludedUserId.Value));
    }

    /// <summary>
    /// Moves the given verified versions (and their frozen FamilyVersions and Mechanisms)
    /// into a new "[Archived]" family owned by <paramref name="archiveOwner"/>.
    /// </summary>
    public static Family ArchiveFamilyVerifiedVersions(
        ChemistryDbContext context,
        Family family,
        User archiveOwner,
        IReadOnlyCollection<VerifiedMechanismVersion> verifiedVersions)
    {
        var archivedFamily = new Family
        {
            Id = Guid.NewGuid(),
            Name = $"[Archived] {family.Name}",
            Description = $"Archived verified versions from deleted family '{family.Name}', originally owned by {family.Owner.Username}.\n{family.Description}",
            OwnerId = archiveOwner.Id,
            Owner = archiveOwner,
            IsPublic = true,
            IsArchived = true,
            CreatedDate = DateTime.UtcNow,
        };
        context.Families.Add(archivedFamily);

        foreach (var ver in verifiedVersions)
        {
            ver.OriginalFamilyId = family.Id;
            ver.OriginalFamilyName = family.Name;
            ver.OriginalOwnerId = family.Owner.Id;
            ver.OriginalOwnerUsername = family.Owner.Username;
            ver.IsArchived = true;
            ver.FamilyId = archivedFamily.Id;
            ver.Family = archivedFamily;

            if (ver.Mechanism != null)
            {
                ver.Mechanism.FamilyId = archivedFamily.Id;
                ver.Mechanism.Family = archivedFamily;
            }

            if (ver.FamilyVersion != null)
            {
                ver.FamilyVersion.FamilyId = archivedFamily.Id;
                ver.FamilyVersion.Family = archivedFamily;
                archivedFamily.Versions.Add(ver.FamilyVersion);
            }
        }

        archivedFamily.CurrentVersion = archivedFamily.Versions.FirstOrDefault();
        archivedFamily.CurrentVersionId = archivedFamily.CurrentVersion?.Id;
        return archivedFamily;
    }
}

