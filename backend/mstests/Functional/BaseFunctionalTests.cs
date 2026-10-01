using System.Net.Http;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace ChemistryCafeAPI.Tests.Functional
{
    [TestClass]
    public abstract class BaseFunctionalTests
    {
        private static readonly TestWebApplicationFactory _factory = new();

        /// <summary>
        /// The active mock HTTP client for the test class or method.
        /// Can be configured as authorized or anonymous.
        /// </summary>
        protected HttpClient Client { get; set; }

        /// <summary>
        /// Mock HTTP client configured without authentication (anonymous).
        /// </summary>
        protected HttpClient AnonymousClient { get; }

        /// <summary>
        /// Mock HTTP client configured with test authentication headers (authorized).
        /// </summary>
        protected HttpClient AuthorizedClient { get; }

        protected BaseFunctionalTests(bool isAuthorized = false)
        {
            AnonymousClient = _factory.CreateMockClient(isAuthorized: false);
            AuthorizedClient = _factory.CreateMockClient(isAuthorized: true);
            Client = isAuthorized ? AuthorizedClient : AnonymousClient;
        }

        /// <summary>
        /// Creates a mock HTTP client, either authorized or anonymous.
        /// </summary>
        protected HttpClient CreateClient(bool isAuthorized)
        {
            return isAuthorized ? AuthorizedClient : AnonymousClient;
        }

        /// <summary>
        /// Switch the current Client between authorized and anonymous mode.
        /// </summary>
        protected void SetAuthorized(bool isAuthorized)
        {
            Client = isAuthorized ? AuthorizedClient : AnonymousClient;
        }
    }
}
