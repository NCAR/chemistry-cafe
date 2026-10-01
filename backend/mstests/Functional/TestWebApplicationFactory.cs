using System.Security.Claims;
using System.Text.Encodings.Web;
using ChemistryCafeAPI.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace ChemistryCafeAPI.Tests.Functional
{
    public class TestAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions>
    {
        public const string SchemeName = "TestScheme";
        public const string AuthHeader = "X-Test-Authorized";
        public const string UserIdHeader = "X-Test-UserId";

        public TestAuthHandler(
            IOptionsMonitor<AuthenticationSchemeOptions> options,
            ILoggerFactory logger,
            UrlEncoder encoder)
            : base(options, logger, encoder)
        {
        }

        protected override Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            if (Request.Headers.TryGetValue(AuthHeader, out var isAuth) && isAuth == "true")
            {
                var userId = Request.Headers.TryGetValue(UserIdHeader, out var uid)
                    ? uid.ToString()
                    : TestWebApplicationFactory.TestUserId.ToString();

                var claims = new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, userId),
                    new Claim(ClaimTypes.Name, "Test User"),
                    new Claim(ClaimTypes.Email, "testuser@example.com")
                };
                var identity = new ClaimsIdentity(claims, SchemeName);
                var principal = new ClaimsPrincipal(identity);
                var ticket = new AuthenticationTicket(principal, SchemeName);

                return Task.FromResult(AuthenticateResult.Success(ticket));
            }

            return Task.FromResult(AuthenticateResult.NoResult());
        }
    }

    public class TestWebApplicationFactory : WebApplicationFactory<Program>
    {
        public static readonly Guid TestUserId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        public static readonly Guid TestFamilyId = Guid.Parse("22222222-2222-2222-2222-222222222222");

        static TestWebApplicationFactory()
        {
            Environment.SetEnvironmentVariable("MYSQL_USER", Environment.GetEnvironmentVariable("MYSQL_USER") ?? "chemistrycafedev");
            Environment.SetEnvironmentVariable("MYSQL_PASSWORD", Environment.GetEnvironmentVariable("MYSQL_PASSWORD") ?? "chemistrycafe");
            Environment.SetEnvironmentVariable("MYSQL_DATABASE", Environment.GetEnvironmentVariable("MYSQL_DATABASE") ?? "chemistry_db");
            Environment.SetEnvironmentVariable("SEED_DATABASE", "false");
            Environment.SetEnvironmentVariable("GOOGLE_CLIENT_ID", Environment.GetEnvironmentVariable("GOOGLE_CLIENT_ID") ?? "test-google-id");
            Environment.SetEnvironmentVariable("GOOGLE_CLIENT_SECRET", Environment.GetEnvironmentVariable("GOOGLE_CLIENT_SECRET") ?? "test-google-secret");
            Environment.SetEnvironmentVariable("ORCID_CLIENT_ID", Environment.GetEnvironmentVariable("ORCID_CLIENT_ID") ?? "test-orcid-id");
            Environment.SetEnvironmentVariable("ORCID_CLIENT_SECRET", Environment.GetEnvironmentVariable("ORCID_CLIENT_SECRET") ?? "test-orcid-secret");
        }

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            var currentDir = new DirectoryInfo(AppContext.BaseDirectory);
            builder.UseContentRoot(currentDir.FullName);

            builder.UseEnvironment("Testing");

            builder.ConfigureServices(services =>
            {
                // Remove existing ChemistryDbContext registration
                var descriptors = services.Where(d =>
                    d.ServiceType == typeof(DbContextOptions<ChemistryDbContext>) ||
                    d.ServiceType == typeof(DbContextOptions) ||
                    d.ServiceType == typeof(ChemistryDbContext)).ToList();

                foreach (var descriptor in descriptors)
                {
                    services.Remove(descriptor);
                }

                // Add in-memory DbContext
                services.AddDbContext<ChemistryDbContext>(options =>
                {
                    options.UseInMemoryDatabase("FunctionalTestDb");
                });

                // Configure test authentication
                services.PostConfigure<AuthenticationOptions>(options =>
                {
                    options.DefaultAuthenticateScheme = TestAuthHandler.SchemeName;
                    options.DefaultChallengeScheme = TestAuthHandler.SchemeName;
                    options.DefaultScheme = TestAuthHandler.SchemeName;
                });

                services.AddAuthentication()
                    .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>(
                        TestAuthHandler.SchemeName, _ => { });
            });
        }

        protected override IHost CreateHost(IHostBuilder builder)
        {
            var host = base.CreateHost(builder);

            using var scope = host.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ChemistryDbContext>();
            db.Database.EnsureCreated();

            if (!db.Users.Any(u => u.Id == TestUserId))
            {
                var testUser = new User
                {
                    Id = TestUserId,
                    Username = "testuser",
                    Email = "testuser@example.com",
                    Role = "user",
                    CreatedDate = DateTime.UtcNow
                };
                db.Users.Add(testUser);

                db.Families.Add(new Family
                {
                    Id = TestFamilyId,
                    Name = "Test Family",
                    Description = "Test Family Description",
                    Owner = testUser,
                    CreatedDate = DateTime.UtcNow
                });

                db.SaveChanges();
            }

            return host;
        }

        public HttpClient CreateMockClient(bool isAuthorized)
        {
            var client = CreateClient();
            if (isAuthorized)
            {
                client.DefaultRequestHeaders.Add(TestAuthHandler.AuthHeader, "true");
                client.DefaultRequestHeaders.Add(TestAuthHandler.UserIdHeader, TestUserId.ToString());
            }
            return client;
        }
    }
}
