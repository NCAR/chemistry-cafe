
namespace ChemistryCafeAPI.Services;

/// <summary>
/// Used for differentiating different errors from
/// database queries in each service
/// </summary>
public enum QueryResult
{
    /// <summary>No errors ocurred</summary>
    Success,
    /// <summary>The given user does not have access to this resource.</summary>
    NoAccess,
    /// <summary>A resource required to complete the action was not found.</summary>
    NotFound,
    /// <summary>The specified user owning the resource was not found.</summary>
    OwnerNotFound,
    /// <summary>The parent of a resource was not found. ex: family of a species.</summary>
    ParentRelationNotFound,
    /// <summary>A child of a resource was not found. ex: species of a family.</summary>
    ChildRelationNotFound,
    /// <summary>Something was not parsable. This is typically a name identifier as a GUID.</summary>
    ParseError,
    /// <summary>There are multiple objects in a collection with the same primary key.</summary>
    DuplicateKeyError,
    /// <summary>An input violated a validation constraint. ex: two mutually exclusive fields are both set.</summary>
    ValidationError,
    /// <summary>The specified ID is already in use by another object.</summary>
    DuplicateIdError,
}