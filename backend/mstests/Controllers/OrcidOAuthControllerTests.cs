using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ChemistryCafeAPI.Controllers;
using ChemistryCafeAPI.Services;
using ChemistryCafeAPI.Models;
using MySqlConnector;
using System;
using System.Linq;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace ChemistryCafeAPI.Tests
{
    [TestClass]
    public class OrcidOAuthControllerTests
    {
        readonly ChemistryDbContext ctx = DBConnection.Context;
        
        [TestMethod]
        public Task LoginNonnull()
        {
            var userService = new UserService(ctx);
            var orcidService = new OrcidOAuthService(userService);
            var orcidController = new OrcidOAuthController(orcidService);
            Assert.IsNotNull(orcidController.LoginRedirect());
            return Task.CompletedTask;
        }
    }
}
