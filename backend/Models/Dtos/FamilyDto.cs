namespace ChemistryCafeAPI.Models.Dto;

/// <summary>
/// Data transfer object for the Family model, carrying the whole family graph.
/// Used to save (create/update) and load a family in a single payload.
/// </summary>
public class FamilyDto
{
    public Guid Id { get; set; }
    public Guid OwnerId { get; set; }

    /// <summary>
    /// A read projection of the owner for display. It carries no back-reference
    /// to families, so it does not reintroduce a serialization cycle. The
    /// create and update actions ignore this and take the owner from the
    /// authenticated user.
    /// </summary>
    public OwnerDto? Owner { get; set; }
    public List<Guid> ContributorIds { get; set; } = new();
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public bool IsPublic { get; set; }
    public Guid? CurrentVersionId { get; set; }
    public List<SpeciesDto> Species { get; set; } = new();
    public List<ReactionDto> Reactions { get; set; } = new();
    public List<PhaseDto> Phases { get; set; } = new();
    public List<MechanismDto> Mechanisms { get; set; } = new();
    public List<VerifiedMechanismVersionDto> VerifiedVersions { get; set; } = new();

    /// <summary>
    /// Optional note/comment for this save to be recorded in the change tracking audit log.
    /// </summary>
    public string? SaveNote { get; set; }
}

public class VerifiedMechanismVersionDto
{
    public Guid Id { get; set; }
    public Guid FamilyId { get; set; }
    public Guid FamilyVersionId { get; set; }
    public Guid? SourceMechanismId { get; set; }
    public Guid MechanismId { get; set; }
    public string Name { get; set; } = null!;
    public string? Notes { get; set; }
    public DateTime VerifiedDate { get; set; }
    public Guid VerifierId { get; set; }
    public string VerifierUsername { get; set; } = null!;
    public string? VerifierName { get; set; }
    public bool IsDeprecated { get; set; }
    public string? DeprecationReason { get; set; }
    public DateTime? DeprecatedDate { get; set; }
    public string? DeprecatedByUsername { get; set; }
    public Guid? BetterVersionId { get; set; }
    public bool IsArchived { get; set; }
    public DateTime? ArchivedDate { get; set; }
    public string? ArchivedByUsername { get; set; }
    public string? OriginalFamilyName { get; set; }
    public string? OriginalOwnerUsername { get; set; }
}

public class OwnerDto
{
    public Guid Id { get; set; }
    public string Username { get; set; } = null!;
    public Role Role { get; set; } = Role.None;
}

public class FamilyContributorDto
{
    public Guid UserId { get; set; }
    public ContributorRole Role { get; set; } = ContributorRole.Viewer;
    public string? Email { get; set; }
    public string? Username { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
}

public class AddFamilyContributorDto
{
    public Guid? UserId { get; set; }
    public string? Email { get; set; }
    public ContributorRole Role { get; set; } = ContributorRole.Viewer;
}

public class VerifyMechanismRequest
{
    public string? Name { get; set; }
    public string? Note { get; set; }
}

public class DeprecateMechanismRequest
{
    public string Reason { get; set; } = null!;
    public Guid? BetterVersionId { get; set; }
}

public class ArchiveMechanismRequest
{
    public bool IsArchived { get; set; } = true;
}

public class ArchivedVerifiedVersionDto
{
    public Guid MechanismId { get; set; }
    public Guid FamilyId { get; set; }
    public Guid FamilyVersionId { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public string OriginalFamilyName { get; set; } = null!;
    public string? OriginalOwnerUsername { get; set; }
    public string? VerifierUsername { get; set; }
    public string? VerifiedDate { get; set; }
    public string? Notes { get; set; }
    public bool IsDeprecated { get; set; }
    public string? DeprecationReason { get; set; }
    public string? BetterVersionId { get; set; }
}
