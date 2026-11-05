using System.Security.Claims;
using System.Text.Json;
using System.Text.RegularExpressions;
using ChemistryCafeAPI.Models;
using ChemistryCafeAPI.Models.Dtos;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;

namespace ChemistryCafeAPI.Services;

public partial class OAuthRegistrationService
{
    private const string CookieName = "CC_PendingRegistration";
    private readonly IDataProtector _protector;
    private readonly ChemistryDbContext _context;

    public const int MinUsernameLength = 3;
    public const int MaxUsernameLength = 50;

    [GeneratedRegex("^[a-zA-Z0-9_-]+$")]
    public static partial Regex UsernameRegex();

    [GeneratedRegex("[^a-zA-Z0-9_-]")]
    private static partial Regex InvalidUsernameCharsRegex();

    public OAuthRegistrationService(IDataProtectionProvider dataProtectionProvider, ChemistryDbContext context)
    {
        _protector = dataProtectionProvider.CreateProtector("ChemistryCafe.PendingRegistration");
        _context = context;
    }

    public void SetPendingRegistration(HttpContext httpContext, PendingRegistration pending)
    {
        string json = JsonSerializer.Serialize(pending);
        string protectedData = _protector.Protect(json);

        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            SameSite = SameSiteMode.Lax,
            Secure = httpContext.Request.IsHttps,
            Expires = DateTimeOffset.UtcNow.AddMinutes(30),
            Path = "/"
        };

        httpContext.Response.Cookies.Append(CookieName, protectedData, cookieOptions);
    }

    public PendingRegistration? GetPendingRegistration(HttpContext httpContext)
    {
        if (!httpContext.Request.Cookies.TryGetValue(CookieName, out var cookieValue) || string.IsNullOrEmpty(cookieValue))
        {
            return null;
        }

        try
        {
            string json = _protector.Unprotect(cookieValue);
            var pending = JsonSerializer.Deserialize<PendingRegistration>(json);
            if (pending != null && (DateTime.UtcNow - pending.CreatedAt) > TimeSpan.FromMinutes(30))
            {
                return null;
            }
            return pending;
        }
        catch
        {
            return null;
        }
    }

    public void ClearPendingRegistration(HttpContext httpContext)
    {
        httpContext.Response.Cookies.Delete(CookieName, new CookieOptions { Path = "/" });
    }

    public static string GenerateSuggestedUsername(string? seed)
    {
        if (string.IsNullOrWhiteSpace(seed))
        {
            return "user" + Random.Shared.Next(1000, 9999);
        }

        string baseName = seed;
        int atIndex = baseName.IndexOf('@');
        if (atIndex > 0)
        {
            baseName = baseName[..atIndex];
        }

        baseName = InvalidUsernameCharsRegex().Replace(baseName, "_");
        baseName = baseName.Trim('_');

        if (baseName.Length < MinUsernameLength)
        {
            baseName += "_user";
        }

        if (baseName.Length > MaxUsernameLength)
        {
            baseName = baseName[..MaxUsernameLength];
        }

        return baseName;
    }

    public static bool IsValidUsername(string? username)
    {
        if (string.IsNullOrWhiteSpace(username)) return false;
        string trimmed = username.Trim();
        if (trimmed.Length < MinUsernameLength || trimmed.Length > MaxUsernameLength) return false;
        return UsernameRegex().IsMatch(trimmed);
    }

    public async Task<(bool Available, string Message)> CheckUsernameAvailabilityAsync(string? username, Guid? excludeUserId = null)
    {
        if (string.IsNullOrWhiteSpace(username))
        {
            return (false, "Username is required.");
        }

        string trimmed = username.Trim();
        if (trimmed.Length < MinUsernameLength || trimmed.Length > MaxUsernameLength)
        {
            return (false, $"Username must be between {MinUsernameLength} and {MaxUsernameLength} characters.");
        }

        if (!UsernameRegex().IsMatch(trimmed))
        {
            return (false, "Username can only contain letters, numbers, underscores, and hyphens.");
        }

        bool taken = await _context.Users.AnyAsync(u =>
            (!excludeUserId.HasValue || u.Id != excludeUserId.Value) &&
            u.Username.ToLower() == trimmed.ToLower());

        if (taken)
        {
            return (false, "Username is already taken.");
        }

        return (true, "Username is available.");
    }

    public async Task<(bool Success, string? Error, User? User)> RegisterUserAsync(HttpContext httpContext, RegisterUserDto dto)
    {
        var pending = GetPendingRegistration(httpContext);
        if (pending == null)
        {
            return (false, "No pending registration found or your session has expired. Please sign in with OAuth again.", null);
        }

        var (available, message) = await CheckUsernameAvailabilityAsync(dto.Username);
        if (!available)
        {
            return (false, message, null);
        }

        // Check if an account already exists for this provider ID
        User? existingUser = pending.Provider switch
        {
            "Google" => await _context.Users.SingleOrDefaultAsync(u => u.GoogleId == pending.ProviderId),
            "Orcid" => await _context.Users.SingleOrDefaultAsync(u => u.OrcidId == pending.ProviderId),
            _ => null
        };

        if (existingUser != null)
        {
            await SignInUserAsync(httpContext, existingUser);
            ClearPendingRegistration(httpContext);
            return (true, null, existingUser);
        }

        var newUser = new User
        {
            Id = Guid.NewGuid(),
            Username = dto.Username.Trim(),
            Email = pending.Email,
            GoogleId = pending.Provider == "Google" ? pending.ProviderId : null,
            OrcidId = pending.Provider == "Orcid" ? pending.ProviderId : null,
            FirstName = !string.IsNullOrWhiteSpace(dto.FirstName) ? dto.FirstName.Trim() : pending.FirstName,
            LastName = !string.IsNullOrWhiteSpace(dto.LastName) ? dto.LastName.Trim() : pending.LastName,
            Role = Role.None,
            CreatedDate = DateTime.UtcNow
        };

        _context.Users.Add(newUser);
        await _context.SaveChangesAsync();

        await SignInUserAsync(httpContext, newUser);
        ClearPendingRegistration(httpContext);

        return (true, null, newUser);
    }

    private static async Task SignInUserAsync(HttpContext httpContext, User user)
    {
        var claimsIdentity = new ClaimsIdentity("Application");
        claimsIdentity.AddClaim(new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()));
        if (!string.IsNullOrEmpty(user.Email))
        {
            claimsIdentity.AddClaim(new Claim(ClaimTypes.Email, user.Email));
        }
        claimsIdentity.AddClaim(new Claim(ClaimTypes.Name, user.Username));
        claimsIdentity.AddClaim(new Claim(ClaimTypes.Role, user.Role.ToString()));

        await httpContext.SignInAsync("Application", new ClaimsPrincipal(claimsIdentity));
    }
}

