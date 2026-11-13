using ChemistryCafeAPI.Models;
using Microsoft.AspNetCore.Mvc;
using ChemistryCafeAPI.Services;
using ChemistryCafeAPI.Models.Dto;
using ChemistryCafeAPI.Models.Mappers;

using System.Diagnostics.CodeAnalysis;
using Microsoft.AspNetCore.Authorization;

namespace ChemistryCafeAPI.Controllers
{
    [ApiController]
    [Route("api/families")]
    public class FamilyController(FamilyService familyService, UserService userService) : ControllerBase
    {
        [ExcludeFromCodeCoverage]
        protected virtual string? GetNameIdentifier() => userService.GetNameIdentifier();

        [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<FamilyDto>>>
            GetFamilies([FromQuery] bool? expand = false)
        {
            var (_, viewer) = await userService.GetCurrentUserAsync(GetNameIdentifier());
            var bExpand = expand ?? false;
            var families = await familyService.GetFamiliesAsync(bExpand, viewer);
            return Ok(families.Select(f => f.ToDto()));
        }

        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<ActionResult<FamilyDto>> GetFamily(Guid id, [FromQuery] Guid? versionId = null)
        {
            var (_, viewer) = await userService.GetCurrentUserAsync(GetNameIdentifier());
            if (versionId.HasValue)
            {
                var versionDto = await familyService.GetFamilyVersionAsync(id, versionId.Value, viewer);
                return versionDto == null ? NotFound() : Ok(versionDto);
            }
            var family = await familyService.GetFamilyAsync(id, viewer);
            return family == null ? NotFound() : Ok(family.ToDto());
        }

        [AllowAnonymous]
        [HttpGet("{id}/versions/{versionId}")]
        public async Task<ActionResult<FamilyDto>> GetFamilyVersion(Guid id, Guid versionId)
        {
            var (_, viewer) = await userService.GetCurrentUserAsync(GetNameIdentifier());
            var versionDto = await familyService.GetFamilyVersionAsync(id, versionId, viewer);
            return versionDto == null ? NotFound() : Ok(versionDto);
        }

        /// <summary>
        /// Creates a brand new family assigned to the user with a unique GUID
        /// The user is only able to specify the following fields:
        /// <list type="bullet">
        ///     <item>name</item>
        ///     <item>description</item>
        ///     <item>isPublic</item>
        /// </list>
        /// Everything else is set to a default value when the family is created.
        /// </summary>
        /// <param name="family">Information that should be saved to the database</param>
        /// <returns>HTTP result</returns>
        [Authorize]
        [HttpPost]
        public async Task<ActionResult<FamilyDto>> CreateFamily(FamilyDto family)
        {
            var (status, user) = await userService.GetCurrentUserAsync(GetNameIdentifier());
            if (status == QueryResult.ParseError)
            {
                return BadRequest("Name identifier is not parsable as a guid");
            }
            if (GetNameIdentifier() == null)
            {
                return Unauthorized();
            }

            var (code, createdFamily) = await familyService.CreateFamilyAsync(family, user);
            if (createdFamily == null)
            {
                return code switch
                {
                    QueryResult.OwnerNotFound => Unauthorized("User does not exist"),
                    QueryResult.ValidationError => BadRequest("The family references an id that is not part of the family."),
                    QueryResult.DuplicateIdError => BadRequest("The specified ID is already in use by another object."),
                    _ => StatusCode(500),
                };
            }

            return CreatedAtAction(
                nameof(GetFamily),
                new { id = createdFamily.Entity.Id },
                createdFamily.Entity.ToDto()
            );
        }

        /// <summary>
        /// Updates surface-level information of a given family.
        /// The user is only able to specify the following fields:
        /// <list type="bullet">
        ///     <item>name</item>
        ///     <item>description</item>
        ///     <item>owner</item>
        ///     <item>isPublic</item>
        /// </list>
        /// </summary>
        /// <param name="id">Database ID of the family to update</param>
        /// <param name="family">Information about the family to update</param>
        /// <returns>HTTP result</returns>
        [Authorize]
        [HttpPatch("{id}")]
        public async Task<IActionResult> UpdateFamily(Guid id, FamilyDto family)
        {
            if (family.Id != id)
            {
                return BadRequest("id parameter does not match given family id");
            }
            string? nameIdentifier = GetNameIdentifier();
            if (nameIdentifier == null)
            {
                return Unauthorized("User is not authenticated");
            }
            var code = await familyService.UpdateFamilyAsync(id, family, nameIdentifier);
            return code switch
            {
                QueryResult.NotFound => NotFound("Family not found"),
                QueryResult.NoAccess => StatusCode(StatusCodes.Status403Forbidden),
                QueryResult.ParseError => BadRequest("Invalid UUID format for user's name identifier claim"),
                QueryResult.ValidationError => BadRequest("The family references an id that is not part of the family."),
                _ => NoContent(),
            };

        }

        /// <summary>
        /// Deletes a given family if it is attributed to the current user
        /// </summary>
        /// <param name="id">Database ID of the family to delete</param>
        /// <returns>HTTP result</returns>
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFamily(Guid id)
        {
            string? nameIdentifier = GetNameIdentifier();
            if (nameIdentifier == null)
            {
                return Unauthorized("User is not authenticated");
            }
            var code = await familyService.DeleteFamilyAsync(id, nameIdentifier);
            return code switch
            {
                QueryResult.NotFound => NotFound("Family not found"),
                QueryResult.NoAccess => StatusCode(StatusCodes.Status403Forbidden),
                QueryResult.ParseError => BadRequest("Invalid UUID format for user's name identifier claim"),
                _ => NoContent(),
            };
        }

        [Authorize]
        [HttpGet("{id}/contributors")]
        public async Task<ActionResult<IEnumerable<FamilyContributorDto>>> GetContributors(Guid id)
        {
            string? nameIdentifier = GetNameIdentifier();
            if (nameIdentifier == null)
            {
                return Unauthorized("User is not authenticated");
            }

            var (code, contributors) = await familyService.GetContributorsAsync(id, nameIdentifier);
            return code switch
            {
                QueryResult.NotFound => NotFound("Family not found"),
                QueryResult.NoAccess => StatusCode(StatusCodes.Status403Forbidden),
                QueryResult.ParseError => BadRequest("Invalid UUID format for user's name identifier claim"),
                _ => Ok(contributors),
            };
        }

        [Authorize]
        [HttpPost("{id}/contributors")]
        public async Task<ActionResult<FamilyContributorDto>> AddContributor(Guid id, [FromBody] AddFamilyContributorDto request)
        {
            string? nameIdentifier = GetNameIdentifier();
            if (nameIdentifier == null)
            {
                return Unauthorized("User is not authenticated");
            }

            if (string.IsNullOrWhiteSpace(request.Username))
            {
                return BadRequest("Username must be provided.");
            }

            var (code, contributor) = await familyService.AddContributorAsync(
                id, request.Username, request.Role, nameIdentifier);

            return code switch
            {
                QueryResult.NotFound => NotFound("Family not found"),
                QueryResult.UserNotFound => NotFound("User not found. Contributor must have logged in once."),
                QueryResult.ValidationError => BadRequest("Owner cannot be added as a contributor."),
                QueryResult.NoAccess => StatusCode(StatusCodes.Status403Forbidden),
                QueryResult.ParseError => BadRequest("Invalid UUID format for user's name identifier claim"),
                _ => Ok(contributor),
            };
        }

        [Authorize]
        [HttpPut("{id}/contributors/{contributorUserId}")]
        public async Task<ActionResult<FamilyContributorDto>> UpdateContributor(Guid id, Guid contributorUserId, [FromBody] UpdateFamilyContributorDto request)
        {
            string? nameIdentifier = GetNameIdentifier();
            if (nameIdentifier == null)
            {
                return Unauthorized("User is not authenticated");
            }

            if (contributorUserId == Guid.Empty)
            {
                return BadRequest("Valid contributor user GUID must be provided.");
            }

            var (code, contributor) = await familyService.UpdateContributorAsync(
                id, contributorUserId, request.Role, nameIdentifier);

            return code switch
            {
                QueryResult.NotFound => NotFound("Family or contributor not found"),
                QueryResult.ValidationError => BadRequest("Owner cannot be added or updated as a contributor."),
                QueryResult.NoAccess => StatusCode(StatusCodes.Status403Forbidden),
                QueryResult.ParseError => BadRequest("Invalid UUID format for user's name identifier claim"),
                _ => Ok(contributor),
            };
        }

        [Authorize]
        [HttpPut("{id}/contributors")]
        public async Task<ActionResult<FamilyContributorDto>> UpdateContributorFromBody(Guid id, [FromBody] UpdateFamilyContributorDto request)
        {
            if (!request.UserId.HasValue || request.UserId.Value == Guid.Empty)
            {
                return BadRequest("Valid contributor user GUID must be provided.");
            }

            return await UpdateContributor(id, request.UserId.Value, request);
        }

        [Authorize]
        [HttpDelete("{id}/contributors/{contributorUserId}")]
        public async Task<IActionResult> DeleteContributor(Guid id, Guid contributorUserId)
        {
            string? nameIdentifier = GetNameIdentifier();
            if (nameIdentifier == null)
            {
                return Unauthorized("User is not authenticated");
            }

            if (contributorUserId == Guid.Empty)
            {
                return BadRequest("Valid contributor user GUID must be provided.");
            }

            var code = await familyService.RemoveContributorAsync(id, contributorUserId, nameIdentifier);
            return code switch
            {
                QueryResult.NotFound => NotFound("Family or contributor not found"),
                QueryResult.ValidationError => BadRequest("Owner cannot be removed as a contributor."),
                QueryResult.NoAccess => StatusCode(StatusCodes.Status403Forbidden),
                QueryResult.ParseError => BadRequest("Invalid UUID format for user's name identifier claim"),
                _ => NoContent(),
            };
        }

        [Authorize]
        [HttpPost("{id}/mechanisms/{mechanismId}/verify")]
        public async Task<ActionResult<VerifiedMechanismVersionDto>> VerifyMechanism(Guid id, Guid mechanismId, [FromBody] VerifyMechanismRequest request)
        {
            string? nameIdentifier = GetNameIdentifier();
            if (nameIdentifier == null)
            {
                return Unauthorized("User is not authenticated");
            }

            var (code, result) = await familyService.VerifyMechanismAsync(id, mechanismId, request, nameIdentifier);
            return code switch
            {
                QueryResult.NotFound => NotFound("Family or mechanism not found"),
                QueryResult.NoAccess => StatusCode(StatusCodes.Status403Forbidden, "Only Verifiers and Admins can verify mechanisms."),
                QueryResult.ValidationError => BadRequest("Only mechanisms in public families can be verified."),
                QueryResult.ParseError => BadRequest("Invalid UUID format for user's name identifier claim"),
                QueryResult.OwnerNotFound => Unauthorized("User does not exist"),
                _ => Ok(result),
            };
        }

        [Authorize]
        [HttpPost("{id}/mechanisms/{mechanismId}/deprecate")]
        public async Task<ActionResult<VerifiedMechanismVersionDto>> DeprecateMechanism(Guid id, Guid mechanismId, [FromBody] DeprecateMechanismRequest request)
        {
            string? nameIdentifier = GetNameIdentifier();
            if (nameIdentifier == null)
            {
                return Unauthorized("User is not authenticated");
            }

            var (code, result) = await familyService.DeprecateMechanismAsync(id, mechanismId, request, nameIdentifier);
            return code switch
            {
                QueryResult.NotFound => NotFound("Family or mechanism not found"),
                QueryResult.NoAccess => StatusCode(StatusCodes.Status403Forbidden, "Only Verifiers and Admins can deprecate mechanisms."),
                QueryResult.ValidationError => BadRequest("Only verified mechanisms can be deprecated."),
                QueryResult.ParseError => BadRequest("Invalid UUID format for user's name identifier claim"),
                QueryResult.OwnerNotFound => Unauthorized("User does not exist"),
                _ => Ok(result),
            };
        }

        [Authorize]
        [HttpDelete("{id}/mechanisms/{mechanismId}/deprecate")]
        public async Task<ActionResult<VerifiedMechanismVersionDto>> UndeprecateMechanism(Guid id, Guid mechanismId)
        {
            string? nameIdentifier = GetNameIdentifier();
            if (nameIdentifier == null)
            {
                return Unauthorized("User is not authenticated");
            }

            var (code, result) = await familyService.UndeprecateMechanismAsync(id, mechanismId, nameIdentifier);
            return code switch
            {
                QueryResult.NotFound => NotFound("Family or mechanism not found"),
                QueryResult.NoAccess => StatusCode(StatusCodes.Status403Forbidden, "Only Verifiers and Admins can remove mechanism deprecation."),
                QueryResult.ValidationError => BadRequest("Only verified mechanisms can be undeprecated."),
                QueryResult.ParseError => BadRequest("Invalid UUID format for user's name identifier claim"),
                QueryResult.OwnerNotFound => Unauthorized("User does not exist"),
                _ => Ok(result),
            };
        }

        [Authorize]
        [HttpPost("{id}/mechanisms/{mechanismId}/archive")]
        public async Task<ActionResult<VerifiedMechanismVersionDto>> ArchiveMechanism(Guid id, Guid mechanismId, [FromBody] ArchiveMechanismRequest request)
        {
            string? nameIdentifier = GetNameIdentifier();
            if (nameIdentifier == null)
            {
                return Unauthorized("User is not authenticated");
            }

            var (code, result) = await familyService.ArchiveMechanismAsync(id, mechanismId, request, nameIdentifier);
            return code switch
            {
                QueryResult.NotFound => NotFound("Family or mechanism not found"),
                QueryResult.NoAccess => StatusCode(StatusCodes.Status403Forbidden, "Only Verifiers and Admins can archive mechanisms."),
                QueryResult.ValidationError => BadRequest("Only verified mechanisms can be archived."),
                QueryResult.ParseError => BadRequest("Invalid UUID format for user's name identifier claim"),
                QueryResult.OwnerNotFound => Unauthorized("User does not exist"),
                _ => Ok(result),
            };
        }

        [Authorize]
        [HttpDelete("{id}/mechanisms/{mechanismId}/verified")]
        public async Task<IActionResult> DeleteVerifiedMechanism(Guid id, Guid mechanismId)
        {
            string? nameIdentifier = GetNameIdentifier();
            if (nameIdentifier == null)
            {
                return Unauthorized("User is not authenticated");
            }

            var code = await familyService.DeleteVerifiedMechanismAsync(id, mechanismId, nameIdentifier);
            return code switch
            {
                QueryResult.NotFound => NotFound("Family or mechanism not found"),
                QueryResult.NoAccess => StatusCode(StatusCodes.Status403Forbidden, "Only Verifiers and Admins can delete verified mechanisms."),
                QueryResult.ValidationError => BadRequest("Only verified mechanisms can be deleted via this endpoint."),
                QueryResult.ParseError => BadRequest("Invalid UUID format for user's name identifier claim"),
                QueryResult.OwnerNotFound => Unauthorized("User does not exist"),
                _ => NoContent(),
            };
        }

        [AllowAnonymous]
        [HttpGet("archived-versions")]
        public async Task<ActionResult<IEnumerable<ArchivedVerifiedVersionDto>>> GetArchivedVerifiedVersions()
        {
            var result = await familyService.GetArchivedVerifiedVersionsAsync();
            return Ok(result);
        }
    }
}
