using Microsoft.VisualStudio.TestTools.UnitTesting;
using Microsoft.Extensions.Options;
using ChemistryCafeAPI.Options;
using ChemistryCafeAPI.Controllers;
using ChemistryCafeAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace ChemistryCafeAPI.Tests
{
    [TestClass]
    public class OptionsTests
    {
        [TestMethod]
        public void GoogleAuthOptions_IsConfigured_ReturnsExpected()
        {
            var options = new GoogleAuthOptions();
            Assert.IsFalse(options.IsConfigured);

            options.ClientId = "test-client-id";
            Assert.IsFalse(options.IsConfigured);

            options.ClientSecret = "test-client-secret";
            Assert.IsTrue(options.IsConfigured);
        }

        [TestMethod]
        public void OrcidAuthOptions_IsConfigured_ReturnsExpected()
        {
            var options = new OrcidAuthOptions();
            Assert.IsFalse(options.IsConfigured);

            options.ClientId = "test-client-id";
            Assert.IsFalse(options.IsConfigured);

            options.ClientSecret = "test-client-secret";
            Assert.IsTrue(options.IsConfigured);
        }

        [TestMethod]
        public void UrlOptions_Defaults_AreSet()
        {
            var options = new UrlOptions();
            Assert.AreEqual("http://localhost:5173", options.FrontendHost);
            Assert.AreEqual("/", options.BackendBaseUrl);
        }

        [TestMethod]
        public void DatabaseOptions_BuildsExpectedConnectionString()
        {
            var options = new DatabaseOptions
            {
                Server = "db.example.com",
                Port = "3307",
                User = "admin",
                Password = "secretpassword",
                Database = "app_db"
            };

            Assert.AreEqual(
                "Server=db.example.com;Port=3307;Database=app_db;User=admin;Password=secretpassword;AllowUserVariables=True;UseAffectedRows=False;",
                options.ConnectionString
            );
        }

        [TestMethod]
        public void GoogleOAuthController_UsesInjectedUrlOptions()
        {
            var customUrls = Microsoft.Extensions.Options.Options.Create(new UrlOptions
            {
                FrontendHost = "https://chemcafe.ucar.edu",
                BackendBaseUrl = "/api"
            });

            var userService = new UserService(null!);
            var googleService = new GoogleOAuthService(userService);
            var controller = new GoogleOAuthController(googleService, userService, customUrls);

            var result = controller.LoginRedirect() as ChallengeResult;
            Assert.IsNotNull(result);
            Assert.IsNotNull(result.Properties);
            Assert.AreEqual("/api/auth/google/authenticate", result.Properties.RedirectUri);
        }

        [TestMethod]
        public void OrcidOAuthController_UsesInjectedUrlOptions()
        {
            var customUrls = Microsoft.Extensions.Options.Options.Create(new UrlOptions
            {
                FrontendHost = "https://chemcafe.ucar.edu",
                BackendBaseUrl = "/api"
            });

            var userService = new UserService(null!);
            var orcidService = new OrcidOAuthService(userService);
            var controller = new OrcidOAuthController(orcidService, userService, customUrls);

            var result = controller.LoginRedirect() as ChallengeResult;
            Assert.IsNotNull(result);
            Assert.IsNotNull(result.Properties);
            Assert.AreEqual("/api/auth/orcid/authenticate", result.Properties.RedirectUri);
        }

        [TestMethod]
        public void UserService_GetNameIdentifier_WithHttpContext_ReturnsClaimValue()
        {
            var testId = Guid.NewGuid().ToString();
            var httpContext = new Microsoft.AspNetCore.Http.DefaultHttpContext();
            httpContext.User = new System.Security.Claims.ClaimsPrincipal(
                new System.Security.Claims.ClaimsIdentity([
                    new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.NameIdentifier, testId)
                ], "TestAuth")
            );

            var accessor = new Microsoft.AspNetCore.Http.HttpContextAccessor { HttpContext = httpContext };
            var userService = new UserService(null!, accessor);

            Assert.AreEqual(testId, userService.GetNameIdentifier());
        }

        [TestMethod]
        public async Task UserService_GetCurrentUserAsync_WithoutClaim_ReturnsNull()
        {
            var userService = new UserService(null!);
            var (result, user) = await userService.GetCurrentUserAsync();
            Assert.AreEqual(QueryResult.NotFound, result);
            Assert.IsNull(user);
        }
    }
}
