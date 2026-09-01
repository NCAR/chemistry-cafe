using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Diagnostics.CodeAnalysis;
using ChemistryCafeAPI.Services;
using ChemistryCafeAPI.Models;
using ChemistryCafeAPI.Models.Dto;
using ChemistryCafeAPI.Models.Mappers;

namespace ChemistryCafeAPI.Controllers
{
    [ApiController]
    [Route("api/families")]
    public class FamilyController : ControllerBase
    {
        private readonly FamilyService _familyService;

        [ExcludeFromCodeCoverage]
        protected virtual string? GetNameIdentifier()
        {
            ClaimsIdentity? claimsIdentity = this.User.Identity as ClaimsIdentity;
            return claimsIdentity?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }

        public FamilyController(FamilyService familyService)
        {
            _familyService = familyService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<FamilyDto>>>
            GetFamilies([FromQuery] bool? expand = false, [FromQuery] Guid? userId = null)
        {
            var bExpand = expand ?? false;
            var families = await _familyService.GetFamiliesAsync(bExpand, userId);
            return Ok(families.Select(f => f.ToDto()));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<FamilyDto>> GetFamily(Guid id)
        {
            var family = await _familyService.GetFamilyAsync(id);
            return family == null ? NotFound() : Ok(family.ToDto());
        }

        /// <summary>
        /// Creates a brand new family assigned to the user with a unique GUID
        /// The user is only able to specify the following fields:
        /// <list type="bullet">
        ///     <item>name</item>
        ///     <item>description</item>
        /// </list>
        /// Everything else is set to a default value when the family is created.
        /// </summary>
        /// <param name="family">Information that should be saved to the database</param>
        /// <returns>HTTP result</returns>
        [HttpPost]
        public async Task<ActionResult<FamilyDto>> CreateFamily(FamilyDto family)
        {
            string? nameIdentifier = GetNameIdentifier();
            if (nameIdentifier == null)
            {
                return Unauthorized("User is not authenticated");
            }

            Guid userId;
            bool isValidId = Guid.TryParse(nameIdentifier, out userId);
            if (!isValidId)
            {
                return BadRequest("Name identifier is not parsable as a guid");
            }

            var (code, createdFamily) = await _familyService.CreateFamilyAsync(family, userId);
            if (createdFamily == null)
            {
                return code switch
                {
                    QueryResult.OwnerNotFound => Unauthorized("User does not exist"),
                    QueryResult.ValidationError => BadRequest("The specified ID must be a valid, non-empty UUID."),
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
        /// </list>
        /// </summary>
        /// <param name="id">Database ID of the family to update</param>
        /// <param name="family">Information about the family to update</param>
        /// <returns>HTTP result</returns>
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
            var code = await _familyService.UpdateFamilyAsync(id, family, nameIdentifier);
            return code switch
            {
                QueryResult.NotFound => NotFound("Family not found"),
                QueryResult.NoAccess => StatusCode(StatusCodes.Status403Forbidden),
                _ => NoContent(),
            };

        }

        /// <summary>
        /// Deletes a given family if it is attributed to the current user
        /// </summary>
        /// <param name="id">Database ID of the family to delete</param>
        /// <returns>HTTP result</returns>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFamily(Guid id)
        {
            string? nameIdentifier = GetNameIdentifier();
            if (nameIdentifier == null)
            {
                return Unauthorized("User is not authenticated");
            }
            var code = await _familyService.DeleteFamilyAsync(id, nameIdentifier);
            return code switch
            {
                QueryResult.NotFound => NotFound("Family not found"),
                QueryResult.NoAccess => StatusCode(StatusCodes.Status403Forbidden),
                _ => NoContent(),
            };
        }
    }
}
