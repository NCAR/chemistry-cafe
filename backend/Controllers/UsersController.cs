using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using ChemistryCafeAPI.Models;
using ChemistryCafeAPI.Services;

namespace ChemistryCafeAPI.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class UsersController : ControllerBase
    {
        private readonly UserService _userService;

        public UsersController(UserService userService)
        {
            _userService = userService;
        }

        // GET: api/Users
        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            var users = await _userService.GetUsersAsync();
            return Ok(users);
        }

        [HttpGet("id/{id}")]
        public async Task<ActionResult<User>> GetUserById(Guid id) 
        {
            var user = await _userService.GetUserByIdAsync(id);

            if (user == null) {
                return NotFound();
            }
            return Ok(user);
        }

        // GET: api/Users/5
        [HttpGet("email/{email}")]
        public async Task<ActionResult<User>> GetUser(string email)
        {
            var user = await _userService.GetUserByEmailAsync(email);

            if (user == null)
            {
                return NotFound();
            }

            return Ok(user);
        }

        // PUT: api/Users/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(Guid id, User user)
        {
            if(id != user.Id) {
                return BadRequest();
            }
            await _userService.UpdateUserAsync(user);

            return NoContent();
        }

        // DELETE: api/Users/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            await _userService.DeleteUserAsync(id);
            return NoContent();
        }
    }
}
